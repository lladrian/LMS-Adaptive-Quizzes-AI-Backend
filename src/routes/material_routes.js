import { Router } from "express";
import * as MaterialController from '../controllers/material_controller.js'; // Import the controller

const materialRoutes = Router();

materialRoutes.post('/add_material', MaterialController.create_material);
materialRoutes.get('/get_all_material_specific_classroom/:classroom_id', MaterialController.get_all_material_specific_classroom);
materialRoutes.get('/get_specific_material/:material_id', MaterialController.get_specific_material);
materialRoutes.put('/update_material/:id', MaterialController.update_material);
materialRoutes.delete('/delete_material/:id', MaterialController.delete_material);

export default materialRoutes;
