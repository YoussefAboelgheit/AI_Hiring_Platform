import jwt from "jsonwebtoken";
import User from "../models/user.js";
import BlacklistedToken from "../models/blacklistedToken.js";
import HTTPError from "../util/httpError.js";

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next(new HTTPError(401, "No token provided"));

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) return next(new HTTPError(401, "No token provided"));

    // check if token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token: accessToken });
    if (isBlacklisted) return next(new HTTPError(401, "Token is no longer valid. Please log in again."));

    let payload;
    try {
      payload = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
    } catch (err) {
      return next(new HTTPError(401, err.message));
    }

    const user = await User.findById(payload.userId).select("-password");
    if (!user) return next(new HTTPError(404, "User not found"));

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};