import express from 'express';
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import cors from 'cors';


import adminRoutes from "./routes/admin_routes.js";
import instructorRoutes from "./routes/instructor_routes.js";
import studentRoutes from "./routes/student_routes.js";
import classroomRoutes from "./routes/classroom_routes.js";
import aiRoutes from "./routes/ai_routes.js";
import examRoutes from "./routes/exam_routes.js";
import answerExamRoutes from "./routes/answer_exam_routes.js";
import answerQuizRoutes from "./routes/answer_quiz_routes.js";
import compilerRoutes from "./routes/compiler_routes.js";
import languageRoutes from "./routes/language_routes.js";
import practiceExamRoutes from "./routes/practice_exam_routes.js";
import materialRoutes from "./routes/material_routes.js";
import loginRoutes from "./routes/login_routes.js";
import quizRoutes from "./routes/quiz_routes.js";






dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/admins", adminRoutes);
app.use("/instructors", instructorRoutes);
app.use("/students", studentRoutes);
app.use("/classrooms", classroomRoutes);
app.use("/ai", aiRoutes);
app.use("/exams", examRoutes);
app.use("/answer_exams", answerExamRoutes);
app.use("/answer_quizzes", answerQuizRoutes);
app.use("/compilers", compilerRoutes);
app.use("/languages", languageRoutes);
app.use("/practice_exams", practiceExamRoutes);
app.use("/materials", materialRoutes);
app.use("/logins", loginRoutes);
app.use("/quizzes", quizRoutes);




connectDB();

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default app;

