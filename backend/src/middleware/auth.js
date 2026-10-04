import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { sendError } from "../utils/apiResponse.js";

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(res, 401, "Authentication token is required");
    }

    const secret = process.env.JWT_SECRET || "super_secret_merchant_network_jwt_key_2026_secure";
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id || decoded.userId);

    if (!user) {
      return sendError(res, 401, "User belonging to this token no longer exists");
    }

    if (user.status === "inactive" || user.status === "suspended") {
      return sendError(res, 403, "Your account has been deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Invalid authentication token");
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Authentication token expired. Please login again.");
    }
    return sendError(res, 401, "Authentication failed");
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token || token.startsWith("demo-token-")) {
      req.user = null;
      return next();
    }

    const secret = process.env.JWT_SECRET || "super_secret_merchant_network_jwt_key_2026_secure";
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id || decoded.userId);
    req.user = user || null;
    next();
  } catch {
    // Graceful continuation for logout/public operations
    req.user = null;
    next();
  }
};

