import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import AnswerExam from '../models/answer_exam.js';
import Exam from '../models/exam.js';
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
    const { exam_id, student_id } = req.params; // Get the meal ID from the request parameters    

    try {
        const existingAnswer = await AnswerExam.findOne({
            exam: exam_id,
            student: student_id
        });

        if (existingAnswer) {
            return res.status(400).json({ message: 'You have already started this exam.' });
        }

        const newAnswer = new AnswerExam({
            exam: exam_id,
            student: student_id,
            opened_at: storeCurrentDate(0, 'hours'),
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newAnswer.save();

        return res.status(200).json({ message: 'New exam successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create exam.' });
    }
});


export const get_all_answer_specific_student_specific_classroom = asyncHandler(async (req, res) => {  
    const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classroom = await Classroom.findById(classroom_id);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const all_answers  = await AnswerExam
        .find({ student: student_id }) // filter by student ID
        .populate({
            path: 'exam',
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
    const { exam_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const exam = await Exam.findById(exam_id).populate('classroom');

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        const answers = await AnswerExam.find({ exam: exam.id }).populate('student');
    

        return res.status(200).json({ data: answers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all answers.' });
    }
});

export const get_all_student_missing_answer_specific_exam = asyncHandler(async (req, res) => {  
    const { exam_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const exam = await Exam.findById(exam_id).populate('classroom');

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        const answers = await AnswerExam.find({ exam: exam.id, submitted_at: { $ne: null } }).populate('student');
        const answeredStudentIds = answers.map(ans => ans.student._id);
  
        const students_missing = await Student.find({
        role: 'student',
        _id: { $nin: answeredStudentIds },
        joined_classroom: exam.classroom.id, // or mongoose.Types.ObjectId(classroom.id) if needed
        });

        return res.status(200).json({ data: students_missing });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all students have missing exam.' });
    }
});


export const get_specific_answer = asyncHandler(async (req, res) => {  
    const { answer_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const answer = await AnswerExam.findById(answer_id).populate('exam').populate('student');

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        return res.status(200).json({ data: answer });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific answer.' });
    }
});

export const create_answer_option = asyncHandler(async (req, res) => {
    const { array_answers_option } = req.body;
    const { exam_id, student_id } = req.params; // Get the meal ID from the request parameters
    const now = moment.tz('Asia/Manila');

    try {
        if (!array_answers_option) {
            return res.status(400).json({ message: "Please provide all fields (array_answers_option)." });
        }
   
        const exam = await Exam.findById(exam_id);

         if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
       
        const answer = await AnswerExam.findOne({
            exam: exam.id,
            student: student_id
        });

        // if (answer) {
        //     const opened_quiz = moment.tz(answer.opened_at, "YYYY-MM-DD HH:mm:ss", 'Asia/Manila');
        //     const diffMinutes = now.diff(opened_quiz, 'minutes');

        //     if (diffMinutes >= exam.submission_time) {
        //         return res.status(400).json({ message: 'Sorry! You can no longer submit your quiz. The time is up.' });
        //     }
        // } else {
        //     return res.status(400).json({ message: 'Not yet taking the quiz.' });
        // }

        if (answer && answer.submitted_at) {
            return res.status(400).json({ message: 'Sorry! You can no longer submit your exam. Already submitted.' });
        } 

        if(!answer) {
            return res.status(400).json({ message: 'Not yet taking the exam.' });
        }
    
  
        answer.answers_option = array_answers_option;
        answer.submitted_at = storeCurrentDate(0, 'hours');

        await answer.save();

        return res.status(200).json({ message: 'New answer successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create answer.' });
    }
});

export const create_answer = asyncHandler(async (req, res) => {
    const { array_answers } = req.body;
    const { exam_id, student_id } = req.params; // Get the meal ID from the request parameters
    const now = moment.tz('Asia/Manila');

    try {
        if (!array_answers) {
            return res.status(400).json({ message: "Please provide all fields (array_answers)." });
        }
   
        const exam = await Exam.findById(exam_id);

         if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
       
        const answer = await AnswerExam.findOne({
            exam: exam.id,
            student: student_id
        });

        if (answer && answer.submitted_at) {
            return res.status(400).json({ message: 'Sorry! You can no longer submit your activity. Already submitted.' });
        } 

        if(!answer) {
            return res.status(400).json({ message: 'Not yet taking the activity.' });
        }
    

        // if (answer) {
        //     const opened_quiz = moment.tz(answer.opened_at, "YYYY-MM-DD HH:mm:ss", 'Asia/Manila');
        //     const diffMinutes = now.diff(opened_quiz, 'minutes');

        //     if (diffMinutes >= exam.submission_time) {
        //         return res.status(400).json({ message: 'Sorry! You can no longer submit your quiz. The time is up.' });
        //     }
        // } else {
        //     return res.status(400).json({ message: 'Not yet taking the quiz.' });
        // }
  
        answer.answers = array_answers;
        answer.submitted_at = storeCurrentDate(0, 'hours');

        await answer.save();

        return res.status(200).json({ message: 'New answer successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create answer.' });
    }
});



export const update_specific_student_exam_points = asyncHandler(async (req, res) => {    
    const { answer_exam_id } = req.params; // Get the meal ID from the request parameters
    const { points} = req.body;

    try {
        if (!points) {
            return res.status(400).json({ message: "Please provide all fields (points)." });
        }

        const updatedAnswer = await AnswerExam.findById(answer_exam_id);

        if (!updatedAnswer) {
            return res.status(404).json({ message: "Exam not found" });
        }
        
        updatedAnswer.points = points ? points : updatedAnswer.points;
    
        await updatedAnswer.save();

        return res.status(200).json({ data: 'Exam successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update exam.' });
    }
});


