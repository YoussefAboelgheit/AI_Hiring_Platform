export default (err, req, res, next) => {
  console.error("Error:", err.message);
  if (process.env.NODE_ENV === "development") console.error(err.stack);

  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `${field} '${value}' is already taken`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field '${err.path}': ${err.value}`;
  }


  return res.status(statusCode).json({
    status: "error",
    message,
    ...(errors && { errors }),
  });
};
