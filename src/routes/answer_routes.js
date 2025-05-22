import { Router } from "express";
import * as AnswerController from '../controllers/answer_controller.js'; // Import the controller

const answerRoutes = Router();

answerRoutes.get('/get_all_answer_specific_exam/:exam_id', AnswerController.get_all_answer_specific_exam);
answerRoutes.get('/get_specific_answer/:answer_id', AnswerController.get_specific_answer);
answerRoutes.post('/add_answer/:exam_id/:student_id', AnswerController.create_answer);
answerRoutes.post('/take_exam/:exam_id/:student_id', AnswerController.take_exam);


export default answerRoutes;
