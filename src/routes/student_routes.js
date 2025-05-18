import { Router } from "express";
import * as StudentController from '../controllers/student_controller.js'; // Import the controller

const studentRoutes = Router();


studentRoutes.post('/add_instructor', StudentController.create_student);
studentRoutes.post('/login_instructor', StudentController.login_student);
studentRoutes.put('/update_instructor/:id', StudentController.update_student);
studentRoutes.put('/update_instructor_password/:id', StudentController.update_student_password);
studentRoutes.get('/get_all_instructor', StudentController.get_all_student);
studentRoutes.get('/get_specific_instructor/:id', StudentController.get_specific_student);
studentRoutes.delete('/delete_instructor/:id', StudentController.delete_student);

export default studentRoutes;
