function errorHandler(err, req, res, next) {
  console.error("[ERROR] " + err.message);
  res.status(500).json({
    error: "Something went wrong.",
    message: err.message
  });
}

function notFound(req, res) {
  res.status(404).json({
    error: "Route not found: " + req.method + " " + req.originalUrl
  });
}

module.exports = { errorHandler, notFound };
