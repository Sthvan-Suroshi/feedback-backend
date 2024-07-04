import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin:"http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//importing routes
import userRoutes from "./routes/user.routes.js";
import imageRoutes from "./routes/imageFeedback.routes.js";

//route declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/imageFeedback", imageRoutes);

export { app };
