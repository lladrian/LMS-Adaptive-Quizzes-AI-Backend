import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ai_model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


// async function testGeminiConnection() {
//   try {
//     const result = await ai_model.generateContent("Say hello");
//     const response = await result.response;
//     const text = response.text();

//     console.log("✅ Gemini API connected successfully!");
//     console.log("Response:", text);
//   } catch (error) {
//     console.error("❌ Failed to connect to Gemini API:", error.message);
//   }
// }

// testGeminiConnection();

export default ai_model;

