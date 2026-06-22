import { validationResult } from "express-validator";
import HTTPError from "../util/httpError.js";


export default (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const customError = new HTTPError(400, "Validation Error");
    customError.errors = errors.array();
    return next(customError);
  }

  next();
};
