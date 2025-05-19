import { Router } from "express";
import * as ClassroomController from '../controllers/classroom_controller.js'; // Import the controller

const classroomRoutes = Router();

classroomRoutes.get('/ask', ClassroomController.ask);


classroomRoutes.post('/add_classroom', ClassroomController.create_classroom);
classroomRoutes.post('/student_join_classroom', ClassroomController.student_join_classroom);
classroomRoutes.get('/student_leave_classroom/:classroom_id/:student_id', ClassroomController.student_leave_classroom);
classroomRoutes.get('/get_all_classroom', ClassroomController.get_all_classroom);
classroomRoutes.get('/get_all_classroom_student/:classroom_id', ClassroomController.get_all_classroom_student);
classroomRoutes.get('/get_all_classroom_specific_student/:student_id', ClassroomController.get_all_classroom_specific_student);
classroomRoutes.put('/update_classroom/:id', ClassroomController.update_classroom);
classroomRoutes.delete('/delete_classroom/:id', ClassroomController.delete_classroom);

export default classroomRoutes;
