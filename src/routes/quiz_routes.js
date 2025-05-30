import { Router } from "express";
import * as QuizController from '../controllers/quiz_controller.js'; // Import the controller

const quizRoutes = Router();

quizRoutes.get('/get_specific_quiz_specific_answer/:quiz_id/:student_id', QuizController.get_specific_quiz_specific_answer);
quizRoutes.get('/get_all_quiz_specific_classroom/:classroom_id', QuizController.get_all_quiz_specific_classroom);
quizRoutes.get('/get_specific_quiz/:quiz_id', QuizController.get_specific_quiz);
quizRoutes.post('/add_quiz', QuizController.create_quiz);
quizRoutes.put('/update_quiz/:id', QuizController.update_quiz);
quizRoutes.delete('/delete_quiz/:id', QuizController.delete_quiz);

export default quizRoutes;
