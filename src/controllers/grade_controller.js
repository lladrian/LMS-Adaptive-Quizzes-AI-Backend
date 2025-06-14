import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import AnswerQuiz from '../models/answer_quiz.js';
import AnswerExam from '../models/answer_exam.js';
import AnswerActivity from '../models/answer_activity.js';
import Activity  from '../models/activity.js';
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

        const activities = await Activity.find({
            classroom: classroom_id, // assuming classroom_id is a valid ObjectId
        });

        const activityWithAnswers = await Promise.all(
            activities.map(async (activity) => {
                const answer = await AnswerActivity.findOne({
                activity: activity._id,
                student: student_id,
                });

                const totalPoints = activity.question.reduce(
                (sum, q) => sum + (q.points || 0),
                0
                );

                const earnedPoints =
                answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;

                return {
                activity,
                answer,
                totalPoints,
                earnedPoints,
                };
            })
        );

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

        const totalAllPointsActivity = activityWithAnswers.reduce((sum, item) => sum + item.totalPoints, 0);
        const totalAllEarnedActivity = activityWithAnswers.reduce((sum, item) => sum + item.earnedPoints, 0);


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

        const quiz_grade = parseFloat((totalAllEarnedQuiz / totalAllPointsQuiz * classroom.grading_system.quiz).toFixed(1)) || 0;
        const midterm_grade = parseFloat((totalMidtermEarnedExam / totalMidtermPointsExam * classroom.grading_system.midterm).toFixed(1)) || 0;
        const final_grade = parseFloat((totalFinalEarnedExam / totalFinalPointsExam * classroom.grading_system.final).toFixed(1)) || 0;
        const activity_grade = parseFloat((totalAllEarnedActivity / totalAllPointsActivity * classroom.grading_system.activity).toFixed(1)) || 0;



        const data = {
            quiz: {
                totalPoints: totalAllPointsQuiz,
                earnedPoints: totalAllEarnedQuiz,
                quiz: quiz_grade,
            },
            midterm: {
                totalPoints: totalMidtermPointsExam,
                earnedPoints: totalMidtermEarnedExam,
                midterm: midterm_grade,
            },
            final: {
                totalPoints: totalFinalPointsExam,
                earnedPoints: totalFinalEarnedExam,
                final: final_grade,
            },
            activity: {
                totalPoints: totalAllPointsActivity,
                earnedPoints: totalAllEarnedActivity,
                activity: activity_grade,
            },
            student_grade: {
                grade: quiz_grade + activity_grade + midterm_grade  + final_grade
            },
        }

        return res.status(200).json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to calculate grade.' });
    }
});


export const get_all_Student_grade_specific_classroom = asyncHandler(async (req, res) => {
  const { classroom_id } = req.params;

  try {
    const classroom = await Classroom.findById(classroom_id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    // Get all students in this classroom
    const students = await Student.find({ 
    joined_classroom: classroom.id 
    });

    // Get all assessments in classroom
    const [quizzes, exams, activities] = await Promise.all([
      Quiz.find({ classroom: classroom_id }),
      Exam.find({ classroom: classroom_id }),
      Activity.find({ classroom: classroom_id }),
    ]);

    const results = await Promise.all(
      students.map(async (student) => {
        const student_id = student._id;

        const activityWithAnswers = await Promise.all(
          activities.map(async (activity) => {
            const answer = await AnswerActivity.findOne({ activity: activity._id, student: student_id });
            const totalPoints = activity.question?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
            const earnedPoints = answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;
            return { totalPoints, earnedPoints };
          })
        );

        const quizzesWithAnswers = await Promise.all(
          quizzes.map(async (quiz) => {
            const answer = await AnswerQuiz.findOne({ quiz: quiz._id, student: student_id });
            const totalPoints = quiz.question?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
            const earnedPoints = answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;
            return { totalPoints, earnedPoints };
          })
        );

        const examsWithAnswers = await Promise.all(
          exams.map(async (exam) => {
            const answer = await AnswerExam.findOne({ exam: exam._id, student: student_id });
            const totalPoints = exam.question?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
            const earnedPoints = answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;
            return {
              grading_breakdown: exam.grading_breakdown,
              totalPoints,
              earnedPoints,
            };
          })
        );

        // Aggregate per type
        const totalQuizPoints = quizzesWithAnswers.reduce((sum, item) => sum + item.totalPoints, 0);
        const earnedQuizPoints = quizzesWithAnswers.reduce((sum, item) => sum + item.earnedPoints, 0);

        const totalActivityPoints = activityWithAnswers.reduce((sum, item) => sum + item.totalPoints, 0);
        const earnedActivityPoints = activityWithAnswers.reduce((sum, item) => sum + item.earnedPoints, 0);

        const totalMidtermPoints = examsWithAnswers
          .filter(item => item.grading_breakdown === 'midterm')
          .reduce((sum, item) => sum + item.totalPoints, 0);
        const earnedMidtermPoints = examsWithAnswers
          .filter(item => item.grading_breakdown === 'midterm')
          .reduce((sum, item) => sum + item.earnedPoints, 0);

        const totalFinalPoints = examsWithAnswers
          .filter(item => item.grading_breakdown === 'final')
          .reduce((sum, item) => sum + item.totalPoints, 0);
        const earnedFinalPoints = examsWithAnswers
          .filter(item => item.grading_breakdown === 'final')
          .reduce((sum, item) => sum + item.earnedPoints, 0);


        const quiz_grade = parseFloat((earnedQuizPoints / totalQuizPoints * classroom.grading_system.quiz).toFixed(1)) || 0;
        const midterm_grade = parseFloat((earnedMidtermPoints / totalMidtermPoints * classroom.grading_system.midterm).toFixed(1)) || 0;
        const final_grade = parseFloat((earnedFinalPoints / totalFinalPoints * classroom.grading_system.final).toFixed(1)) || 0;
        const activity_grade = parseFloat((earnedActivityPoints / totalActivityPoints * classroom.grading_system.activity).toFixed(1)) || 0;

        return {
          classroom: {
            grading_system: classroom.grading_system
          },
          student: {
            _id: student._id,
            fullname: student.fullname,
            email: student.email,
            status: student.status,
          },
          grades: {
            quiz: {
              totalPoints: totalQuizPoints,
              earnedPoints: earnedQuizPoints,
              quiz: quiz_grade,
            },
            activity: {
              totalPoints: totalActivityPoints,
              earnedPoints: earnedActivityPoints,
              activity: activity_grade,
            },
            midterm: {
              totalPoints: totalMidtermPoints,
              earnedPoints: earnedMidtermPoints,
              midterm: midterm_grade,
            },
            final: {
              totalPoints: totalFinalPoints,
              earnedPoints: earnedFinalPoints,
              final: final_grade,
            },
            student_grade: {
                grade: quiz_grade + activity_grade + midterm_grade  + final_grade
            }
          },
        };
      })
    );

    return res.status(200).json({ data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving student grades.' });
  }
});


