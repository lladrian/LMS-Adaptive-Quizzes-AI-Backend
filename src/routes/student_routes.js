import { Router } from "express";
import * as StudentController from '../controllers/student_controller.js'; // Import the controller

const studentRoutes = Router();


studentRoutes.post('/add_student', StudentController.create_student);
studentRoutes.post('/login_student', StudentController.login_student);
studentRoutes.put('/update_student/:id', StudentController.update_student);
studentRoutes.put('/update_student_password/:id', StudentController.update_student_password);
studentRoutes.get('/get_all_student', StudentController.get_all_student);
studentRoutes.get('/get_specific_student/:id', StudentController.get_specific_student);
studentRoutes.delete('/delete_student/:id', StudentController.delete_student);

export default studentRoutes;
