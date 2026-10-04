import { User } from "../models/User.js";
import { generateToken } from "../utils/token.js";

export const register = async ({ name, email, password, role = "merchant", phone, companyName }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error("An account with this email address already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role.toLowerCase(),
    phone,
    companyName,
  });

  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      companyName: user.companyName,
      address: user.address,
    },
    accessToken: token,
    token,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "inactive" || user.status === "suspended") {
    const error = new Error("Your account has been deactivated. Please contact support.");
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      companyName: user.companyName,
      address: user.address,
    },
    accessToken: token,
    token,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    companyName: user.companyName,
    address: user.address,
  };
};
