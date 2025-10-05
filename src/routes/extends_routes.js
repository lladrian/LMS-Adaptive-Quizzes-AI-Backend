// routes/extends_routes.js
import { Router } from "express";
import * as ExtendController from "../controllers/extend_controller.js";

const extendRoutes = Router();

extendRoutes.post('/:activity_id/time', ExtendController.extend_time);



export default extendRoutes;
