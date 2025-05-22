import { Router } from "express";
import * as LanguageController from '../controllers/language_controller.js'; // Import the controller

const languageRoutes = Router();

languageRoutes.post('/add_language', LanguageController.create_language);
languageRoutes.get('/get_all_language', LanguageController.get_all_language);
languageRoutes.put('/update_language/:id', LanguageController.update_language);
languageRoutes.delete('/delete_language/:id', LanguageController.delete_language);


export default languageRoutes;
