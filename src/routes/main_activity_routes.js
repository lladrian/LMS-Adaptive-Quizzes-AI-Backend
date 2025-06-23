import { Router } from "express";
import * as MainActivityController from '../controllers/main_activity_controller.js'; // Import the controller

const mainActivityRoutes = Router();

mainActivityRoutes.get('/get_all_activity_specific_classroom/:classroom_id', MainActivityController.get_all_activity_specific_classroom);
mainActivityRoutes.get('/get_specific_activity_specific_answer/:activity_id/:student_id', MainActivityController.get_specific_activity_specific_answer);
mainActivityRoutes.get('/get_specific_activity/:activity_id', MainActivityController.get_specific_activity);
mainActivityRoutes.post('/add_activity', MainActivityController.create_activity);
mainActivityRoutes.put('/update_activity/:id', MainActivityController.update_activity);
mainActivityRoutes.delete('/delete_activity/:id', MainActivityController.delete_activity);




export default mainActivityRoutes;
