import { Router } from "express";
import * as AnswerController from '../controllers/answer_quiz_controller.js'; // Import the controller

const answerQuizRoutes = Router();

answerQuizRoutes.get('/get_all_answer_specific_exam/:exam_id', AnswerController.get_all_answer_specific_exam);
answerQuizRoutes.get('/get_specific_answer/:answer_id', AnswerController.get_specific_answer);
answerQuizRoutes.post('/add_answer/:exam_id/:student_id', AnswerController.create_answer);
answerQuizRoutes.post('/take_exam/:exam_id/:student_id', AnswerController.take_exam);


export default answerQuizRoutes;
