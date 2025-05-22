import { Router } from "express";
import * as PracticeExamController from '../controllers/practice_exam_controller.js'; // Import the controller

const practiceExamRoutes = Router();

// practiceExamRoutes.get('/get_all_exam_specific_classroom/:classroom_id', PracticeExamController.get_all_exam_specific_classroom);
// practiceExamRoutes.get('/get_specific_exam/:exam_id', PracticeExamController.get_specific_exam);
// practiceExamRoutes.post('/add_exam', PracticeExamController.create_exam);
// practiceExamRoutes.put('/update_exam/:id', PracticeExamController.update_exam);
// practiceExamRoutes.delete('/delete_exam/:id', PracticeExamController.delete_exam);

export default practiceExamRoutes;
