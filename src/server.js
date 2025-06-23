import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

import adminRoutes from "./routes/admin_routes.js";
import aiRoutes from "./routes/ai_routes.js";
import classroomRoutes from "./routes/classroom_routes.js";
import compilerRoutes from "./routes/compiler_routes.js";
import extendRoutes from "./routes/extends_routes.js";
import gradeRoutes from "./routes/grade_routes.js";
import instructorRoutes from "./routes/instructor_routes.js";
import languageRoutes from "./routes/language_routes.js";
import loginRoutes from "./routes/login_routes.js";
import mainActivityRoutes from "./routes/main_activity_routes.js";
import mainAnswerRoutes from "./routes/main_answer_routes.js";
import materialRoutes from "./routes/material_routes.js";
import otp_routes from "./routes/otp_routes.js";
import promoteRoutes from "./routes/promote_routes.js";
import studentRoutes from "./routes/student_routes.js";

import path from "path"; // Import the path module
import fs from "fs"; // Import fs to check if the directory exists
import { fileURLToPath } from "url"; // Import fileURLToPath
import { dirname, join } from "path"; // Import dirname

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use((req, res, next) => {
  req.setTimeout(2 * 60 * 1000); // 2 minutes
  next();
});

app.use("/admins", adminRoutes);
app.use("/ai", aiRoutes);
app.use("/classrooms", classroomRoutes);
app.use("/compilers", compilerRoutes);
app.use("/extends", extendRoutes);
app.use("/grades", gradeRoutes);
app.use("/instructors", instructorRoutes);
app.use("/languages", languageRoutes);
app.use("/logins", loginRoutes);
app.use("/main_activity", mainActivityRoutes);
app.use("/main_answer", mainAnswerRoutes);
app.use("/materials", materialRoutes);
app.use("/otp", otp_routes);
app.use("/promotes", promoteRoutes);
app.use("/students", studentRoutes);

connectDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
