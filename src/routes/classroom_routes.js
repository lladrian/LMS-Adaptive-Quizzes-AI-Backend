import { Router } from "express";
import * as ClassroomController from '../controllers/classroom_controller.js'; // Import the controller

const classroomRoutes = Router();

classroomRoutes.post('/add_classroom', ClassroomController.create_classroom);
classroomRoutes.post('/student_join_classroom', ClassroomController.student_join_classroom);
classroomRoutes.get('/add_student_classroom/:classroom_id/:student_id', ClassroomController.add_student_classroom);
classroomRoutes.get('/remove_student_classroom/:classroom_id/:student_id', ClassroomController.remove_student_classroom);
classroomRoutes.get('/student_leave_classroom/:classroom_id/:student_id', ClassroomController.student_leave_classroom);
classroomRoutes.get('/get_all_classroom_overview_specific_instructor/:instructor_id', ClassroomController.get_all_classroom_overview_specific_instructor);
classroomRoutes.get('/get_specific_classroom/:classroom_id', ClassroomController.get_specific_classroom);
classroomRoutes.get('/get_all_classroom', ClassroomController.get_all_classroom);
classroomRoutes.get('/get_all_classroom_student/:classroom_id', ClassroomController.get_all_classroom_student);
classroomRoutes.get('/get_all_classroom_specific_student/:student_id', ClassroomController.get_all_classroom_specific_student);
classroomRoutes.get('/get_all_classroom_specific_instructor/:instructor_id', ClassroomController.get_all_classroom_specific_instructor);
classroomRoutes.put('/update_classroom/:id', ClassroomController.update_classroom);
classroomRoutes.get('/hide_classroom/:id', ClassroomController.hide_classroom);
classroomRoutes.get('/unhide_classroom/:id', ClassroomController.unhide_classroom);

export default classroomRoutes;
