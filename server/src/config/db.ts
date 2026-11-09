import mongoose from "mongoose";
import { DB_NAME, env } from "../constants.js";

export default async function dbConnect() {
  await mongoose.connect(env.MONGO_URI, {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 10_000,
  });
}
