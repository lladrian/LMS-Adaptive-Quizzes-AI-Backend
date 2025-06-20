import { Router } from "express";
import * as ActivityController from '../controllers/activity_controller.js'; // Import the controller

const activityRoutes = Router();
  
  
activityRoutes.get('/get_specific_activity_specific_answer/:activity_id/:student_id', ActivityController.get_specific_activity_specific_answer);
activityRoutes.get('/get_all_activity_specific_classroom/:classroom_id', ActivityController.get_all_activity_specific_classroom);
activityRoutes.get('/get_specific_activity/:activity_id', ActivityController.get_specific_activity);


activityRoutes.post('/add_activity', ActivityController.create_activity);
activityRoutes.put('/update_activity/:id', ActivityController.update_activity);
activityRoutes.delete('/delete_activity/:id', ActivityController.delete_activity);

export default activityRoutes;
