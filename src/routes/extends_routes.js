// routes/extends_routes.js
import { Router } from "express";
import * as ExtendController from "../controllers/extend_controller.js";

const extendRoutes = Router();

// More RESTful endpoint structure
extendRoutes.post(
  "/:activityType/:activityId/time",
  ExtendController.extendTime
);

export default extendRoutes;
