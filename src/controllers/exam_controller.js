import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import dotenv from "dotenv";
import Exam from "../models/exam.js";
import AnswerExam from "../models/answer_exam.js";

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

export const create_exam_option = asyncHandler(async (req, res) => {
  const {
    classroom_id,
    question_option,
    time_limit,
    title,
    description,
    grading_breakdown,
  } = req.body;

  try {
    if (
      !classroom_id ||
      !question_option ||
      !time_limit ||
      !title ||
      !description ||
      !grading_breakdown
    ) {
      return res
        .status(400)
        .json({
          message:
            "Please provide all fields (classroom_id, question_option, time_limit, title, description, grading_breakdown).",
        });
    }

    const newExam = new Exam({
      classroom: classroom_id,
      question_option: question_option,
      title: title,
      grading_breakdown: grading_breakdown,
      description: description,
      submission_time: time_limit,
      created_at: storeCurrentDate(0, "hours"),
    });

    await newExam.save();

    return res.status(200).json({ message: "New exam successfully created." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create exam." });
  }
});

export const create_exam = asyncHandler(async (req, res) => {
  const {
    classroom_id,
    question,
    time_limit,
    title,
    description,
    grading_breakdown,
  } = req.body;

  try {
    if (
      !classroom_id ||
      !question ||
      !time_limit ||
      !title ||
      !description ||
      !grading_breakdown
    ) {
      return res
        .status(400)
        .json({
          message:
            "Please provide all fields (classroom_id, question, time_limit, title, description, grading_breakdown).",
        });
    }

    const newExam = new Exam({
      classroom: classroom_id,
      question: question,
      title: title,
      grading_breakdown: grading_breakdown,
      description: description,
      submission_time: time_limit,
      created_at: storeCurrentDate(0, "hours"),
    });

    await newExam.save();

    return res.status(200).json({ data: newExam });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create exam." });
  }
});

export const get_all_exam_specific_classroom = asyncHandler(
  async (req, res) => {
    const { classroom_id } = req.params; // Get the meal ID from the request parameters

    try {
      const classroom = await Classroom.findById(classroom_id).populate(
        "instructor"
      );

      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found." });
      }

      const exams = await Exam.find({
        classroom: classroom.id,
      });

      return res.status(200).json({ data: exams });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to get all exams in specific classroom." });
    }
  }
);

export const get_specific_exam_specific_answer = asyncHandler(
  async (req, res) => {
    const { exam_id, student_id } = req.params; // Get the meal ID from the request parameters

    try {
      const exam = await Exam.findById(exam_id).populate("classroom");

      if (!exam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      const answer = await AnswerExam.findOne({
        student: student_id,
        exam: exam.id,
      }).populate({
        path: "exam",
        populate: { path: "classroom" },
      });

      return res.status(200).json({ data: answer });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get specific quiz." });
    }
  }
);

export const get_specific_exam = asyncHandler(async (req, res) => {
  const { exam_id } = req.params; // Get the meal ID from the request parameters

  try {
    const exam = await Exam.findById(exam_id).populate("classroom");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    return res.status(200).json({ data: exam });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get specific exam." });
  }
});

export const update_exam = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the meal ID from the request parameters
  const {
    classroom_id,
    question,
    time_limit,
    title,
    description,
    grading_breakdown,
  } = req.body;

  try {
    if (
      !classroom_id ||
      !question ||
      !title ||
      !description ||
      !grading_breakdown
    ) {
      return res
        .status(400)
        .json({
          message:
            "Please provide all fields (classroom_id, question, title, description, grading_breakdown).",
        });
    }

    const updatedExam = await Exam.findById(id);

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    updatedExam.classroom = classroom_id ? classroom_id : updatedExam.classroom;
    updatedExam.question = question ? question : updatedExam.question;
    updatedExam.title = title ? title : updatedExam.title;
    updatedExam.description = description
      ? description
      : updatedExam.description;
    updatedExam.submission_time = time_limit
      ? time_limit
      : updatedExam.submission_time;
    updatedExam.grading_breakdown = grading_breakdown
      ? grading_breakdown
      : updatedExam.grading_breakdown;

    await updatedExam.save();

    return res.status(200).json({ data: "Exam successfully updated." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update exam." });
  }
});

export const delete_exam = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the meal ID from the request parameters

  try {
    const deletedExam = await Exam.findByIdAndDelete(id);

    if (!deletedExam)
      return res.status(404).json({ message: "Exam not found" });

    return res.status(200).json({ data: "Exam successfully deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete exam." });
  }
});
