import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import AnswerQuiz from '../models/answer_quiz.js';
import Quiz from '../models/quiz.js';

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

export const take_quiz  = asyncHandler(async (req, res) => {
    const { quiz_id, student_id } = req.params; // Get the meal ID from the request parameters    

    try {
        const existingAnswer = await AnswerQuiz.findOne({
            exam: quiz_id,
            student: student_id
        });

        if (existingAnswer) {
            return res.status(400).json({ message: 'You have already started this quiz.' });
        }

        const newAnswer = new AnswerQuiz({
            exam: quiz_id,
            student: student_id,
            line_of_code: "",
            opened_at: storeCurrentDate(0, 'hours'),
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newAnswer.save();

        return res.status(200).json({ message: 'New quiz successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create quiz.' });
    }
});



export const get_all_answer_specific_quiz = asyncHandler(async (req, res) => {  
    const { quiz_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const quiz = await Quiz.findById(quiz_id).populate('classroom');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        const answers = await AnswerQuiz.find({ 
            exam: quiz.id 
        });

        return res.status(200).json({ data: answers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all answers.' });
    }
});


export const get_specific_answer = asyncHandler(async (req, res) => {  
    const { answer_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const answer = await AnswerQuiz.findById(answer_id).populate('quiz').populate('student');

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        return res.status(200).json({ data: answer });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific answer.' });
    }
});



export const create_answer = asyncHandler(async (req, res) => {
    const { line_of_code } = req.body;
    const { quiz_id, student_id } = req.params; // Get the meal ID from the request parameters
    const now = moment.tz('Asia/Manila');

    try {
        if (!line_of_code) {
            return res.status(400).json({ message: "Please provide all fields (line_of_code)." });
        }
   
        const quiz = await Quiz.findById(quiz_id);
       
        const answer = await AnswerQuiz.findOne({
            quiz: quiz.id,
            student: student_id
        });

        if (answer) {
            const opened_exam = moment.tz(answer.opened_at, "YYYY-MM-DD HH:mm:ss", 'Asia/Manila');
            const diffMinutes = now.diff(opened_exam, 'minutes');

            //if (diffMinutes >= quiz.submission_time) {
            if (diffMinutes >= 1) {
                return res.status(400).json({ message: 'Sorry! You can no longer submit your exam. The time is up.' });
            }
        } else {
            return res.status(400).json({ message: 'Not yet taking the exam.' });
        }
    
  
        answer.line_of_code = line_of_code;
        answer.submitted_at = storeCurrentDate(0, 'hours');

        await answer.save();

        return res.status(200).json({ message: 'New answer successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create answer.' });
    }
});


