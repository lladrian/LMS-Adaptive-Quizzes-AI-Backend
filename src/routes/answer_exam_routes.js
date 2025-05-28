import { Router } from "express";
import * as AnswerController from '../controllers/answer_exam_controller.js'; // Import the controller

const answerExamRoutes = Router();

answerExamRoutes.get('/get_all_answer_specific_exam/:exam_id', AnswerController.get_all_answer_specific_exam);
answerExamRoutes.get('/get_specific_answer/:answer_id', AnswerController.get_specific_answer);
answerExamRoutes.post('/add_answer/:exam_id/:student_id', AnswerController.create_answer);
answerExamRoutes.post('/take_exam/:exam_id/:student_id', AnswerController.take_exam);
answerExamRoutes.put('/update_specific_student_exam_points/:answer_quiz_id', AnswerController.update_specific_student_exam_points);



export default answerExamRoutes;
