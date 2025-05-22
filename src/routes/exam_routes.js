import { Router } from "express";
import * as ExamController from '../controllers/exam_controller.js'; // Import the controller

const examRoutes = Router();

examRoutes.get('/get_all_exam_specific_classroom/:classroom_id', ExamController.get_all_exam_specific_classroom);
examRoutes.get('/get_specific_exam/:exam_id', ExamController.get_specific_exam);
examRoutes.post('/add_exam', ExamController.create_exam);
examRoutes.put('/update_exam/:id', ExamController.update_exam);
examRoutes.delete('/delete_exam/:id', ExamController.delete_exam);

export default examRoutes;
