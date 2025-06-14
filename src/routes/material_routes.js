import { Router } from "express";
import * as MaterialController from '../controllers/material_controller.js'; // Import the controller

import multer from 'multer';
import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname


// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the uploads directory relative to the current file
const uploadsDir = path.join(__dirname, '../../uploads/materials/');


// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Use the dynamically created uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
    }
});


const upload = multer({ storage: storage });

const materialRoutes = Router();

  
materialRoutes.post('/add_material', upload.single('file_uploaded'), MaterialController.create_material);
materialRoutes.get('/extract_material/:material_id', MaterialController.extract_material);
materialRoutes.get('/get_all_material_specific_classroom/:classroom_id', MaterialController.get_all_material_specific_classroom);
materialRoutes.get('/get_specific_material/:material_id', MaterialController.get_specific_material);
materialRoutes.put('/update_material/:id', upload.single('file_uploaded'), MaterialController.update_material);
materialRoutes.delete('/delete_material/:id', MaterialController.delete_material);

export default materialRoutes;
