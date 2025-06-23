import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import dotenv from "dotenv";

import MainActivity from "../models/main_activity.js";
import MainAnswer from "../models/main_answer.js";


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

    const [main_activity] = await Promise.all([
      MainActivity.find({ classroom: classroom_id }),
    ]);

    const mainActivityWithAnswers = await Promise.all(
      main_activity.map(async (activity) => {
        const answer = await MainAnswer.findOne({
          main_activity: activity._id,
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

    return res.status(200).json({ data: mainActivityWithAnswers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to calculate grade." });
  }
});

export const get_all_student_grade_specific_classroom = asyncHandler(async (req, res) => {
    const { classroom_id } = req.params;

    try {
      const classroom = await Classroom.findById(classroom_id);
      if (!classroom)
        return res.status(404).json({ message: "Classroom not found" });

      // Get all students in this classroom
      const students = await Student.find({
        joined_classroom: classroom.id,
      });


      const results = await Promise.all(
        students.map(async (student) => {
          const student_id = student._id;

          const activityWithAnswers = await Promise.all(
            activities.map(async (activity) => {
              const answer = await MainAnswer.findOne({
                main_activity: activity._id,
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
                totalPoints,
                earnedPoints
              };
            })
          );

          return {
            student,
            activityWithAnswers,
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
