export default (req, res, next) => {
  return res.status(404).json({
    status: "error",
    message: `Endpoint '${req.method} ${req.originalUrl}' not found`,
  });
};
