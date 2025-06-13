import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import AnswerQuiz from '../models/answer_quiz.js';
import AnswerExam from '../models/answer_exam.js';
import Quiz from '../models/quiz.js';
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

export const compute_grade = asyncHandler(async (req, res) => {
    const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters    

    try {
        const classroom = await Classroom.findById(classroom_id);
        const student = await Student.findById(student_id);
        
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        const quizzes = await Quiz.find({
            classroom: classroom_id, // assuming classroom_id is a valid ObjectId
        });

        const exams = await Exam.find({
            classroom: classroom_id, // assuming classroom_id is a valid ObjectId
        });

       const examsWithAnswers = await Promise.all(
            exams.map(async (exam) => {
                const answer = await AnswerExam.findOne({
                exam: exam._id,
                student: student_id,
                });

                const totalPoints = exam.question.reduce(
                (sum, q) => sum + (q.points || 0),
                0
                );

                const earnedPoints =
                answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;

                return {
                exam,
                answer,
                totalPoints,
                earnedPoints,
                };
            })
        );

        const quizzesWithAnswers = await Promise.all(
            quizzes.map(async (quiz) => {
                const answer = await AnswerQuiz.findOne({
                quiz: quiz._id,
                student: student_id,
                });

                const totalPoints = quiz.question.reduce((sum, q) => sum + (q.points || 0), 0);

                const earnedPoints = answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;

                return {
                quiz,
                answer,
                totalPoints,
                earnedPoints,
                };
            })
        );

        const totalAllPointsQuiz = quizzesWithAnswers.reduce((sum, item) => sum + item.totalPoints, 0);
        const totalAllEarnedQuiz = quizzesWithAnswers.reduce((sum, item) => sum + item.earnedPoints, 0);

        const totalFinalPointsExam = examsWithAnswers
        .filter(item => item.exam.grading_breakdown === 'final')
        .reduce((sum, item) => sum + item.totalPoints, 0);

        const totalFinalEarnedExam = examsWithAnswers
        .filter(item => item.exam.grading_breakdown === 'final')
        .reduce((sum, item) => sum + item.earnedPoints, 0);

        const totalMidtermPointsExam = examsWithAnswers
        .filter(item => item.exam.grading_breakdown === 'midterm')
        .reduce((sum, item) => sum + item.totalPoints, 0);

        const totalMidtermEarnedExam = examsWithAnswers
        .filter(item => item.exam.grading_breakdown === 'midterm')
        .reduce((sum, item) => sum + item.earnedPoints, 0);


        const data = {
            quiz: {
                totalPoints: totalAllPointsQuiz,
                earnedPoints: totalAllEarnedQuiz,
            },
            midterm: {
                totalPoints: totalMidtermPointsExam,
                earnedPoints: totalMidtermEarnedExam,
            },
            final: {
                totalPoints: totalFinalPointsExam,
                earnedPoints: totalFinalEarnedExam,
            },
            activity: {
                totalPoints: 1,
                earnedPoints: 1,
            },
        }

     
        return res.status(200).json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to calculate grade.' });
    }
});

