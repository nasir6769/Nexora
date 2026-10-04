import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`  B2B Merchant Network Backend Server`);
      console.log(`  Port: http://localhost:${PORT}`);
      console.log(`  API:  http://localhost:${PORT}/api`);
      console.log(`  Docs: http://localhost:${PORT}/api-docs`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
