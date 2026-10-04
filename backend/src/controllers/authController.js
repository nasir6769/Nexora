import * as authService from "../services/authService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, 201, "User registered successfully", result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    // Return compatible format for frontend (user, accessToken, token)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken,
      token: result.token,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id || req.user.id);
    // Return compatible structure
    return res.status(200).json({
      success: true,
      ...user,
      user,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};
