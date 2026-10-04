import { sendError } from "../utils/apiResponse.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 401, "Authentication required");
    }

    const userRole = req.user.role.toLowerCase();
    const normalizedRoles = roles.map((r) => r.toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return sendError(
        res,
        403,
        `Access denied. Requires one of [${roles.join(", ")}] role.`
      );
    }

    next();
  };
};
