// controllers/extend_controller.js
import Activity from "../models/activity.js";
import Quiz from "../models/quiz.js";
import Exam from "../models/exam.js";
import Assignment from "../models/assignment.js";

const modelMap = {
  activity: Activity,
  quiz: Quiz,
  exam: Exam,
  assignment: Assignment,
};

export const extendTime = async (req, res) => {
  try {
    const { activityType, activityId } = req.params;
    const { minutes } = req.body;

    // Validate minutes
    if (!minutes || isNaN(minutes)) {
      return res.status(400).json({
        error: "Please provide valid minutes as a number",
      });
    }

    const model = modelMap[activityType];
    if (!model) {
      return res.status(400).json({
        error:
          "Invalid activity type. Must be one of: activity, quiz, exam, assignment",
      });
    }

    const updatedActivity = await model.findByIdAndUpdate(
      activityId,
      {
        $inc: { extended_minutes: parseInt(minutes) },
        $set: { updated_at: new Date() },
      },
      { new: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json({
      success: true,
      data: {
        id: updatedActivity._id,
        extended_minutes: updatedActivity.extended_minutes,
        total_time:
          updatedActivity.submission_time + updatedActivity.extended_minutes,
      },
      message: `Time extended by ${minutes} minutes successfully`,
    });
  } catch (error) {
    console.error("Error extending time:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
