import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import dotenv from "dotenv";
import AnswerQuiz from "../models/answer_quiz.js";
import AnswerExam from "../models/answer_exam.js";
import AnswerActivity from "../models/answer_activity.js";
import AnswerAssignment from "../models/answer_assignment.js";
import Activity from "../models/activity.js";
import Quiz from "../models/quiz.js";
import Exam from "../models/exam.js";
import Assignment from "../models/assignment.js";
import Student from "../models/student.js";
import Classroom from "../models/classroom.js";

function storeCurrentDate(expirationAmount, expirationUnit) {
  const currentDateTime = moment.tz("Asia/Manila");
  const expirationDateTime = currentDateTime
    .clone()
    .add(expirationAmount, expirationUnit);
  const formattedExpirationDateTime = expirationDateTime.format(
    "YYYY-MM-DD HH:mm:ss"
  );
  return formattedExpirationDateTime;
}

export const compute_grade = asyncHandler(async (req, res) => {
  const { classroom_id, student_id } = req.params;

  try {
    const classroom = await Classroom.findById(classroom_id);
    const student = await Student.findById(student_id);

    if (!classroom)
      return res.status(404).json({ message: "Classroom not found" });
    if (!student)
      return res.status(404).json({ message: "Student not found." });

    const [quizzes, exams, activities, assignments] = await Promise.all([
      Quiz.find({ classroom: classroom_id }),
      Exam.find({ classroom: classroom_id }),
      Activity.find({ classroom: classroom_id }),
      Assignment.find({ classroom: classroom_id }),
    ]);

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
          grading_breakdown: exam.grading_breakdown,
        };
      })
    );

    const quizzesWithAnswers = await Promise.all(
      quizzes.map(async (quiz) => {
        const answer = await AnswerQuiz.findOne({
          quiz: quiz._id,
          student: student_id,
        });

        const totalPoints = quiz.question.reduce(
          (sum, q) => sum + (q.points || 0),
          0
        );
        const earnedPoints =
          answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;

        return {
          quiz,
          answer,
          totalPoints,
          earnedPoints,
        };
      })
    );

    const assignmentsWithAnswers = await Promise.all(
      assignments.map(async (assignment) => {
        const answer = await AnswerAssignment.findOne({
          assignment: assignment._id,
          student: student_id,
        });

        const totalPoints = assignment.question.reduce(
          (sum, q) => sum + (q.points || 0),
          0
        );

        const earnedPoints =
          answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;

        return {
          assignment,
          answer,
          totalPoints,
          earnedPoints,
        };
      })
    );

    // Calculate totals for each type and term
    // Midterm calculations
    const midtermQuizzes = quizzesWithAnswers.filter(
      (quiz) => quiz.quiz.grading_breakdown === "midterm"
    );
    const midtermActivities = activityWithAnswers.filter(
      (activity) => activity.activity.grading_breakdown === "midterm"
    );
    const midtermAssignments = assignmentsWithAnswers.filter(
      (assignment) => assignment.assignment.grading_breakdown === "midterm"
    );
    const midtermExams = examsWithAnswers.filter(
      (exam) => exam.grading_breakdown === "midterm"
    );

    const totalMidtermQuizPoints = midtermQuizzes.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );
    const totalMidtermEarnedQuiz = midtermQuizzes.reduce(
      (sum, item) => sum + item.earnedPoints,
      0
    );

    const totalMidtermActivityPoints = midtermActivities.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );
    const totalMidtermEarnedActivity = midtermActivities.reduce(
      (sum, item) => sum + item.earnedPoints,
      0
    );

    const totalMidtermAssignmentPoints = midtermAssignments.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );
    const totalMidtermEarnedAssignment = midtermAssignments.reduce(
      (sum, item) => sum + item.earnedPoints,
      0
    );

    const totalMidtermExamPoints = midtermExams.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );
    const totalMidtermEarnedExam = midtermExams.reduce(
      (sum, item) => sum + item.earnedPoints,
      0
    );

    // Final calculations
    const finalQuizzes = quizzesWithAnswers.filter(
      (quiz) => quiz.quiz.grading_breakdown === "final"
    );
    const finalActivities = activityWithAnswers.filter(
      (activity) => activity.activity.grading_breakdown === "final"
    );
    const finalAssignments = assignmentsWithAnswers.filter(
      (assignment) => assignment.assignment.grading_breakdown === "final"
    );
    const finalExams = examsWithAnswers.filter(
      (exam) => exam.grading_breakdown === "final"
    );

    const totalFinalQuizPoints = finalQuizzes.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );
    const totalFinalEarnedQuiz = finalQuizzes.reduce(
      (sum, item) => sum + item.earnedPoints,
      0
    );

    const totalFinalActivityPoints = finalActivities.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );
    const totalFinalEarnedActivity = finalActivities.reduce(
      (sum, item) => sum + item.earnedPoints,
      0
    );

    const totalFinalAssignmentPoints = finalAssignments.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );
    const totalFinalEarnedAssignment = finalAssignments.reduce(
      (sum, item) => sum + item.earnedPoints,
      0
    );

    const totalFinalExamPoints = finalExams.reduce(
      (sum, item) => sum + item.totalPoints,
      0
    );
    const totalFinalEarnedExam = finalExams.reduce(
      (sum, item) => sum + item.earnedPoints,
      0
    );

    // Calculate grades for each term
    const midtermQuizGrade =
      totalMidtermQuizPoints > 0
        ? parseFloat(
            (totalMidtermEarnedQuiz / totalMidtermQuizPoints) *
              classroom.grading_system.midterm.quiz
          ).toFixed(1)
        : 0;

    const midtermActivityGrade =
      totalMidtermActivityPoints > 0
        ? parseFloat(
            (totalMidtermEarnedActivity / totalMidtermActivityPoints) *
              classroom.grading_system.midterm.activity
          ).toFixed(1)
        : 0;

    const midtermAssignmentGrade =
      totalMidtermAssignmentPoints > 0
        ? parseFloat(
            (totalMidtermEarnedAssignment / totalMidtermAssignmentPoints) *
              classroom.grading_system.midterm.assignment
          ).toFixed(1)
        : 0;

    const midtermExamGrade =
      totalMidtermExamPoints > 0
        ? parseFloat(
            (totalMidtermEarnedExam / totalMidtermExamPoints) *
              classroom.grading_system.midterm.exam
          ).toFixed(1)
        : 0;

    const finalQuizGrade =
      totalFinalQuizPoints > 0
        ? parseFloat(
            (totalFinalEarnedQuiz / totalFinalQuizPoints) *
              classroom.grading_system.final.quiz
          ).toFixed(1)
        : 0;

    const finalActivityGrade =
      totalFinalActivityPoints > 0
        ? parseFloat(
            (totalFinalEarnedActivity / totalFinalActivityPoints) *
              classroom.grading_system.final.activity
          ).toFixed(1)
        : 0;

    const finalAssignmentGrade =
      totalFinalAssignmentPoints > 0
        ? parseFloat(
            (totalFinalEarnedAssignment / totalFinalAssignmentPoints) *
              classroom.grading_system.final.assignment
          ).toFixed(1)
        : 0;

    const finalExamGrade =
      totalFinalExamPoints > 0
        ? parseFloat(
            (totalFinalEarnedExam / totalFinalExamPoints) *
              classroom.grading_system.final.exam
          ).toFixed(1)
        : 0;

    // Calculate term grades
    const midtermGrade = parseFloat(
      (
        parseFloat(midtermQuizGrade) +
        parseFloat(midtermActivityGrade) +
        parseFloat(midtermAssignmentGrade) +
        parseFloat(midtermExamGrade)
      ).toFixed(1)
    );

    const finalGrade = parseFloat(
      (
        parseFloat(finalQuizGrade) +
        parseFloat(finalActivityGrade) +
        parseFloat(finalAssignmentGrade) +
        parseFloat(finalExamGrade)
      ).toFixed(1)
    );

    // Calculate overall grade (average of midterm and final)
    const overallGrade = parseFloat(
      ((parseFloat(midtermGrade) + parseFloat(finalGrade)) / 2).toFixed(1)
    );

    const data = {
      midterm: {
        quiz: {
          totalPoints: totalMidtermQuizPoints,
          earnedPoints: totalMidtermEarnedQuiz,
          grade: parseFloat(midtermQuizGrade),
        },
        activity: {
          totalPoints: totalMidtermActivityPoints,
          earnedPoints: totalMidtermEarnedActivity,
          grade: parseFloat(midtermActivityGrade),
        },
        assignment: {
          totalPoints: totalMidtermAssignmentPoints,
          earnedPoints: totalMidtermEarnedAssignment,
          grade: parseFloat(midtermAssignmentGrade),
        },
        exam: {
          totalPoints: totalMidtermExamPoints,
          earnedPoints: totalMidtermEarnedExam,
          grade: parseFloat(midtermExamGrade),
        },
        term_grade: parseFloat(midtermGrade),
      },
      final: {
        quiz: {
          totalPoints: totalFinalQuizPoints,
          earnedPoints: totalFinalEarnedQuiz,
          grade: parseFloat(finalQuizGrade),
        },
        activity: {
          totalPoints: totalFinalActivityPoints,
          earnedPoints: totalFinalEarnedActivity,
          grade: parseFloat(finalActivityGrade),
        },
        assignment: {
          totalPoints: totalFinalAssignmentPoints,
          earnedPoints: totalFinalEarnedAssignment,
          grade: parseFloat(finalAssignmentGrade),
        },
        exam: {
          totalPoints: totalFinalExamPoints,
          earnedPoints: totalFinalEarnedExam,
          grade: parseFloat(finalExamGrade),
        },
        term_grade: parseFloat(finalGrade),
      },
      student_grade: {
        grade: parseFloat(overallGrade),
      },
    };

    return res.status(200).json({ data: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to calculate grade." });
  }
});

export const get_all_Student_grade_specific_classroom = asyncHandler(
  async (req, res) => {
    const { classroom_id } = req.params;

    try {
      const classroom = await Classroom.findById(classroom_id);
      if (!classroom)
        return res.status(404).json({ message: "Classroom not found" });

      // Get all students in this classroom
      const students = await Student.find({
        joined_classroom: classroom.id,
      });

      // Get all assessments in classroom
      const [quizzes, exams, activities, assignments] = await Promise.all([
        Quiz.find({ classroom: classroom_id }),
        Exam.find({ classroom: classroom_id }),
        Activity.find({ classroom: classroom_id }),
        Assignment.find({ classroom: classroom_id }),
      ]);

      const results = await Promise.all(
        students.map(async (student) => {
          const student_id = student._id;

          const activityWithAnswers = await Promise.all(
            activities.map(async (activity) => {
              const answer = await AnswerActivity.findOne({
                activity: activity._id,
                student: student_id,
              });
              const totalPoints =
                activity.question?.reduce(
                  (sum, q) => sum + (q.points || 0),
                  0
                ) || 0;
              const earnedPoints =
                answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) ||
                0;
              return {
                activity,
                totalPoints,
                earnedPoints,
                grading_breakdown: activity.grading_breakdown,
              };
            })
          );

          const quizzesWithAnswers = await Promise.all(
            quizzes.map(async (quiz) => {
              const answer = await AnswerQuiz.findOne({
                quiz: quiz._id,
                student: student_id,
              });
              const totalPoints =
                quiz.question?.reduce((sum, q) => sum + (q.points || 0), 0) ||
                0;
              const earnedPoints =
                answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) ||
                0;
              return {
                quiz,
                totalPoints,
                earnedPoints,
                grading_breakdown: quiz.grading_breakdown,
              };
            })
          );

          const examsWithAnswers = await Promise.all(
            exams.map(async (exam) => {
              const answer = await AnswerExam.findOne({
                exam: exam._id,
                student: student_id,
              });
              const totalPoints =
                exam.question?.reduce((sum, q) => sum + (q.points || 0), 0) ||
                0;
              const earnedPoints =
                answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) ||
                0;
              return {
                exam,
                grading_breakdown: exam.grading_breakdown,
                totalPoints,
                earnedPoints,
              };
            })
          );

          const assignmentsWithAnswers = await Promise.all(
            assignments.map(async (assignment) => {
              const answer = await AnswerAssignment.findOne({
                assignment: assignment._id,
                student: student_id,
              });
              const totalPoints =
                assignment.question?.reduce(
                  (sum, q) => sum + (q.points || 0),
                  0
                ) || 0;
              const earnedPoints =
                answer?.answers?.reduce((sum, a) => sum + (a.points || 0), 0) ||
                0;
              return {
                assignment,
                totalPoints,
                earnedPoints,
                grading_breakdown: assignment.grading_breakdown,
              };
            })
          );

          // Midterm calculations
          const midtermQuizzes = quizzesWithAnswers.filter(
            (q) => q.grading_breakdown === "midterm"
          );
          const midtermActivities = activityWithAnswers.filter(
            (a) => a.grading_breakdown === "midterm"
          );
          const midtermAssignments = assignmentsWithAnswers.filter(
            (a) => a.grading_breakdown === "midterm"
          );
          const midtermExams = examsWithAnswers.filter(
            (e) => e.grading_breakdown === "midterm"
          );

          const totalMidtermQuizPoints = midtermQuizzes.reduce(
            (sum, item) => sum + item.totalPoints,
            0
          );
          const earnedMidtermQuizPoints = midtermQuizzes.reduce(
            (sum, item) => sum + item.earnedPoints,
            0
          );

          const totalMidtermActivityPoints = midtermActivities.reduce(
            (sum, item) => sum + item.totalPoints,
            0
          );
          const earnedMidtermActivityPoints = midtermActivities.reduce(
            (sum, item) => sum + item.earnedPoints,
            0
          );

          const totalMidtermAssignmentPoints = midtermAssignments.reduce(
            (sum, item) => sum + item.totalPoints,
            0
          );
          const earnedMidtermAssignmentPoints = midtermAssignments.reduce(
            (sum, item) => sum + item.earnedPoints,
            0
          );

          const totalMidtermExamPoints = midtermExams.reduce(
            (sum, item) => sum + item.totalPoints,
            0
          );
          const earnedMidtermExamPoints = midtermExams.reduce(
            (sum, item) => sum + item.earnedPoints,
            0
          );

          // Final calculations
          const finalQuizzes = quizzesWithAnswers.filter(
            (q) => q.grading_breakdown === "final"
          );
          const finalActivities = activityWithAnswers.filter(
            (a) => a.grading_breakdown === "final"
          );
          const finalAssignments = assignmentsWithAnswers.filter(
            (a) => a.grading_breakdown === "final"
          );
          const finalExams = examsWithAnswers.filter(
            (e) => e.grading_breakdown === "final"
          );

          const totalFinalQuizPoints = finalQuizzes.reduce(
            (sum, item) => sum + item.totalPoints,
            0
          );
          const earnedFinalQuizPoints = finalQuizzes.reduce(
            (sum, item) => sum + item.earnedPoints,
            0
          );

          const totalFinalActivityPoints = finalActivities.reduce(
            (sum, item) => sum + item.totalPoints,
            0
          );
          const earnedFinalActivityPoints = finalActivities.reduce(
            (sum, item) => sum + item.earnedPoints,
            0
          );

          const totalFinalAssignmentPoints = finalAssignments.reduce(
            (sum, item) => sum + item.totalPoints,
            0
          );
          const earnedFinalAssignmentPoints = finalAssignments.reduce(
            (sum, item) => sum + item.earnedPoints,
            0
          );

          const totalFinalExamPoints = finalExams.reduce(
            (sum, item) => sum + item.totalPoints,
            0
          );
          const earnedFinalExamPoints = finalExams.reduce(
            (sum, item) => sum + item.earnedPoints,
            0
          );

          // Calculate grades for each term
          const midtermQuizGrade =
            totalMidtermQuizPoints > 0
              ? parseFloat(
                  (earnedMidtermQuizPoints / totalMidtermQuizPoints) *
                    classroom.grading_system.midterm.quiz
                ).toFixed(1)
              : 0;

          const midtermActivityGrade =
            totalMidtermActivityPoints > 0
              ? parseFloat(
                  (earnedMidtermActivityPoints / totalMidtermActivityPoints) *
                    classroom.grading_system.midterm.activity
                ).toFixed(1)
              : 0;

          const midtermAssignmentGrade =
            totalMidtermAssignmentPoints > 0
              ? parseFloat(
                  (earnedMidtermAssignmentPoints /
                    totalMidtermAssignmentPoints) *
                    classroom.grading_system.midterm.assignment
                ).toFixed(1)
              : 0;

          const midtermExamGrade =
            totalMidtermExamPoints > 0
              ? parseFloat(
                  (earnedMidtermExamPoints / totalMidtermExamPoints) *
                    classroom.grading_system.midterm.exam
                ).toFixed(1)
              : 0;

          const finalQuizGrade =
            totalFinalQuizPoints > 0
              ? parseFloat(
                  (earnedFinalQuizPoints / totalFinalQuizPoints) *
                    classroom.grading_system.final.quiz
                ).toFixed(1)
              : 0;

          const finalActivityGrade =
            totalFinalActivityPoints > 0
              ? parseFloat(
                  (earnedFinalActivityPoints / totalFinalActivityPoints) *
                    classroom.grading_system.final.activity
                ).toFixed(1)
              : 0;

          const finalAssignmentGrade =
            totalFinalAssignmentPoints > 0
              ? parseFloat(
                  (earnedFinalAssignmentPoints / totalFinalAssignmentPoints) *
                    classroom.grading_system.final.assignment
                ).toFixed(1)
              : 0;

          const finalExamGrade =
            totalFinalExamPoints > 0
              ? parseFloat(
                  (earnedFinalExamPoints / totalFinalExamPoints) *
                    classroom.grading_system.final.exam
                ).toFixed(1)
              : 0;

          // Calculate term grades
          const midtermGrade = parseFloat(
            (
              parseFloat(midtermQuizGrade) +
              parseFloat(midtermActivityGrade) +
              parseFloat(midtermAssignmentGrade) +
              parseFloat(midtermExamGrade)
            ).toFixed(1)
          );

          const finalGrade = parseFloat(
            (
              parseFloat(finalQuizGrade) +
              parseFloat(finalActivityGrade) +
              parseFloat(finalAssignmentGrade) +
              parseFloat(finalExamGrade)
            ).toFixed(1)
          );

          // Calculate overall grade (average of midterm and final)
          const overallGrade = parseFloat(
            ((parseFloat(midtermGrade) + parseFloat(finalGrade)) / 2).toFixed(1)
          );

          return {
            classroom: {
              grading_system: classroom.grading_system,
            },
            student: student,
            grades: {
              midterm: {
                quiz: {
                  totalPoints: totalMidtermQuizPoints,
                  earnedPoints: earnedMidtermQuizPoints,
                  grade: parseFloat(midtermQuizGrade),
                },
                activity: {
                  totalPoints: totalMidtermActivityPoints,
                  earnedPoints: earnedMidtermActivityPoints,
                  grade: parseFloat(midtermActivityGrade),
                },
                assignment: {
                  totalPoints: totalMidtermAssignmentPoints,
                  earnedPoints: earnedMidtermAssignmentPoints,
                  grade: parseFloat(midtermAssignmentGrade),
                },
                exam: {
                  totalPoints: totalMidtermExamPoints,
                  earnedPoints: earnedMidtermExamPoints,
                  grade: parseFloat(midtermExamGrade),
                },
                term_grade: parseFloat(midtermGrade),
              },
              final: {
                quiz: {
                  totalPoints: totalFinalQuizPoints,
                  earnedPoints: earnedFinalQuizPoints,
                  grade: parseFloat(finalQuizGrade),
                },
                activity: {
                  totalPoints: totalFinalActivityPoints,
                  earnedPoints: earnedFinalActivityPoints,
                  grade: parseFloat(finalActivityGrade),
                },
                assignment: {
                  totalPoints: totalFinalAssignmentPoints,
                  earnedPoints: earnedFinalAssignmentPoints,
                  grade: parseFloat(finalAssignmentGrade),
                },
                exam: {
                  totalPoints: totalFinalExamPoints,
                  earnedPoints: earnedFinalExamPoints,
                  grade: parseFloat(finalExamGrade),
                },
                term_grade: parseFloat(finalGrade),
              },
              student_grade: {
                grade: parseFloat(overallGrade),
              },
            },
          };
        })
      );

      return res.status(200).json({ data: results });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error retrieving student grades." });
    }
  }
);
