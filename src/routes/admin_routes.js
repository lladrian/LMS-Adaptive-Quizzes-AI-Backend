import { Router } from "express";
import * as AdminController from '../controllers/admin_controller.js'; // Import the controller

const adminRoutes = Router();


adminRoutes.post('/add_admin', AdminController.create_admin);
adminRoutes.post('/login_admin', AdminController.login_admin);
adminRoutes.put('/update_admin/:id', AdminController.update_admin);
adminRoutes.put('/update_admin_password/:id', AdminController.update_admin_password);
adminRoutes.get('/get_all_admin', AdminController.get_all_admin);
adminRoutes.get('/get_specific_admin/:id', AdminController.get_specific_admin);
adminRoutes.delete('/delete_admin/:id', AdminController.delete_admin);



export default adminRoutes;
