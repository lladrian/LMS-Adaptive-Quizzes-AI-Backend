import { Router } from "express";
import * as LoginController from '../controllers/login_controller.js'; // Import the controller

const loginRoutes = Router();

loginRoutes.post('/login_user', LoginController.login_user);

export default loginRoutes;
