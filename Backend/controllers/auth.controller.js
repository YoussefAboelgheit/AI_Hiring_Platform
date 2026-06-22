import jwt from "jsonwebtoken";
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";
import HTTPError from "../util/httpError.js";
import { uploadToSupabase } from "../util/supabaseClient.js";
import crypto from "crypto";
import PasswordResetToken from "../models/passwordResetToken.js";
import { sendEmail } from "../util/sendEmail.js";



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
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};


const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userRole = role === "hr" ? "hr" : "candidate";

    let companyLogoUrl  = "";
    let profileImageUrl = "";
    let cvUrl           = "";

    if (userRole === "hr") {
      if (req.files?.company_logo?.[0]) {
        const file = req.files.company_logo[0];
        companyLogoUrl = await uploadToSupabase(file.buffer, file.mimetype, "logos");
      }
    } else {
      if (req.files?.profile_image?.[0]) {
        const imgFile   = req.files.profile_image[0];
        profileImageUrl = await uploadToSupabase(imgFile.buffer, imgFile.mimetype, "avatars");
      }
      if (req.files?.CV?.[0]) {
        const cvFile = req.files.CV[0];
        cvUrl        = await uploadToSupabase(cvFile.buffer, cvFile.mimetype, "cvs");
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role:          userRole,
      company_logo:  companyLogoUrl,
      profile_image: profileImageUrl,
      CV:            cvUrl,
    });

    const rawToken = crypto.randomBytes(32).toString("hex");

    await EmailVerificationToken.create({
      user:      user._id,
      token:     rawToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}&userId=${user._id}`;

    try {
      await sendEmail({
        to:      user.email,
        subject: "Verify your email address",
        html: `
          <h2>Welcome ${user.name}!</h2>
          <p>Please verify your email by clicking the link below. It expires in 24 hours.</p>
          <a href="${verifyLink}">${verifyLink}</a>
          <p>If you didn't create an account, ignore this email.</p>
        `,
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
      await EmailVerificationToken.deleteMany({ user: user._id });
      await User.findByIdAndDelete(user._id);
      return next(new HTTPError(500, "Failed to send verification email. Please use a valid email address."));
    }

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
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_logo: user.company_logo,
        profile_image: user.profile_image,
        CV:            user.CV,
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

    const userTokens = await RefreshToken.find({ user: payload.userId });
    const comparisons = await Promise.all(userTokens.map((t) => t.compareToken(rawRefreshToken)));
    const matchedIndex = comparisons.findIndex((match) => match === true);

    if (matchedIndex === -1) return next(new HTTPError(401, "Refresh token not found"));

    await RefreshToken.findByIdAndDelete(userTokens[matchedIndex]._id);

    const authHeader = req.headers.authorization;
    if (authHeader) {
      const accessToken = authHeader.split(" ")[1];
      try {
        const accessPayload = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
        await BlacklistedToken.create({
          token:     accessToken,
          expiresAt: new Date(accessPayload.exp * 1000),
        });
      } catch (err) {
        // token already expired, no need to blacklist
      }
    }

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

    const userTokens = await RefreshToken.find({ user: payload.userId });
    const comparisons = await Promise.all(userTokens.map((t) => t.compareToken(rawRefreshToken)));
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

export const resetPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatched = await user.comparePassword(currentPassword);
    if (!isMatched) return next(new HTTPError(401, "Current password is incorrect"));

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};

// Step 1: User requests password reset
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // always return success even if email not found (security best practice)
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    // delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ user: user._id });

    // generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // save hashed token to DB
    await PasswordResetToken.create({
      user: user._id,
      token: rawToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&userId=${user._id}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. It expires in 15 minutes.</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return res.status(200).json({
      message: "If this email exists, a reset link has been sent",
    });
  } catch (err) {
    next(err);
  }
};

// Step 2: User submits new password with token
export const confirmForgotPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const userId = req.user._id;

    const resetTokens = await PasswordResetToken.find({ user: userId });
    if (!resetTokens.length) return next(new HTTPError(400, "Invalid or expired token"));

    const comparisons = await Promise.all(resetTokens.map((t) => t.compareToken(token)));
    const matchedIndex = comparisons.findIndex((match) => match === true);

    if (matchedIndex === -1) return next(new HTTPError(400, "Invalid or expired token"));

    const matched = resetTokens[matchedIndex];

    if (matched.expiresAt < new Date()) {
      await PasswordResetToken.findByIdAndDelete(matched._id);
      return next(new HTTPError(400, "Reset token has expired"));
    }

    const user = await User.findById(userId);
    if (!user) return next(new HTTPError(404, "User not found"));

    user.password = newPassword;
    await user.save();

    await PasswordResetToken.findByIdAndDelete(matched._id);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};