import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import dotenv from "dotenv";

import MainActivity from "../models/main_activity.js";
import MainAnswer from "../models/main_answer.js";
import Student from "../models/student.js";
import Classroom from "../models/classroom.js";

function storeCurrentDate(expirationAmount, expirationUnit) {
  // Get the current date and time in Asia/Manila timezone
  const currentDateTime = moment.tz("Asia/Manila");
  // Calculate the expiration date and time
  const expirationDateTime = currentDateTime
    .clone()
    .add(expirationAmount, expirationUnit);

  // Format the current date and expiration date
  const formattedExpirationDateTime = expirationDateTime.format(
    "YYYY-MM-DD HH:mm:ss"
  );

  // Return both current and expiration date-time
  return formattedExpirationDateTime;
}

export const take_activity = asyncHandler(async (req, res) => {
  const { activity_id, student_id } = req.params;

  try {
    const existingAnswer = await MainAnswer.findOne({
      main_activity: activity_id,
      student: student_id,
    });

    if (existingAnswer) {
      return res
        .status(400)
        .json({ message: "You have already started this activity." });
    }

    const newAnswer = new MainAnswer({
      main_activity: activity_id,
      student: student_id,
      opened_at: storeCurrentDate(0, "hours"),
      created_at: storeCurrentDate(0, "hours"),
    });

    await newAnswer.save();

    return res
      .status(200)
      .json({ message: "Student successfully started the activity." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to start activity." });
  }
});

export const get_all_answer_specific_student_specific_classroom = asyncHandler(
  async (req, res) => {
    const { classroom_id, student_id } = req.params;

    try {
      const classroom = await Classroom.findById(classroom_id);

      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found." });
      }

      const all_answers = await MainAnswer.find({
        student: student_id,
      }).populate({
        path: "main_activity",
        match: { classroom: classroom_id },
      });

      const answers = all_answers.filter(
        (answer) => answer.main_activity !== null
      );

      return res.status(200).json({ data: answers });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get all answers." });
    }
  }
);

export const get_all_answer_specific_activity = asyncHandler(
  async (req, res) => {
    const { activity_id } = req.params;

    try {
      const main_activity = await MainActivity.findById(activity_id);

      if (!main_activity) {
        return res.status(404).json({ message: "Activity not found." });
      }

      const answers = await MainAnswer.find({
        main_activity: activity_id,
      }).populate("student");

      return res.status(200).json({ data: answers });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get all answers." });
    }
  }
);

export const get_all_student_missing_answer_specific_activity = asyncHandler(
  async (req, res) => {
    const { activity_id } = req.params;

    try {
      const main_activity = await MainActivity.findById(activity_id);

      if (!main_activity) {
        return res.status(404).json({ message: "Activity not found." });
      }

      const answers = await MainAnswer.find({
        main_activity: activity_id,
        submitted_at: { $ne: null },
      }).populate("student");

      const answeredStudentIds = answers.map((ans) => ans.student._id);

      const students_missing = await Student.find({
        role: "student",
        _id: { $nin: answeredStudentIds },
        joined_classroom: main_activity.classroom,
      });

      return res.status(200).json({ data: students_missing });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get missing students." });
    }
  }
);

export const get_specific_answer = asyncHandler(async (req, res) => {
  const { answer_id } = req.params;

  try {
    const answer = await MainAnswer.findById(answer_id)
      .populate("main_activity")
      .populate("student");

    if (!answer) {
      return res.status(404).json({ message: "Answer not found." });
    }

    return res.status(200).json({ data: answer });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get specific answer." });
  }
});

export const create_answer = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const { activity_id, student_id } = req.params;
  const now = moment.tz("Asia/Manila");

  try {
    if (!answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ message: "Please provide an array of answers." });
    }

    const main_activity = await MainActivity.findById(activity_id);

    if (!main_activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    const answer = await MainAnswer.findOne({
      main_activity: activity_id,
      student: student_id,
    });

    if (!answer) {
      return res.status(400).json({ message: "Not yet started the activity." });
    }

    if (answer.submitted_at) {
      return res.status(400).json({ message: "Activity already submitted." });
    }

    const opened_at = moment.tz(
      answer.opened_at,
      "YYYY-MM-DD HH:mm:ss",
      "Asia/Manila"
    );
    const timeElapsed = now.diff(opened_at, "minutes");
    const totalTimeAllowed =
      main_activity.submission_time + (main_activity.extended_minutes || 0);

    if (timeElapsed >= totalTimeAllowed) {
      return res
        .status(400)
        .json({ message: "Time limit exceeded for this activity." });
    }

    // Process and validate answers
    const processedAnswers = answers
      .map((ans) => {
        const question = main_activity.question.find(
          (q) => q._id.toString() === ans.questionId
        );
        if (!question) return null;

        let is_correct = 0;
        let points = 0;

        if (question.answer_type === "options") {
          is_correct = ans.selected_option === question.correct_option ? 1 : 0;
          points = is_correct ? question.points : 0;
        } else if (question.answer_type === "programming") {
          // For programming questions, we'll assume manual grading is needed
          // So default to 0 points unless specified otherwise
          points = ans.points || 0;
          is_correct = points > 0 ? 1 : 0;
        }

        return {
          questionId: ans.questionId,
          line_of_code: ans.line_of_code || null,
          selected_option: ans.selected_option || null,
          points: points,
          is_correct: is_correct,
        };
      })
      .filter((ans) => ans !== null);

    answer.answers = processedAnswers;
    answer.submitted_at = storeCurrentDate(0, "hours");

    await answer.save();

    return res.status(200).json({
      message: "Answer successfully submitted.",
      data: answer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to submit answer." });
  }
});

export const grade_answer = asyncHandler(async (req, res) => {
  const { answer_id } = req.params;
  const { grades } = req.body; // Array of { questionId, points }

  try {
    const answer = await MainAnswer.findById(answer_id).populate(
      "main_activity"
    );

    if (!answer) {
      return res.status(404).json({ message: "Answer not found." });
    }

    if (!answer.submitted_at) {
      return res.status(400).json({ message: "Answer not yet submitted." });
    }

    // Update grades for each question
    answer.answers = answer.answers.map((ans) => {
      const grade = grades.find((g) => g.questionId === ans.questionId);
      if (grade) {
        return {
          ...ans.toObject(),
          points: grade.points,
          is_correct: grade.points > 0 ? 1 : 0,
        };
      }
      return ans;
    });

    await answer.save();

    return res.status(200).json({
      message: "Answer successfully graded.",
      data: answer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to grade answer." });
  }
});
