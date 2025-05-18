import { Router } from "express";
import * as InstructorController from '../controllers/instructor_controller.js'; // Import the controller

const instructorRoutes = Router();


instructorRoutes.post('/add_instructor', InstructorController.create_instructor);
instructorRoutes.post('/login_instructor', InstructorController.login_instructor);
instructorRoutes.put('/update_instructor/:id', InstructorController.update_instructor);
instructorRoutes.put('/update_instructor_password/:id', InstructorController.update_instructor_password);
instructorRoutes.get('/get_all_instructor', InstructorController.get_all_instructor);
instructorRoutes.get('/get_specific_instructor/:id', InstructorController.get_specific_instructor);
instructorRoutes.delete('/delete_instructor/:id', InstructorController.delete_instructor);

export default instructorRoutes;
