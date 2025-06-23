import { Router } from "express";
import * as MainAnswerController from "../controllers/main_answer_controller.js"; // Ensure the path is correct

const mainAnswerRoutes = Router();

// Route to take an activity (start answering)
mainAnswerRoutes.get(
  "/take_activity/:activity_id/:student_id",
  MainAnswerController.take_activity
);

// Get all answers for a specific student in a specific classroom
mainAnswerRoutes.get(
  "/get_all_answer_specific_student_specific_classroom/:classroom_id/:student_id",
  MainAnswerController.get_all_answer_specific_student_specific_classroom
);

// Get all answers for a specific activity
mainAnswerRoutes.get(
  "/get_all_answer_specific_activity/:activity_id",
  MainAnswerController.get_all_answer_specific_activity
);

// Get all students who haven't submitted answers for a specific activity
mainAnswerRoutes.get(
  "/get_all_student_missing_answer_specific_activity/:activity_id",
  MainAnswerController.get_all_student_missing_answer_specific_activity
);

// Get a specific answer by answer ID
mainAnswerRoutes.get(
  "/get_specific_answer/:answer_id",
  MainAnswerController.get_specific_answer
);

// Submit answers for a specific activity by a student
mainAnswerRoutes.post(
  "/add_answer/:activity_id/:student_id",
  MainAnswerController.create_answer
);

// Grade an answer
mainAnswerRoutes.post(
  "/grade_answer/:answer_id",
  MainAnswerController.grade_answer
);

export default mainAnswerRoutes;
