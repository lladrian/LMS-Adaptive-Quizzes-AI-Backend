import { Router } from "express";
import * as AnswerController from "../controllers/answer_activity_controller.js"; // Changed to activity controller

const answerActivityRoutes = Router();

answerActivityRoutes.get(
  "/get_all_answer_specific_student_specific_classroom/:classroom_id/:student_id",
  AnswerController.get_all_answer_specific_student_specific_classroom
);

answerActivityRoutes.get(
  "/get_all_answer_specific_activity/:activity_id",
  AnswerController.get_all_answer_specific_activity
);

answerActivityRoutes.get(
  "/get_all_student_missing_answer_specific_activity/:activity_id",
  AnswerController.get_all_student_missing_answer_specific_activity
);

answerActivityRoutes.get(
  "/get_specific_answer/:answer_id",
  AnswerController.get_specific_answer
);

answerActivityRoutes.post(
  "/add_answer/:activity_id/:student_id",
  AnswerController.create_answer
);

// Optional if you use an "option-based" answer route
// answerActivityRoutes.post('/add_answer_option/:activity_id/:student_id', AnswerController.create_answer_option);

answerActivityRoutes.get(
  "/take_activity/:activity_id/:student_id",
  AnswerController.take_activity
);

answerActivityRoutes.put(
  "/update_specific_student_activity_points/:answer_activity_id",
  AnswerController.update_specific_student_activity_points
);

export default answerActivityRoutes;
