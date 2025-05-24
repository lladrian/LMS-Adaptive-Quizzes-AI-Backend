import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Classroom from '../models/classroom.js';
import Student from '../models/student.js';
import Instructor from '../models/instructor.js';
import ai_model from '../utils/gemini_ai.js';


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

export const student_join_classroom = asyncHandler(async (req, res) => {
    const { classroom_code, student_id } = req.body;
    
    try {
        if (!classroom_code || !student_id) {
            return res.status(400).json({ message: "Please provide all fields (classroom_code, student_id)." });
        }

        const classroom = await Classroom.findOne({ classroom_code });
        const student = await Student.findById(student_id);

        if (!classroom) return res.status(400).json({ message: 'Classroom not found' });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        if (student.joined_classroom.includes(classroom.id)) {
            return res.status(400).json({ message: 'Classroom already exists.' });
        }

        student.joined_classroom.push(classroom.id);
        await student.save();

        return res.status(200).json({ message: 'Student joined classroom successfully.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to joined classroom.' });
    }
});

export const student_leave_classroom = asyncHandler(async (req, res) => {
    const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters
    
    try {
        if (!classroom_id || !student_id) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, student_id)." });
        }

        const classroom = await Classroom.findById(classroom_id);
        const student = await Student.findById(student_id);

        if (!classroom) return res.status(400).json({ message: 'Classroom not found' });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        if (!student.joined_classroom.includes(classroom.id)) {
            return res.status(400).json({ message: 'Classroom not exists.' });
        }

        // Remove classroom ID from the array
        student.joined_classroom = student.joined_classroom.filter(
            id => id.toString() !== classroom.id.toString()
        );

        await student.save();

        return res.status(200).json({ message: 'Student leaved classroom successfully.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to leaved classroom.' });
    }
});

export const get_all_classroom_student = asyncHandler(async (req, res) => {  
    const { classroom_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classroom = await Classroom.findById(classroom_id).populate('instructor');
        const students = await Student.find({ 
            joined_classroom: classroom.id 
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        return res.status(200).json({ data: {classroom, students} });
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
        const student = await Student.findById(student_id);
        const classrooms = await Classroom.find({
        _id: { $in: student.joined_classroom }
        }).populate('instructor');

        if (!student) return res.status(404).json({ message: 'Student not found.' });

        return res.status(200).json({ data: classrooms });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
    }
});

export const get_all_classroom_specific_instructor = asyncHandler(async (req, res) => {  
    const { instructor_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const instructor = await Instructor.findById(instructor_id);

        const classrooms = await Classroom.find({ 
            instructor: instructor.id 
        }).populate('instructor');

        if (!instructor) return res.status(404).json({ message: 'Instructor not found.' });

        return res.status(200).json({ data: classrooms });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
    }
});

export const update_classroom = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { classroom_name, subject } = req.body;

    try {
        if (!classroom_name || !subject) {
            return res.status(400).json({ message: "All fields are required: classroom_name and subject." });
        }

        const updatedClassroom = await Classroom.findById(id);
                   
        if (!updatedClassroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }
                
        updatedClassroom.classroom_name = classroom_name ? classroom_name : updatedClassroom.classroom_name;
        updatedClassroom.subject = subject ? subject : updatedClassroom.subject;
                        
        await updatedClassroom.save();

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