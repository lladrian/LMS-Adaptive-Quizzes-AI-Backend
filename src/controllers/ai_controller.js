import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
// import Classroom from '../models/classroom.js';
// import Student from '../models/student.js';
import ai_model from '../utils/gemini_ai.js';


export const ask = asyncHandler(async (req, res) => {
    const { ask } = req.body;

    try {
        const result = await ai_model.generateContent(ask);
        const response = await result.response;
        let text = await response.text();

        // const lines = text.trim().split('\n');
        // const responseObj = {};

        // lines.forEach(line => {
        //     const [key, ...value] = line.split(':');
        //     if (key && value) {
        //         responseObj[key.trim().toLowerCase()] = value.join(':').trim();
        //     }
        // });


        return res.status(200).json({ data: text  });
    } catch (error) {
        res.status(500).json({ message: "AI request failed." });
    }
});