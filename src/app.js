import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
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
import formRoutes from "./routes/form.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js"
//route declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/imageFeedbacks", imageRoutes);
app.use("/api/v1/forms", formRoutes);
app.use("/api/v1/feedbacks", feedbackRoutes);

export { app };
