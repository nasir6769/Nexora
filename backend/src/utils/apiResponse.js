export const sendSuccess = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    // If data is an array or object, keep it compatible
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
