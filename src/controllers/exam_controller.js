import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Exam from '../models/exam.js';

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

export const create_exam = asyncHandler(async (req, res) => {
    const { classroom_id, instruction, time_limit } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!classroom_id || !instruction || !time_limit) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, instruction, time_limit)." });
        }
   
        const newExam = new Exam({
            classroom: classroom_id,
            instruction: instruction,
            submission_time: time_limit,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newExam.save();

        return res.status(200).json({ message: 'New exam successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create exam.' });
    }
});

export const get_all_exam_specific_classroom = asyncHandler(async (req, res) => {  
    const { classroom_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classroom = await Classroom.findById(classroom_id).populate('instructor');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const exams = await Exam.find({ 
            classroom: classroom.id 
        });

        return res.status(200).json({ data: exams });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
    }
});

export const get_specific_exam = asyncHandler(async (req, res) => {  
    const { exam_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const exam = await Exam.findById(exam_id).populate('classroom');

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        return res.status(200).json({ data: exam });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific exam.' });
    }
});


export const update_exam = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { classroom_id, instruction, time_limit } = req.body;

    try {
        if (!classroom_id || !instruction) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, instruction)." });
        }

        const updatedExam = await Exam.findById(id);

        if (!updatedExam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        
        updatedExam.classroom = classroom_id ? classroom_id : updatedExam.classroom;
        updatedExam.instruction = instruction ? instruction : updatedExam.instruction;
        updatedExam.submission_time = time_limit ? time_limit : updatedExam.submission_time;
                
        await updatedExam.save();

        return res.status(200).json({ data: 'Exam successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update exam.' });
    }
});


export const delete_exam = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedExam = await Exam.findByIdAndDelete(id);

        if (!deletedExam) return res.status(404).json({ message: 'Exam not found' });

        return res.status(200).json({ data: 'Exam successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete exam.' });
    }
});