import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import dotenv from "dotenv";
import Assignment from "../models/assignment.js";
import AnswerAssignment from "../models/answer_assignment.js";
import Classroom from "../models/classroom.js"; // make sure this exists if used for population

function storeCurrentDate(expirationAmount, expirationUnit) {
  const currentDateTime = moment.tz("Asia/Manila");
  const expirationDateTime = currentDateTime
    .clone()
    .add(expirationAmount, expirationUnit);
  return expirationDateTime.format("YYYY-MM-DD HH:mm:ss");
}

export const create_assignment_option = asyncHandler(async (req, res) => {
  const { classroom_id, question_option, time_limit, title, description } =
    req.body;

  if (
    !classroom_id ||
    !question_option ||
    !time_limit ||
    !title ||
    !description
  ) {
    return res.status(400).json({
      message:
        "Please provide all fields (classroom_id, question_option, time_limit, title, description).",
    });
  }

  const newAssignment = new Assignment({
    classroom: classroom_id,
    question_option: question_option,
    title,
    description,
    submission_time: time_limit,
    created_at: storeCurrentDate(0, "hours"),
  });

  await newAssignment.save();
  return res
    .status(200)
    .json({ message: "New assignment successfully created." });
});

export const create_assignment = asyncHandler(async (req, res) => {
  const { classroom_id, question, time_limit, title, description } = req.body;

  if (!classroom_id || !question || !time_limit || !title || !description) {
    return res.status(400).json({
      message:
        "Please provide all fields (classroom_id, question, time_limit, title, description).",
    });
  }

  const newAssignment = new Assignment({
    classroom: classroom_id,
    question,
    title,
    description,
    submission_time: time_limit,
    created_at: storeCurrentDate(0, "hours"),
  });

  await newAssignment.save();
  return res
    .status(200)
    .json({ message: "New assignment successfully created." });
});

export const get_all_assignment_specific_classroom = asyncHandler(
  async (req, res) => {
    const { classroom_id } = req.params;

    try {
      const classroom = await Classroom.findById(classroom_id).populate(
        "instructor"
      );
      if (!classroom)
        return res.status(404).json({ message: "Classroom not found." });

      const assignments = await Assignment.find({ classroom: classroom.id });
      return res.status(200).json({ data: assignments });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get all assignments in specific classroom.",
      });
    }
  }
);

export const get_specific_assignment_specific_answer = asyncHandler(
  async (req, res) => {
    const { assignment_id, student_id } = req.params;

    try {
      const assignment = await Assignment.findById(assignment_id).populate(
        "classroom"
      );
      if (!assignment)
        return res.status(404).json({ message: "Assignment not found." });

      const answer = await AnswerAssignment.findOne({
        student: student_id,
        assignment: assignment.id,
      }).populate({
        path: "assignment",
        populate: { path: "classroom" },
      });

      return res.status(200).json({ data: answer });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to get specific assignment answer." });
    }
  }
);

export const get_specific_assignment = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;

  try {
    const assignment = await Assignment.findById(assignment_id).populate(
      "classroom"
    );
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found." });

    return res.status(200).json({ data: assignment });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to get specific assignment." });
  }
});

export const update_assignment_option = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { classroom_id, question_option, time_limit, title, description } =
    req.body;

  if (!classroom_id || !question_option || !title || !description) {
    return res.status(400).json({
      message:
        "Please provide all fields (classroom_id, question_option, title, description).",
    });
  }

  const updatedAssignment = await Assignment.findById(id);
  if (!updatedAssignment)
    return res.status(404).json({ message: "Assignment not found" });

  updatedAssignment.classroom = classroom_id || updatedAssignment.classroom;
  updatedAssignment.question_option =
    question_option || updatedAssignment.question_option;
  updatedAssignment.title = title || updatedAssignment.title;
  updatedAssignment.description = description || updatedAssignment.description;
  updatedAssignment.submission_time =
    time_limit || updatedAssignment.submission_time;

  await updatedAssignment.save();
  return res.status(200).json({ data: "Assignment successfully updated." });
});

export const update_assignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { classroom_id, question, time_limit, title, description } = req.body;

  if (!classroom_id || !question || !title || !description) {
    return res.status(400).json({
      message:
        "Please provide all fields (classroom_id, question, title, description).",
    });
  }

  const updatedAssignment = await Assignment.findById(id);
  if (!updatedAssignment)
    return res.status(404).json({ message: "Assignment not found" });

  updatedAssignment.classroom = classroom_id || updatedAssignment.classroom;
  updatedAssignment.question = question || updatedAssignment.question;
  updatedAssignment.title = title || updatedAssignment.title;
  updatedAssignment.description = description || updatedAssignment.description;
  updatedAssignment.submission_time =
    time_limit || updatedAssignment.submission_time;

  await updatedAssignment.save();
  return res.status(200).json({ data: "Assignment successfully updated." });
});

export const delete_assignment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(id);
    if (!deletedAssignment)
      return res.status(404).json({ message: "Assignment not found" });

    return res.status(200).json({ data: "Assignment successfully deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete assignment." });
  }
});
