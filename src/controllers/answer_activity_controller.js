import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import dotenv from "dotenv";
import AnswerActivity from "../models/answer_activity.js";
import Activity from "../models/activity.js";
import Student from "../models/student.js";
import Classroom from "../models/classroom.js";

function storeCurrentDate(expirationAmount, expirationUnit) {
  const currentDateTime = moment.tz("Asia/Manila");
  const expirationDateTime = currentDateTime
    .clone()
    .add(expirationAmount, expirationUnit);
  return expirationDateTime.format("YYYY-MM-DD HH:mm:ss");
}

export const get_all_answer_specific_student_specific_classroom = asyncHandler(
  async (req, res) => {
    const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters

    try {
      const classroom = await Classroom.findById(classroom_id);

      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found." });
      }

      const all_answers = await AnswerActivity.find({ student: student_id }) // filter by student ID
        .populate({
          path: "activity",
          populate: { path: "classroom" },
        });

      const answers = all_answers.filter(
        (answer) =>
          answer.activity?.classroom?._id.toString() === classroom.id.toString()
      );

      return res.status(200).json({ data: answers });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get all answers." });
    }
  }
);

export const get_all_answer_specific_activity = asyncHandler(
  async (req, res) => {
    const { activity_id } = req.params; // Get the meal ID from the request parameters

    try {
      const activity = await Activity.findById(activity_id).populate(
        "classroom"
      );

      if (!activity) {
        return res.status(404).json({ message: "Activity not found." });
      }

      const answers = await AnswerActivity.find({
        activity: activity.id,
      }).populate("student");

      return res.status(200).json({ data: answers });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get all answers." });
    }
  }
);

export const get_all_student_missing_answer_specific_activity = asyncHandler(
  async (req, res) => {
    const { activity_id } = req.params; // Get the meal ID from the request parameters

    try {
      const activity = await Activity.findById(activity_id).populate(
        "classroom"
      );

      if (!activity) {
        return res.status(404).json({ message: "Activity not found." });
      }

      const answers = await AnswerActivity.find({
        activity: activity.id,
        submitted_at: { $ne: null },
      }).populate("student");
      const answeredStudentIds = answers.map((ans) => ans.student._id);

      const students_missing = await Student.find({
        role: "student",
        _id: { $nin: answeredStudentIds },
        joined_classroom: activity.classroom.id, // or mongoose.Types.ObjectId(classroom.id) if needed
      });

      return res.status(200).json({ data: students_missing });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to get all students have missing activity." });
    }
  }
);

export const get_specific_answer = asyncHandler(async (req, res) => {
  const { answer_id } = req.params; // Get the meal ID from the request parameters

  try {
    const answer = await AnswerActivity.findById(answer_id)
      .populate("activity")
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
  const { array_answers } = req.body;
  const { activity_id, student_id } = req.params;
  const now = moment.tz("Asia/Manila");

  try {
    if (!array_answers) {
      return res
        .status(400)
        .json({ message: "Please provide all fields (array_answers)." });
    }

    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    const answer = await AnswerActivity.findOne({
      activity: activity.id,
      student: student_id,
    });

    if (answer && answer.submitted_at) {
      return res
        .status(400)
        .json({ message: "Sorry! You have already submitted your activity." });
    }

    if (!answer) {
      return res
        .status(400)
        .json({ message: "You have not started the activity." });
    }

    answer.answers = array_answers;
    answer.submitted_at = storeCurrentDate(0, "hours");

    await answer.save();

    return res.status(200).json({ message: "Answer successfully submitted." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit answer." });
  }
});

export const take_activity = asyncHandler(async (req, res) => {
  const { activity_id, student_id } = req.params;

  try {
    const existingAnswer = await AnswerActivity.findOne({
      activity: activity_id,
      student: student_id,
    });

    if (existingAnswer) {
      return res
        .status(400)
        .json({ message: "You have already started this activity." });
    }

    const newAnswer = new AnswerActivity({
      activity: activity_id,
      student: student_id,
      opened_at: storeCurrentDate(0, "hours"),
      created_at: storeCurrentDate(0, "hours"),
    });

    await newAnswer.save();

    return res
      .status(200)
      .json({ message: "New activity successfully started." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create activity answer." });
  }
});

export const update_specific_student_activity_points = asyncHandler(
  async (req, res) => {
    const { answer_activity_id } = req.params;
    const { points } = req.body;

    try {
      if (!points) {
        return res
          .status(400)
          .json({ message: "Please provide all fields (points)." });
      }

      const updatedAnswer = await AnswerActivity.findById(answer_activity_id);
      if (!updatedAnswer) {
        return res.status(404).json({ message: "Activity answer not found" });
      }

      updatedAnswer.points = points || updatedAnswer.points;
      await updatedAnswer.save();

      return res
        .status(200)
        .json({ data: "Activity score updated successfully." });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to update activity score." });
    }
  }
);
