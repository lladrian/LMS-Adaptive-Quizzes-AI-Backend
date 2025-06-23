import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';

import MainActivity from "../models/main_activity.js";
import MainAnswer from "../models/main_answer.js";

import Student from '../models/student.js';
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

export const take_exam  = asyncHandler(async (req, res) => {
    const { activity_id, student_id } = req.params; // Get the meal ID from the request parameters    

    try {
        const existingAnswer = await MainAnswer.findOne({
            main_activity: activity_id,
            student: student_id
        });

        if (existingAnswer) {
            return res.status(400).json({ message: 'You have already started this activity.' });
        }

        const newAnswer = new MainAnswer({
            main_activity: activity_id,
            student: student_id,
            opened_at: storeCurrentDate(0, 'hours'),
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newAnswer.save();

        return res.status(200).json({ message: 'Student successfully take the activity.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to take activity.' });
    }
});


export const get_all_answer_specific_student_specific_classroom = asyncHandler(async (req, res) => {  
    const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classroom = await Classroom.findById(classroom_id);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const all_answers  = await MainAnswer
        .find({ student: student_id }) // filter by student ID
        .populate({
            path: 'main_activity',
            populate: { path: 'classroom' }
        });

        const answers = all_answers.filter(answer => 
            answer.exam?.classroom?._id.toString() === classroom.id.toString()
        );

        return res.status(200).json({ data: answers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all answers.' });
    }
});


export const get_all_answer_specific_exam = asyncHandler(async (req, res) => {  
    const { activity_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const main_activity = await MainActivity.findById(activity_id).populate('classroom');

        if (!main_activity) {
            return res.status(404).json({ message: 'Activity not found.' });
        }

        const answers = await MainAnswer.find({ main_activity: main_activity.id }).populate('student');
    

        return res.status(200).json({ data: answers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all answers.' });
    }
});

export const get_all_student_missing_answer_specific_activity = asyncHandler(async (req, res) => {  
    const { activity_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const main_activity = await MainActivity.findById(activity_id).populate('classroom');

        if (!main_activity) {
            return res.status(404).json({ message: 'Activity not found.' });
        }

        const answers = await MainAnswer.find({ main_activity: main_activity.id, submitted_at: { $ne: null } }).populate('student');
        const answeredStudentIds = answers.map(ans => ans.student._id);
  
        const students_missing = await Student.find({
        role: 'student',
        _id: { $nin: answeredStudentIds },
        joined_classroom: main_activity.classroom.id, // or mongoose.Types.ObjectId(classroom.id) if needed
        });

        return res.status(200).json({ data: students_missing });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all students have missing exam.' });
    }
});


export const get_specific_answer = asyncHandler(async (req, res) => {  
    const { answer_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const answer = await MainAnswer.findById(answer_id).populate('exam').populate('student');

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        return res.status(200).json({ data: answer });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific answer.' });
    }
});

export const create_answer = asyncHandler(async (req, res) => {
    const { array_answers } = req.body;
    const { activity_id, student_id } = req.params; // Get the meal ID from the request parameters
    const now = moment.tz('Asia/Manila');

    try {
        if (!array_answers) {
            return res.status(400).json({ message: "Please provide all fields (array_answers)." });
        }
   
        const main_activity = await MainActivity.findById(activity_id);

         if (!main_activity) {
            return res.status(404).json({ message: 'Activity not found.' });
        }
       
        const answer = await MainAnswer.findOne({
            main_activity: main_activity.id,
            student: student_id
        });

        if (answer) {
            const opened_quiz = moment.tz(answer.opened_at, "YYYY-MM-DD HH:mm:ss", 'Asia/Manila');
            const diffMinutes = now.diff(opened_quiz, 'minutes');

            if (diffMinutes >= exam.submission_time) {
                return res.status(400).json({ message: 'Sorry! You can no longer submit your quiz. The time is up.' });
            }
        } 

        if (answer && answer.submitted_at) {
            return res.status(400).json({ message: 'Sorry! You can no longer submit your activity. Already submitted.' });
        } 

        if(!answer) {
            return res.status(400).json({ message: 'Not yet taking the activity.' });
        }
    
  
        answer.answers = array_answers;
        answer.submitted_at = storeCurrentDate(0, 'hours');

        await answer.save();

        return res.status(200).json({ message: 'New answer successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create answer.' });
    }
});



