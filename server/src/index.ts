import { app } from "./app.js";
import dotenv from "dotenv";
import dbConnect from "./config/db.js";
dotenv.config();

const PORT = process.env.PORT || 5001;

dbConnect()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    server.on("error", (error) => {
      console.error("Server Error", error);
      process.exit(1);
    });
  })
  .catch((err: any) => {
    console.error("MongoDB connection failed:", err);
  });
