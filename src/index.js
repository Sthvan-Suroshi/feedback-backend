import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 7000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed!", error);
    process.exit(1);
  });
