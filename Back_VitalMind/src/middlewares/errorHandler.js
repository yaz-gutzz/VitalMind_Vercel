export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Not Found", message: "Ruta no encontrada" });
}

export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || error.status || 500;
  res.status(status).json({ error: status >= 500 ? "Internal Server Error" : "Request Error", message: error.message || "Error inesperado" });
}