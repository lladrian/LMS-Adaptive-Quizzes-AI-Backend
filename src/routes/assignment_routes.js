import { Router } from "express";
import * as AssignmentController from '../controllers/assignment_controller.js'; // Import the assignment controller

const assignmentRoutes = Router();

assignmentRoutes.get('/get_specific_assignment_specific_answer/:assignment_id/:student_id', AssignmentController.get_specific_assignment_specific_answer);
assignmentRoutes.get('/get_all_assignment_specific_classroom/:classroom_id', AssignmentController.get_all_assignment_specific_classroom);
assignmentRoutes.get('/get_specific_assignment/:assignment_id', AssignmentController.get_specific_assignment);
assignmentRoutes.post('/add_assignment', AssignmentController.create_assignment);
// assignmentRoutes.post('/add_assignment_option', AssignmentController.create_assignment_option); // Uncomment if needed
assignmentRoutes.put('/update_assignment/:id', AssignmentController.update_assignment);
// assignmentRoutes.put('/update_assignment_option/:id', AssignmentController.update_assignment_option); // Uncomment if needed
assignmentRoutes.delete('/delete_assignment/:id', AssignmentController.delete_assignment);

export default assignmentRoutes;
