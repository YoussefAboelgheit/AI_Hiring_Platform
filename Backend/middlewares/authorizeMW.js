import HTTPError from "../util/httpError.js";


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(new HTTPError(401, "Authentication required"));

    if (!roles.includes(req.user.role)) {
      return next(new HTTPError(403, "Insufficient permissions"));
    }

    next();
  };
};