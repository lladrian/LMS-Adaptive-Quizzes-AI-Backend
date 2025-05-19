import { Router } from "express";
import * as AIController from '../controllers/ai_controller.js'; // Import the controller

const aiRoutes = Router();

aiRoutes.get('/ask', AIController.ask);

export default aiRoutes;
