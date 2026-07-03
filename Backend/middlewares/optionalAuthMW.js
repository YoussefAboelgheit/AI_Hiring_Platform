import jwt from "jsonwebtoken";
import User from "../models/user.js";
import BlacklistedToken from "../models/blacklistedToken.js";

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) return next();

    const isBlacklisted = await BlacklistedToken.findOne({ token: accessToken });
    if (isBlacklisted) return next();

    let payload;
    try {
      payload = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
    } catch {
      return next();
    }

    const user = await User.findById(payload.userId).select("-password");
    if (!user) return next();

    req.user = user;
    next();
  } catch {
    next();
  }
};
