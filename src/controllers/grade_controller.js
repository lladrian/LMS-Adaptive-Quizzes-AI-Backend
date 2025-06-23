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

// Categorize activity based on its type and the grading components
const categorizeActivity = (activity, gradingComponents) => {
  const activityType = activity.activity_type?.toLowerCase();
  const matchingComponent = Array.from(gradingComponents.keys()).find(
    (component) => activityType?.includes(component.toLowerCase())
  );
  return matchingComponent || "activity";
};

export const compute_grade = asyncHandler(async (req, res) => {
  const { classroom_id, student_id } = req.params;

  try {
    const [classroom, student, main_activities] = await Promise.all([
      Classroom.findById(classroom_id),
      Student.findById(student_id),
      MainActivity.find({ classroom: classroom_id }),
    ]);

    if (!classroom)
      return res.status(404).json({ message: "Classroom not found" });
    if (!student)
      return res.status(404).json({ message: "Student not found." });

    // Process grades for both midterm and final terms
    const results = {
      midterm: await calculateTermGrades(
        classroom,
        student_id,
        main_activities,
        "midterm"
      ),
      final: await calculateTermGrades(
        classroom,
        student_id,
        main_activities,
        "final"
      ),
    };

    // Calculate overall grade (average of midterm and final)
    const overallGrade = (
      (parseFloat(results.midterm.term_grade) +
        parseFloat(results.final.term_grade)) /
      2
    ).toFixed(1);

    return res.status(200).json({
      data: {
        midterm: results.midterm,
        final: results.final,
        student_grade: {
          grade: overallGrade,
        },
      },
      gradingSystem: {
        midterm: Object.fromEntries(
          classroom.grading_system?.midterm?.components || new Map()
        ),
        final: Object.fromEntries(
          classroom.grading_system?.final?.components || new Map()
        ),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to calculate grade." });
  }
});

export const get_all_student_grade_specific_classroom = asyncHandler(
  async (req, res) => {
    const { classroom_id } = req.params;

    try {
      const [classroom, students, main_activities] = await Promise.all([
        Classroom.findById(classroom_id),
        Student.find({ joined_classroom: classroom_id }),
        MainActivity.find({ classroom: classroom_id }),
      ]);

      if (!classroom)
        return res.status(404).json({ message: "Classroom not found" });

      const results = await Promise.all(
        students.map(async (student) => {
          const student_id = student._id;

          const midtermGrades = await calculateTermGrades(
            classroom,
            student_id,
            main_activities,
            "midterm"
          );

          const finalGrades = await calculateTermGrades(
            classroom,
            student_id,
            main_activities,
            "final"
          );

          // Calculate overall grade (average of midterm and final)
          const overallGrade = (
            (parseFloat(midtermGrades.term_grade) +
              parseFloat(finalGrades.term_grade)) /
            2
          ).toFixed(1);

          return {
            classroom: {
              grading_system: classroom.grading_system,
            },
            student,
            grades: {
              midterm: midtermGrades,
              final: finalGrades,
              student_grade: {
                grade: overallGrade,
              },
            },
          };
        })
      );

      return res.status(200).json({
        data: results,
        gradingSystem: {
          midterm: Object.fromEntries(
            classroom.grading_system?.midterm?.components || new Map()
          ),
          final: Object.fromEntries(
            classroom.grading_system?.final?.components || new Map()
          ),
        },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error retrieving student grades." });
    }
  }
);

// Helper function to calculate grades for a specific term
async function calculateTermGrades(classroom, student_id, activities, term) {
  // Get the grading components for the specified term
  const gradingComponents =
    classroom.grading_system?.[term]?.components || new Map();
  const totalWeight = Array.from(gradingComponents.values()).reduce(
    (sum, weight) => sum + weight,
    0
  );

  // Process each activity and its answers
  const activitiesWithGrades = await Promise.all(
    activities.map(async (activity) => {
      // Skip activities that don't belong to this term if they have a term property
      if (activity.term && activity.term !== term) return null;

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
      const percentage =
        totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

      const category = categorizeActivity(activity, gradingComponents);

      return {
        activity,
        answer,
        totalPoints,
        earnedPoints,
        percentage,
        category,
        grade: percentage.toFixed(1),
      };
    })
  );

  // Filter out null activities (from different terms)
  const filteredActivities = activitiesWithGrades.filter((a) => a !== null);

  // Calculate grade breakdown by category
  const categoryResults = {};
  let overallGrade = 0;

  // Initialize all grading components (even if no activities exist for them)
  gradingComponents.forEach((weight, category) => {
    categoryResults[category] = {
      totalPoints: 0,
      earnedPoints: 0,
      totalPercentage: 0,
      count: 0,
      weight,
      averagePercentage: 0,
      weightedContribution: 0,
      grade: 0,
    };
  });

  // Accumulate scores for each category
  filteredActivities.forEach(
    ({ category, percentage, earnedPoints, totalPoints }) => {
      if (gradingComponents.has(category)) {
        categoryResults[category].totalPercentage += percentage;
        categoryResults[category].count += 1;
        categoryResults[category].earnedPoints += earnedPoints;
        categoryResults[category].totalPoints += totalPoints;
      }
    }
  );

  // Calculate averages and weighted contributions
  for (const [category, data] of Object.entries(categoryResults)) {
    const weight = data.weight;
    const averagePercentage =
      data.count > 0 ? data.totalPercentage / data.count : 0;
    const weightedContribution = (averagePercentage * weight) / 100;

    categoryResults[category].averagePercentage = averagePercentage.toFixed(1);
    categoryResults[category].weightedContribution =
      weightedContribution.toFixed(1);
    categoryResults[category].grade = averagePercentage.toFixed(1);

    overallGrade += weightedContribution;
  }

  // Adjust for total weight if not 100%
  if (totalWeight > 0 && totalWeight !== 100) {
    overallGrade = (overallGrade / totalWeight) * 100;
  }

  return {
    activities: filteredActivities,
    categoryBreakdown: categoryResults,
    term_grade: overallGrade.toFixed(1),
    totalWeight,
  };
}
