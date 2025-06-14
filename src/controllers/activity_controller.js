import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Activity from '../models/activity.js';
import AnswerActivity from '../models/answer_activity.js';
import Student from '../models/student.js';

import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path'; // Import dirname

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads/');

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


export const get_specific_activity_specific_answer = asyncHandler(async (req, res) => {  
    const { activity_id, student_id } = req.params; // Get the meal ID from the request parameters

    try {
        const activity = await Activity.findById(activity_id).populate('classroom');
        const student = await Student.findById(student_id);


        if (!activity) {
            return res.status(404).json({ message: 'Activity not found.' });
        }

        const answer  = await AnswerActivity
        .findOne({ student: student.id, activity: activity.id}) 
        .populate({
        path: 'activity',
        populate: { path: 'classroom' }
        });

        return res.status(200).json({ data: answer });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific activity.' });
    }
});

export const create_activity = asyncHandler(async (req, res) => {
    const { classroom_id, description, title, question } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!classroom_id || !description || !title || !question) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, description, title, question)." });
        }
   
        const newActivity= new Activity({
            question: question,
            classroom: classroom_id,
            title: title,
            description: description,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newActivity.save();

        return res.status(200).json({ data: 'New activity successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create activity.' });
    }
});

export const get_all_activity_specific_classroom = asyncHandler(async (req, res) => {  
    const { classroom_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classroom = await Classroom.findById(classroom_id).populate('instructor');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const activity = await Activity.find({ 
            classroom: classroom.id 
        });

        return res.status(200).json({ data: activity });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all materials specific classroom.' });
    }
});

export const get_specific_activity = asyncHandler(async (req, res) => {  
    const { activity_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const activity = await Activity.findById(activity_id).populate('classroom');

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found.' });
        }

        return res.status(200).json({ data: activity });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific activity.' });
    }
});

export const update_activity = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { classroom_id, description, title, question } = req.body;


    try {
        if (!classroom_id || !description || !title || !question) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, description, title, question)." });
        }

        const updatedActivity = await Activity.findById(id);

        updatedActivity.classroom = classroom_id ? classroom_id : updatedActivity.classroom;
        updatedActivity.description = description ? description : updatedActivity.description;
        updatedActivity.title = title ? title : updatedActivity.title;
        updatedActivity.question = question ? question : updatedActivity.question;

        await updatedActivity.save();

        return res.status(200).json({ data: 'Activity successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update activity.' });
    }
});


export const delete_activity = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedActivity = await Activity.findByIdAndDelete(id);

        if (!deletedActivity) return res.status(404).json({ message: 'Activity not found' });

        return res.status(200).json({ data: 'Activity successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete activity.' });
    }
});