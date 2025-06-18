import { Router } from "express";
import * as AnswerController from '../controllers/answer_assignment_controller.js'; // Changed to assignment controller

const answerAssignmentRoutes = Router();

answerAssignmentRoutes.get('/get_all_answer_specific_student_specific_classroom/:classroom_id/:student_id', AnswerController.get_all_answer_specific_student_specific_classroom);
answerAssignmentRoutes.get('/get_all_answer_specific_assignment/:assignment_id', AnswerController.get_all_answer_specific_assignment);
answerAssignmentRoutes.get('/get_all_student_missing_answer_specific_assignment/:assignment_id', AnswerController.get_all_student_missing_answer_specific_assignment);
answerAssignmentRoutes.get('/get_specific_answer/:answer_id', AnswerController.get_specific_answer);
answerAssignmentRoutes.post('/add_answer/:assignment_id/:student_id', AnswerController.create_answer);
//answerAssignmentRoutes.post('/add_answer_option/:assignment_id/:student_id', AnswerController.create_answer_option);
answerAssignmentRoutes.get('/take_assignment/:assignment_id/:student_id', AnswerController.take_assignment);
answerAssignmentRoutes.put('/update_specific_student_assignment_points/:answer_assignment_id', AnswerController.update_specific_student_assignment_points);

export default answerAssignmentRoutes;
