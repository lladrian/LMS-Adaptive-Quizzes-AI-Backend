import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Classroom from '../models/classroom.js';

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


export const create_classroom = asyncHandler(async (req, res) => {
    const { classroom_name, subject, instructor, classroom_code } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!classroom_name || !subject || !instructor || !classroom_code) {
            return res.status(400).json({ message: "Please provide all fields (classroom_name, subject, instructor, classroom_code)." });
        }
   
        const newClassroom = new Classroom({
            classroom_name: classroom_name,
            subject: subject,
            instructor: instructor,
            classroom_code: classroom_code,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newClassroom.save();

        return res.status(200).json({ message: 'New classroom successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create classroom.' });
    }
});

export const get_all_classroom_student = asyncHandler(async (req, res) => {    
    try {
        const classrooms = await Classroom.find();

        return res.status(200).json({ data: classrooms });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
    }
});


export const get_all_classroom = asyncHandler(async (req, res) => {    
    try {
        const classrooms = await Classroom.find();

        return res.status(200).json({ data: classrooms });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
    }
});

export const get_all_classroom_specific_student = asyncHandler(async (req, res) => {  
    const { student_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classrooms = await Classroom.find();

        return res.status(200).json({ data: classrooms });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
    }
});

export const update_classroom = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { classroom_name, subject } = req.body;

    try {
        if (!email || !fullname) {
            return res.status(400).json({ message: "All fields are required: email and fullname." });
        }

        const updatedClassroom = await Classroom.findByIdAndUpdate(
        id, 
        { classroom_name : classroom_name, subject : subject }, // Fields to update
        { new: true, runValidators: true }
        );

        if (!updatedClassroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        return res.status(200).json({ data: 'Classroom successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update classroom.' });
    }
});


export const delete_classroom = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedClassroom = await Classroom.findByIdAndDelete(id);

        if (!deletedClassroom) return res.status(404).json({ message: 'Classroom not found' });

        return res.status(200).json({ data: 'Classroom successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete classroom.' });
    }
});