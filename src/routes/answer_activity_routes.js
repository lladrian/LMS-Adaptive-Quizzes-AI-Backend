import { Router } from "express";
import * as AnswerController from '../controllers/answer_activity_controller.js'; // Import the controller

const answerActivityRoutes = Router();

answerActivityRoutes.get('/get_all_answer_specific_student_specific_classroom/:classroom_id/:student_id', AnswerController.get_all_answer_specific_student_specific_classroom);
answerActivityRoutes.get('/get_all_answer_specific_activity/:material_id', AnswerController.get_all_answer_specific_activity);
answerActivityRoutes.get('/get_all_student_missing_answer_specific_activity/:material_id', AnswerController.get_all_student_missing_answer_specific_activity);
answerActivityRoutes.get('/get_specific_answer/:answer_id', AnswerController.get_specific_answer);
answerActivityRoutes.post('/add_answer/:material_id/:student_id', AnswerController.create_answer);

export default answerActivityRoutes;
