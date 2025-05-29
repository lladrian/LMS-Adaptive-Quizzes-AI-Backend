import asyncHandler from 'express-async-handler';
import axios from 'axios';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
// import Classroom from '../models/classroom.js';
// import Student from '../models/student.js';
import ai_model from '../utils/gemini_ai.js';


export const run_time = asyncHandler(async (req, res) => {
    try {
        const response = await axios.get('https://emkc.org/api/v2/piston/runtimes');

        return res.status(200).json({ data: response.data });

    } catch (error) {
        return res.status(500).json({ error: 'Error compiling code', detail: error.message });
    }
});


export const run_code = asyncHandler(async (req, res) => {
    const { language, version, code } = req.body;

    // "language": "java",     "version": "15.0.2",
    // "language": "python",   "version": "3.10.0",

    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: language || "python",
            version: version || "3.10.0",
            files: [
                {
                content: code || "print(3 / 2)",
                },
            ],
        });

        return res.status(200).json({ data: response.data });
        
    } catch (error) {
        return res.status(500).json({ error: 'Error compiling code', detail: error.message });
    }
});