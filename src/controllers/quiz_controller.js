import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Quiz from '../models/quiz.js';
import AnswerQuiz from '../models/answer_quiz.js';


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

export const create_quiz = asyncHandler(async (req, res) => {
    const { classroom_id, question, time_limit, title, description } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!classroom_id || !question || !time_limit || !title || !description) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, question, time_limit, title, description)." });
        }
   
        const newQuiz = new Quiz({
            classroom: classroom_id,
            question: question,
            title: title,
            description: description,
            submission_time: time_limit,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newQuiz.save();

        return res.status(200).json({ message: 'New quiz successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create quiz.' });
    }
});

export const get_all_quiz_specific_classroom = asyncHandler(async (req, res) => {  
    const { classroom_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classroom = await Classroom.findById(classroom_id).populate('instructor');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const quizzes = await Quiz.find({ 
            classroom: classroom.id 
        });

        return res.status(200).json({ data: quizzes });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all quizzes in specific classroom.' });
    }
});

export const get_specific_quiz_specific_answer = asyncHandler(async (req, res) => {  
    const { quiz_id, student_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const quiz = await Quiz.findById(quiz_id).populate('classroom');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        const answer  = await AnswerQuiz
        .findOne({ student: student_id, quiz: quiz.id}) 
        .populate({
            path: 'quiz',
            populate: { path: 'classroom' }
        });

        return res.status(200).json({ data: answer });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific quiz.' });
    }
});

export const get_specific_quiz = asyncHandler(async (req, res) => {  
    const { quiz_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const quiz = await Quiz.findById(quiz_id).populate('classroom');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        return res.status(200).json({ data: quiz });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific quiz.' });
    }
});


export const update_quiz = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { classroom_id, question, time_limit, title, description } = req.body;

    try {
        if (!classroom_id || !question || !title || !description) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, question, title, description)." });
        }

        const updatedQuiz = await Quiz.findById(id);

        if (!updatedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        
        updatedQuiz.classroom = classroom_id ? classroom_id : updatedQuiz.classroom;
        updatedQuiz.question = question ? question : updatedQuiz.question;
        updatedQuiz.title = title ? title : updatedQuiz.title;
        updatedQuiz.description = description ? description : updatedQuiz.description;
        updatedQuiz.submission_time = time_limit ? time_limit : updatedQuiz.submission_time;
        
        await updatedQuiz.save();

        return res.status(200).json({ data: 'Quiz successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update quiz.' });
    }
});


export const delete_quiz = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(id);

        if (!deletedQuiz) return res.status(404).json({ message: 'Quiz not found' });

        return res.status(200).json({ data: 'Quiz successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete quiz.' });
    }
});