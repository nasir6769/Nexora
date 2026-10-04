import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "super_secret_merchant_network_jwt_key_2026_secure";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      id: user._id || user.id,
      userId: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    secret,
    { expiresIn }
  );
};
