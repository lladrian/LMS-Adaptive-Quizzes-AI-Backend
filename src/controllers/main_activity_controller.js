import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import dotenv from "dotenv";
import MainActivity from "../models/main_activity.js";
import MainAnswer from "../models/main_answer.js";

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


export const create_activity = asyncHandler(async (req, res) => {
  const {
    classroom_id,
    question,
    time_limit,
    title,
    description,
    grading_breakdown,
    activity_type,
  } = req.body;

  try {
    if (
      !classroom_id ||
      !question ||
      !time_limit ||
      !title ||
      !description ||
      !activity_type ||
      !grading_breakdown
    ) {
      return res
        .status(400)
        .json({
          message:
            "Please provide all fields (classroom_id, question, time_limit, title, description, grading_breakdown, activity_type).",
        });
    }

    const newMainActivity = new MainActivity({
      classroom: classroom_id,
      question: question,
      title: title,
      activity_type: activity_type,
      grading_breakdown: grading_breakdown,
      description: description,
      submission_time: time_limit,
      created_at: storeCurrentDate(0, "hours"),
    });

    await newMainActivity.save();

    return res.status(200).json({ data: newMainActivity });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create activity." });
  }
});

export const get_all_activity_specific_classroom = asyncHandler(async (req, res) => {
    const { classroom_id } = req.params; // Get the meal ID from the request parameters

    try {
      const classroom = await Classroom.findById(classroom_id).populate(
        "instructor"
      );

      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found." });
      }

      const main_activity = await MainActivity.find({
        classroom: classroom.id,
      });

      return res.status(200).json({ data: main_activity });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to get all activity in specific classroom." });
    }
  }
);


export const get_specific_activity_specific_answer = asyncHandler(async (req, res) => {
    const { activity_id, student_id } = req.params; // Get the meal ID from the request parameters

    try {
      const main_activity = await MainActivity.findById(activity_id).populate("classroom");

      if (!main_activity) {
        return res.status(404).json({ message: "Activity not found." });
      }

      const main_answer = await MainAnswer.findOne({
        student: student_id,
        main_activity: main_activity.id,
      }).populate({
        path: "mainactivity",
        populate: { path: "classroom" },
      });

      return res.status(200).json({ data: main_answer });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get specific activity." });
    }
  }
);

export const get_specific_activity = asyncHandler(async (req, res) => {
  const { activity_id } = req.params; // Get the meal ID from the request parameters

  try {
    const main_activity = await MainActivity.findById(activity_id).populate("classroom");

    if (!main_activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    return res.status(200).json({ data: main_activity });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get specific activity." });
  }
});

export const update_activity = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the meal ID from the request parameters
  const {
    classroom_id,
    question,
    time_limit,
    title,
    description,
    grading_breakdown,
    activity_type,
  } = req.body;

  try {
    if (
      !classroom_id ||
      !question ||
      !time_limit ||
      !title ||
      !description ||
      !grading_breakdown || 
      !activity_type 
    ) {
      return res
        .status(400)
        .json({
          message:
            "Please provide all fields (classroom_id, question, title, description, grading_breakdown, time_limit, activity_type).",
        });
    }

    const updatedExam = await Exam.findById(id);

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    updatedExam.classroom = classroom_id ? classroom_id : updatedExam.classroom;
    updatedExam.question = question ? question : updatedExam.question;
    updatedExam.title = title ? title : updatedExam.title;
    updatedExam.description = description ? description : updatedExam.description;
    updatedExam.grading_breakdown = grading_breakdown ? grading_breakdown : updatedExam.grading_breakdown;
    updatedExam.submission_time = time_limit ? time_limit : updatedExam.submission_time;
    updatedExam.submission_time = activity_type ? activity_type : updatedExam.activity_type;

    
    await updatedExam.save();

    return res.status(200).json({ data: "Exam successfully updated." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update exam." });
  }
});

export const delete_activity = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the meal ID from the request parameters

  try {
    const deletedMainActivity = await MainActivity.findByIdAndDelete(id);

    if (!deletedMainActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    return res.status(200).json({ data: "Activity successfully deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete activity." });
  }
});
