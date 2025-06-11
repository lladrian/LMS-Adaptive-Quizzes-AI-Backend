import { Router } from "express";
import * as PromoteController from '../controllers/promote_controller.js'; // Import the controller

const promoteRoutes = Router();

promoteRoutes.post('/promote_user/:id', PromoteController.promote_user);
promoteRoutes.get('/check_user/:id', PromoteController.check_user);


export default promoteRoutes;
