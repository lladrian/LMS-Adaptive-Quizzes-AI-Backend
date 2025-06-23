import { Router } from "express";
import * as GradeController from '../controllers/grade_controller.js'; // Import the controller

const gradeRoutes = Router();

gradeRoutes.get('/compute_grade/:classroom_id/:student_id', GradeController.compute_grade);
gradeRoutes.get('/get_all_student_grade_specific_classroom/:classroom_id', GradeController.get_all_student_grade_specific_classroom);

export default gradeRoutes;
