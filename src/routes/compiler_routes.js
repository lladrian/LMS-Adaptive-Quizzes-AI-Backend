import { Router } from "express";
import * as CompilerController from '../controllers/compiler_controller.js'; // Import the controller

const compilerRoutes = Router();

compilerRoutes.post('/run_code', CompilerController.run_code);
compilerRoutes.get('/run_time', CompilerController.run_time);




export default compilerRoutes;
