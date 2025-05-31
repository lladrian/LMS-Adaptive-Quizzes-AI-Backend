import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Classroom from '../models/classroom.js';
import Student from '../models/student.js';
import Instructor from '../models/instructor.js';
import Exam from '../models/exam.js';
import Quiz from '../models/quiz.js';
import Material from '../models/material.js';
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
    const { classroom_name, subject_code, instructor, classroom_code, description } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!classroom_name || !subject_code || !instructor || !classroom_code) {
            return res.status(400).json({ message: "Please provide all fields (classroom_name, subject_code, instructor, classroom_code, description)." });
        }
   
        const newClassroom = new Classroom({
            classroom_name: classroom_name,
            subject_code: subject_code,
            instructor: instructor,
            classroom_code: classroom_code,
            description: description,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newClassroom.save();

        return res.status(200).json({ message: 'New classroom successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create classroom.' });
    }
});


export const add_student_classroom = asyncHandler(async (req, res) => {
    const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters
    
    try {
        const classroom = await Classroom.findById(classroom_id);
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

export const remove_student_classroom = asyncHandler(async (req, res) => {
    const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters
    
    try {
        const classroom = await Classroom.findById(classroom_id);
        const student = await Student.findById(student_id);

        if (!classroom) return res.status(400).json({ message: 'Classroom not found' });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        if (!student.joined_classroom.includes(classroom.id)) {
            return res.status(400).json({ message: 'Classroom already exists.' });
        }

        // Remove classroom ID from the array
        student.joined_classroom = student.joined_classroom.filter(
            id => id.toString() !== classroom.id.toString()
        );

        await student.save();

        return res.status(200).json({ message: 'Student joined classroom successfully.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to joined classroom.' });
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

export const get_all_classroom_overview_specific_instructor = asyncHandler(async (req, res) => {  
    const { instructor_id , classroom_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const instructor = await Instructor.findById(instructor_id);
       // const classroom = await Classroom.findById(classroom_id);

        if (!instructor) return res.status(404).json({ message: 'Instructor not found.' });
       // if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });

        const classrooms = await Classroom.find({ 
            instructor: instructor.id
        });

        const results = await Promise.all(classrooms.map(async (classroom) => {
            const materials = await Material.find({ 
                classroom: classroom.id 
            });
            const students = await Student.find({ 
                joined_classroom: classroom.id 
            });
            return {
                classroom,
                materials,
                students
            };
        }));

        // const materials = await Material.find({ 
        //     classroom : classroom.id,
        // });

        // const students = await Student.find({ 
        //     joined_classroom: classroom.id 
        // });

        return res.status(200).json({ data: results });

       //return res.status(200).json({ data: {classrooms, students, materials} });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
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

export const get_specific_classroom = asyncHandler(async (req, res) => {   
    const { classroom_id } = req.params; // Get the meal ID from the request parameters
 
    try {
        const classroom = await Classroom.findById(classroom_id).populate('instructor');  

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const exams = await Exam.find({ 
            classroom : classroom.id,
        });

        const quizzes = await Quiz.find({ 
            classroom : classroom.id,
        });

        const materials = await Material.find({ 
            classroom : classroom.id,
        });

        const students = await Student.find({ 
            joined_classroom: classroom.id 
        });

        return res.status(200).json({ data: {classroom, exams, quizzes, materials, students} });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get data.' });
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

        if (!student) return res.status(404).json({ message: 'Student not found.' });

        const classrooms = await Classroom.find({
            _id: { $in: student.joined_classroom },
            is_hidden: 0
        }).populate('instructor');


        return res.status(200).json({ data: classrooms });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
    }
});

export const get_all_classroom_specific_instructor = asyncHandler(async (req, res) => {  
    const { instructor_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const instructor = await Instructor.findById(instructor_id);

        if (!instructor) return res.status(404).json({ message: 'Instructor not found.' });

        const classrooms = await Classroom.find({ 
            instructor: instructor.id,
            is_hidden: 0
        }).populate('instructor');


        return res.status(200).json({ data: classrooms });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all classrooms.' });
    }
});

export const update_classroom = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { classroom_name, subject_code, description } = req.body;

    try {
        if (!classroom_name || !subject_code || !description) {
            return res.status(400).json({ message: "All fields are required: classroom_name, description and subject_code." });
        }

        const updatedClassroom = await Classroom.findById(id);
                   
        if (!updatedClassroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }
                
        updatedClassroom.description = description ? description : updatedClassroom.description;
        updatedClassroom.classroom_name = classroom_name ? classroom_name : updatedClassroom.classroom_name;
        updatedClassroom.subject_code = subject_code ? subject_code : updatedClassroom.subject_code;
                        
        await updatedClassroom.save();

        return res.status(200).json({ data: 'Classroom successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update classroom.' });
    }
});


export const hide_classroom = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const classroom = await Classroom.findById(id);
                   
        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        classroom.is_hidden = 1;
                        
        await classroom.save();

        return res.status(200).json({ data: 'Classroom successfully is hidden.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete classroom.' });
    }
});

export const unhide_classroom = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const classroom = await Classroom.findById(id);
                   
        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        classroom.is_hidden = 0;
                        
        await classroom.save();

        return res.status(200).json({ data: 'Classroom successfully is softly unhidden.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete classroom.' });
    }
});