import jwt from "jsonwebtoken";
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";
import HTTPError from "../util/httpError.js";

 
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXP }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXP }
  );

  await RefreshToken.create({
    token:     refreshToken,
    user:      user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

 
const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
};


export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role: role === "hr" ? "hr" : "candidate"
    });

    return res.status(201).json({
      message: "Account created successfully. Please log in.",
    });
  } catch (err) {
    next(err);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new HTTPError(401, "Invalid email or password"));

    const isMatched = await user.comparePassword(password);
    if (!isMatched) return next(new HTTPError(401, "Invalid email or password"));

    const { accessToken, refreshToken } = await generateTokens(user);

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        _id:  user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken) return next(new HTTPError(400, "Refresh token required"));

    let payload;
    try {
      payload = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    } catch (err) {
      return next(new HTTPError(401, "Invalid refresh token"));
    }

    const userTokens  = await RefreshToken.find({ user: payload.userId });
    const comparisons = await Promise.all(userTokens.map((t) => t.compareToken(rawRefreshToken)));
    const matchedIndex = comparisons.findIndex((match) => match === true);

    if (matchedIndex === -1) return next(new HTTPError(401, "Refresh token not found"));

    await RefreshToken.findByIdAndDelete(userTokens[matchedIndex]._id);

    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "strict" });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};


export const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken) return next(new HTTPError(400, "Refresh token required"));

    let payload;
    try {
      payload = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    } catch (err) {
      return next(new HTTPError(401, "Invalid or expired refresh token"));
    }

    const userTokens   = await RefreshToken.find({ user: payload.userId });
    const comparisons  = await Promise.all(userTokens.map((t) => t.compareToken(rawRefreshToken)));
    const matchedIndex = comparisons.findIndex((match) => match === true);

    if (matchedIndex === -1) return next(new HTTPError(401, "Refresh token not found"));

    const user = await User.findById(payload.userId).select("-password");
    if (!user) return next(new HTTPError(404, "User not found"));

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXP }
    );

    setRefreshCookie(res, rawRefreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};


export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (err) {
    next(err);
  }
};
