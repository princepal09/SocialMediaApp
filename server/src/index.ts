import { app } from "./app.js";
import dotenv from 'dotenv'
import dbConnect from "./config/db.js";
import { error } from "console";
dotenv.config()

const PORT = process.env.PORT || 5001;

dbConnect
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error("❌ MongoDB connection failed:", err);
  });