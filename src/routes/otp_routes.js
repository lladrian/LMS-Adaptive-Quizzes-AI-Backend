import { Router } from "express";
import * as OTPController from '../controllers/otp_controller.js'; // Import the controller

const otpRoutes = Router();

otpRoutes.post('/add_otp', OTPController.create_otp);
otpRoutes.post('/otp_verification_email_verification', OTPController.otp_verification_email_verification);
otpRoutes.post('/otp_verification_password', OTPController.otp_verification_password);

export default otpRoutes;
