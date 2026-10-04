import mongoose from "mongoose";

export const connectDB = async (uri) => {
  const dbUri = uri || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/merchant_network";
  try {
    const conn = await mongoose.connect(dbUri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("[MongoDB] Disconnected successfully");
  } catch (error) {
    console.error(`[MongoDB] Disconnect error: ${error.message}`);
  }
};
