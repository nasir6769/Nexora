import { sendError } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  if (process.env.NODE_ENV !== "test") {
    console.error(`[Error] ${err.name || "Error"}: ${err.message}`);
    if (process.env.NODE_ENV === "development" && err.stack) {
      console.error(err.stack);
    }
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    return sendError(res, 404, message);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = `Duplicate value entered for '${field}'. Please use another value.`;
    return sendError(res, 409, message, [{ field, message }]);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return sendError(res, 400, "Validation failed", errors);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired");
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return sendError(res, statusCode, message, err.errors || null);
};

export const notFoundHandler = (req, res) => {
  return sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};
