import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import PracticeExam from '../models/practice_exam.js';

function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");
    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
}

export const create_practice_exam = asyncHandler(async (req, res) => {
    const { classroom_id, instruction } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!instruction || !classroom_id) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, instruction)." });
        }
   
        const newPracticeExam = new PracticeExam({
            classroom: classroom_id,
            instruction: instruction,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newPracticeExam.save();

        return res.status(200).json({ message: 'New practice exam successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create practice exam.' });
    }
});

export const get_all_practice_exam_specific_classroom = asyncHandler(async (req, res) => {  
    const { classroom_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classroom = await Classroom.findById(classroom_id).populate('instructor');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const practice_exams = await PracticeExam.find({ 
            classroom: classroom.id 
        });

        return res.status(200).json({ data: practice_exams });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all cpractice exams specific classroom.' });
    }
});

export const get_specific_practice_exam = asyncHandler(async (req, res) => {  
    const { exam_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const practice_exam = await PracticeExam.findById(exam_id).populate('classroom');

        if (!practice_exam) {
            return res.status(404).json({ message: 'Practice exam not found.' });
        }

        return res.status(200).json({ data: practice_exam });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific practice exam.' });
    }
});

