import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_URL);
const ai_model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export default ai_model;

