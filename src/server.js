import express from 'express';
import dotenv from 'dotenv';
import connectDB from "./config/db.js";

import adminRoutes from "./routes/admin_routes.js";
import instructorRoutes from "./routes/instructor_routes.js";
import studentRoutes from "./routes/student_routes.js";
import classroomRoutes from "./routes/classroom_routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/admins", adminRoutes);
app.use("/instructors", instructorRoutes);
app.use("/students", studentRoutes);
app.use("/classrooms", classroomRoutes);

connectDB();

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default app;

