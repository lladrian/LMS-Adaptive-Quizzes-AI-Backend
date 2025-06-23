import { Router } from "express";
import * as MainAnswerController from '../controllers/main_answer_controller.js'; // Import the controller

const mainAnswerRoutes = Router();

mainAnswerRoutes.get('/get_all_answer_specific_student_specific_classroom/:classroom_id/:student_id', MainAnswerController.get_all_answer_specific_student_specific_classroom);
mainAnswerRoutes.get('/get_all_answer_specific_exam/:exam_id', MainAnswerController.get_all_answer_specific_exam);
mainAnswerRoutes.get('/get_all_student_missing_answer_specific_exam/:exam_id', MainAnswerController.get_all_student_missing_answer_specific_activity);
mainAnswerRoutes.get('/get_specific_answer/:answer_id', MainAnswerController.get_specific_answer);
mainAnswerRoutes.post('/add_answer/:exam_id/:student_id', MainAnswerController.create_answer);
mainAnswerRoutes.get('/take_exam/:exam_id/:student_id', MainAnswerController.take_exam);

export default mainAnswerRoutes;
