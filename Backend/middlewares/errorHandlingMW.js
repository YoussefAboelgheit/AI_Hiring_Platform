<<<<<<< HEAD
import multer from "multer";

=======
>>>>>>> d6a51689069641f972c8a9b5a39df1b3c9fc4a0c
export default (err, req, res, next) => {
  console.error("Error:", err.message);
  if (process.env.NODE_ENV === "development") console.error(err.stack);

  let statusCode = err.status || 500;
<<<<<<< HEAD
  let message    = err.message || "Internal Server Error";
  let errors     = err.errors;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message    = "Validation Error";

    let userFriendlyMsg = err.message;
    if (err.code === "LIMIT_FILE_SIZE") {
      userFriendlyMsg = "File size must be less than 50 MB";
    } else if (err.message === "Field name missing") {
      userFriendlyMsg = "One of the form-data fields has an empty key name. Please check your Postman request body keys.";
    }

    errors = [{ type: "field", msg: userFriendlyMsg, path: "form-data", location: "body" }];

    return res.status(statusCode).json({ status: "error", message, errors });
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message    = "Validation failed";
    errors     = Object.values(err.errors).map((el) => ({
      field:   el.path,
=======
  let message = err.message || "Internal Server Error";
  let errors = err.errors;

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((el) => ({
      field: el.path,
>>>>>>> d6a51689069641f972c8a9b5a39df1b3c9fc4a0c
      message: el.message,
    }));
  }

  if (err.code === 11000) {
<<<<<<< HEAD
    statusCode    = 409;
    const field   = Object.keys(err.keyValue)[0];
    const value   = err.keyValue[field];
    message       = `${field} '${value}' is already taken`;
=======
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `${field} '${value}' is already taken`;
>>>>>>> d6a51689069641f972c8a9b5a39df1b3c9fc4a0c
  }

  if (err.name === "CastError") {
    statusCode = 400;
<<<<<<< HEAD
    message    = `Invalid value for field '${err.path}': ${err.value}`;
  }

=======
    message = `Invalid value for field '${err.path}': ${err.value}`;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Validation Error";
    errors = [
      {
        type: "field",
        msg: "File size must be less than 50 MB",
        path: "file",
        location: "body"
      }
    ];
  } else if (
    err.message === "Field name missing" ||
    err.message === "Unexpected end of multipart data" ||
    err.code?.startsWith("LIMIT_")
  ) {
    statusCode = 400;
    message = "Validation Error";
    
    let userFriendlyMsg = err.message;
    if (err.message === "Field name missing") {
      userFriendlyMsg = "One of the form-data fields is checked but has an empty key name. Please check your Postman request body keys.";
    }
    
    errors = [
      {
        type: "field",
        msg: userFriendlyMsg,
        path: "form-data",
        location: "body"
      }
    ];
  }


>>>>>>> d6a51689069641f972c8a9b5a39df1b3c9fc4a0c
  return res.status(statusCode).json({
    status: "error",
    message,
    ...(errors && { errors }),
  });
<<<<<<< HEAD
};
=======
};
>>>>>>> d6a51689069641f972c8a9b5a39df1b3c9fc4a0c
