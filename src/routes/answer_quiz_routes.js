import { Router } from "express";
import * as AnswerController from '../controllers/answer_quiz_controller.js'; // Import the controller

const answerQuizRoutes = Router();

answerQuizRoutes.get('/get_all_answer_specific_quiz/:quiz_id', AnswerController.get_all_answer_specific_quiz);
answerQuizRoutes.get('/get_specific_answer/:answer_id', AnswerController.get_specific_answer);
answerQuizRoutes.post('/add_answer/:exam_id/:student_id', AnswerController.create_answer);
answerQuizRoutes.post('/take_quiz/:exam_id/:student_id', AnswerController.take_quiz);
answerQuizRoutes.put('/update_specific_student_quiz_points/:answer_quiz_id', AnswerController.update_specific_student_quiz_points);


export default answerQuizRoutes;
