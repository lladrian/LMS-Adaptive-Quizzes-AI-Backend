import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import dotenv from "dotenv";
import Classroom from "../models/classroom.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";
import Exam from "../models/exam.js";
import Quiz from "../models/quiz.js";
import Material from "../models/material.js";
import Activity from "../models/activity.js";
import AnswerQuiz from "../models/answer_quiz.js";
import AnswerExam from "../models/answer_exam.js";
import AnswerActivity from "../models/answer_activity.js";
import Assignment from "../models/assignment.js";
import AnswerAssignment from "../models/answer_assignment.js";

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
export const create_classroom = asyncHandler(async (req, res) => {
  const {
    classroom_name,
    subject_code,
    instructor,
    classroom_code,
    description,
    programming_language,
    grading_system,
  } = req.body;

  try {
    if (
      !classroom_name ||
      !subject_code ||
      !instructor ||
      !classroom_code ||
      !programming_language
    ) {
      return res.status(400).json({
        message:
          "Please provide all fields (classroom_name, subject_code, instructor, classroom_code, description, programming_language).",
      });
    }

    // Set default grading system if not provided
    const defaultGradingSystem = {
      midterm: {
        quiz: 15,
        exam: 50,
        activity: 20,
        assignment: 15,
      },
      final: {
        quiz: 15,
        exam: 50,
        activity: 20,
        assignment: 15,
      },
    };

    const newClassroom = new Classroom({
      classroom_name,
      subject_code,
      programming_language,
      instructor,
      classroom_code,
      description,
      grading_system: grading_system || defaultGradingSystem,
      created_at: storeCurrentDate(0, "hours"),
    });

    await newClassroom.save();

    return res.status(200).json({
      message: "New classroom successfully created.",
      data: newClassroom,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create classroom." });
  }
});

export const add_student_classroom = asyncHandler(async (req, res) => {
  const { classroom_id, student_id_number } = req.params; // Get the meal ID from the request parameters

  try {
    const classroom = await Classroom.findById(classroom_id);
    const student = await Student.findOne({ student_id_number });

    if (!classroom)
      return res.status(404).json({ message: "Classroom not found" });
    if (!student)
      return res.status(404).json({ message: "Student not found." });

    // if() {

    // }

    if (student.joined_classroom.includes(classroom.id)) {
      return res.status(400).json({ message: "Classroom already exists." });
    }

    student.joined_classroom.push(classroom.id);
    await student.save();

    return res
      .status(200)
      .json({ message: "Student joined classroom successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to joined classroom." });
  }
});

export const remove_student_classroom = asyncHandler(async (req, res) => {
  const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters

  try {
    const classroom = await Classroom.findById(classroom_id);
    const student = await Student.findById(student_id);

    if (!classroom)
      return res.status(400).json({ message: "Classroom not found" });
    if (!student)
      return res.status(404).json({ message: "Student not found." });

    if (!student.joined_classroom.includes(classroom.id)) {
      return res.status(400).json({ message: "Classroom already exists." });
    }

    // Remove classroom ID from the array
    student.joined_classroom = student.joined_classroom.filter(
      (id) => id.toString() !== classroom.id.toString()
    );

    await student.save();

    return res
      .status(200)
      .json({ message: "Student joined classroom successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to joined classroom." });
  }
});

export const student_join_classroom = asyncHandler(async (req, res) => {
  const { classroom_code, student_id } = req.body;

  try {
    if (!classroom_code || !student_id) {
      return res.status(400).json({
        message: "Please provide all fields (classroom_code, student_id).",
      });
    }

    const classroom = await Classroom.findOne({ classroom_code });
    const student = await Student.findById(student_id);

    if (!classroom)
      return res.status(400).json({ message: "Classroom not found" });
    if (!student)
      return res.status(404).json({ message: "Student not found." });

    if (student.joined_classroom.includes(classroom.id)) {
      return res.status(400).json({ message: "Classroom already exists." });
    }

    student.joined_classroom.push(classroom.id);
    await student.save();

    return res
      .status(200)
      .json({ message: "Student joined classroom successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to joined classroom." });
  }
});

export const student_leave_classroom = asyncHandler(async (req, res) => {
  const { classroom_id, student_id } = req.params; // Get the meal ID from the request parameters

  try {
    if (!classroom_id || !student_id) {
      return res.status(400).json({
        message: "Please provide all fields (classroom_id, student_id).",
      });
    }

    const classroom = await Classroom.findById(classroom_id);
    const student = await Student.findById(student_id);

    if (!classroom)
      return res.status(400).json({ message: "Classroom not found" });
    if (!student)
      return res.status(404).json({ message: "Student not found." });

    if (!student.joined_classroom.includes(classroom.id)) {
      return res.status(400).json({ message: "Classroom not exists." });
    }

    // Remove classroom ID from the array
    student.joined_classroom = student.joined_classroom.filter(
      (id) => id.toString() !== classroom.id.toString()
    );

    await student.save();

    return res
      .status(200)
      .json({ message: "Student leaved classroom successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to leaved classroom." });
  }
});

export const get_all_classroom_overview_specific_instructor = asyncHandler(
  async (req, res) => {
    const { instructor_id, classroom_id } = req.params; // Get the meal ID from the request parameters

    try {
      const instructor = await Instructor.findById(instructor_id);
      // const classroom = await Classroom.findById(classroom_id);

      if (!instructor)
        return res.status(404).json({ message: "Instructor not found." });
      // if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });

      const classrooms = await Classroom.find({
        instructor: instructor.id,
      });

      const results = await Promise.all(
        classrooms.map(async (classroom) => {
          const materials = await Material.find({
            classroom: classroom.id,
          });
          const students = await Student.find({
            joined_classroom: classroom.id,
          });
          return {
            classroom,
            materials,
            students,
          };
        })
      );

      // const materials = await Material.find({
      //     classroom : classroom.id,
      // });

      // const students = await Student.find({
      //     joined_classroom: classroom.id
      // });

      return res.status(200).json({ data: results });

      //return res.status(200).json({ data: {classrooms, students, materials} });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get all classrooms." });
    }
  }
);

export const get_all_activities_specific_student_specific_classroom =
  asyncHandler(async (req, res) => {
    const { classroom_id, student_id } = req.params;

    try {
      const classroom = await Classroom.findById(classroom_id).populate(
        "instructor"
      );
      const student = await Student.findById(student_id);

      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found." });
      }

      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }

      const exams = await Exam.find({ classroom: classroom.id });
      const quizzes = await Quiz.find({ classroom: classroom.id });
      const activities = await Activity.find({ classroom: classroom.id });
      const assignments = await Assignment.find({ classroom: classroom.id });

      const quiz_answers = await AnswerQuiz.find({
        student: student.id,
      }).populate({
        path: "quiz",
        populate: { path: "classroom", match: { _id: classroom.id } },
      });

      const exam_answers = await AnswerExam.find({
        student: student.id,
      }).populate({
        path: "exam",
        populate: { path: "classroom", match: { _id: classroom.id } },
      });

      const activity_answers = await AnswerActivity.find({
        student: student.id,
      }).populate({
        path: "activity",
        populate: { path: "classroom", match: { _id: classroom.id } },
      });

      const assignment_answers = await AnswerAssignment.find({
        student: student.id,
      }).populate({
        path: "assignment",
        populate: { path: "classroom", match: { _id: classroom.id } },
      });

      const all_quiz_answers = quiz_answers.filter(
        (answer) =>
          answer.quiz?.classroom?._id.toString() === classroom.id.toString()
      );

      const all_exam_answers = exam_answers.filter(
        (answer) =>
          answer.exam?.classroom?._id.toString() === classroom.id.toString()
      );

      const all_activity_answers = activity_answers.filter(
        (answer) =>
          answer.activity?.classroom?._id.toString() === classroom.id.toString()
      );

      const all_assignment_answers = assignment_answers.filter(
        (answer) =>
          answer.assignment?.classroom?._id.toString() ===
          classroom.id.toString()
      );

      const all_activities = [
        ...exams,
        ...quizzes,
        ...activities,
        ...assignments,
      ];
      const all_answers = [
        ...all_quiz_answers,
        ...all_exam_answers,
        ...all_activity_answers,
        ...all_assignment_answers,
      ];

      const answeredIds = [
        ...new Set(
          all_answers.map(
            (answer) =>
              answer.exam?.id ||
              answer.quiz?.id ||
              answer.activity?.id ||
              answer.assignment?.id
          )
        ),
      ];

      const answered_activities = all_activities
        .filter((activity) => answeredIds.includes(activity.id))
        .map((activity) => {
          const matchedAnswer = all_answers.find((answer) => {
            const answerId =
              answer.exam?.id ||
              answer.quiz?.id ||
              answer.activity?.id ||
              answer.assignment?.id;
            return activity.id === answerId;
          });
          return {
            activity: activity,
            answer: matchedAnswer,
          };
        });

      const unanswered_activities = all_activities
        .filter((activity) => !answeredIds.includes(activity.id))
        .map((activity) => ({
          activity: activity,
          answer: null,
        }));

      const data = {
        student: student,
        all_activities,
        answered_activities,
        unanswered_activities,
      };

      return res.status(200).json({ data: data });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to get all student activities." });
    }
  });

export const get_all_classroom_student = asyncHandler(async (req, res) => {
  const { classroom_id } = req.params; // Get the meal ID from the request parameters

  try {
    const classroom = await Classroom.findById(classroom_id).populate(
      "instructor"
    );
    const students = await Student.find({
      joined_classroom: classroom.id,
    });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found." });
    }

    return res.status(200).json({ data: { classroom, students } });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get all classrooms." });
  }
});
export const get_specific_classroom = asyncHandler(async (req, res) => {
  const { classroom_id } = req.params;

  try {
    const classroom = await Classroom.findById(classroom_id).populate(
      "instructor"
    );

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found." });
    }

    // Separate activities by grading period
    const exams = await Exam.find({ classroom: classroom.id });
    const quizzes = await Quiz.find({ classroom: classroom.id });
    const activities = await Activity.find({ classroom: classroom.id });
    const assignments = await Assignment.find({ classroom: classroom.id });
    const materials = await Material.find({ classroom: classroom.id });
    const students = await Student.find({ joined_classroom: classroom.id });

    // Categorize activities by grading period
    const midtermActivities = {
      exams: exams.filter((a) => a.grading_breakdown === "midterm"),
      quizzes: quizzes.filter((a) => a.grading_breakdown === "midterm"),
      activities: activities.filter((a) => a.grading_breakdown === "midterm"),
      assignments: assignments.filter((a) => a.grading_breakdown === "midterm"),
    };

    const finalActivities = {
      exams: exams.filter((a) => a.grading_breakdown === "final"),
      quizzes: quizzes.filter((a) => a.grading_breakdown === "final"),
      activities: activities.filter((a) => a.grading_breakdown === "final"),
      assignments: assignments.filter((a) => a.grading_breakdown === "final"),
    };

    return res.status(200).json({
      data: {
        classroom,
        midtermActivities,
        finalActivities,
        materials,
        students,
        gradingSystem: classroom.grading_system,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get data." });
  }
});

export const get_all_classroom = asyncHandler(async (req, res) => {
  try {
    const classrooms = await Classroom.find().populate("instructor");
    return res.status(200).json({ data: classrooms });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get all classrooms." });
  }
});

export const get_all_classroom_specific_student = asyncHandler(
  async (req, res) => {
    const { student_id } = req.params; // Get the meal ID from the request parameters

    try {
      const student = await Student.findById(student_id);

      if (!student)
        return res.status(404).json({ message: "Student not found." });

      const classrooms = await Classroom.find({
        _id: { $in: student.joined_classroom },
      }).populate("instructor");

      // const classrooms = await Classroom.find({
      //         _id: { $in: student.joined_classroom },
      //         is_hidden: 0
      //     }).populate('instructor');

      return res.status(200).json({ data: classrooms });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get all classrooms." });
    }
  }
);

export const get_all_classroom_specific_instructor = asyncHandler(
  async (req, res) => {
    const { instructor_id } = req.params; // Get the meal ID from the request parameters

    try {
      const instructor = await Instructor.findById(instructor_id);

      if (!instructor)
        return res.status(404).json({ message: "Instructor not found." });

      const unhide_classrooms = await Classroom.find({
        instructor: instructor.id,
        is_hidden: 0,
      }).populate("instructor");

      const hidden_classrooms = await Classroom.find({
        instructor: instructor.id,
        is_hidden: 1,
      }).populate("instructor");

      return res
        .status(200)
        .json({ data: { unhide_classrooms, hidden_classrooms } });
    } catch (error) {
      return res.status(500).json({ error: "Failed to get all classrooms." });
    }
  }
);

export const update_classroom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    classroom_name,
    subject_code,
    description,
    programming_language,
    grading_system,
  } = req.body;

  try {
    if (
      !classroom_name ||
      !subject_code ||
      !description ||
      !programming_language ||
      !grading_system
    ) {
      return res.status(400).json({
        message:
          "All fields are required: classroom_name, description, programming_language, grading_system and subject_code.",
      });
    }

    const updatedClassroom = await Classroom.findById(id);

    if (!updatedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Validate grading system structure
    if (grading_system) {
      if (!grading_system.midterm || !grading_system.final) {
        return res.status(400).json({
          message:
            "Grading system must include both midterm and final structures",
        });
      }

      // Validate weights sum to 100 for each term
      const validateTermWeights = (term) => {
        const weights = Object.values(term);
        const sum = weights.reduce((a, b) => a + b, 0);
        return sum === 100;
      };

      if (
        !validateTermWeights(grading_system.midterm) ||
        !validateTermWeights(grading_system.final)
      ) {
        return res.status(400).json({
          message: "Grading components for each term must sum to 100%",
        });
      }
    }

    updatedClassroom.description = description;
    updatedClassroom.classroom_name = classroom_name;
    updatedClassroom.subject_code = subject_code;
    updatedClassroom.programming_language = programming_language;
    updatedClassroom.grading_system = grading_system;

    await updatedClassroom.save();

    return res.status(200).json({
      message: "Classroom successfully updated.",
      data: updatedClassroom,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update classroom." });
  }
});

export const restrict_sections = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sections } = req.body;

  try {
    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const validSections = [
      "lessons",
      "assignments",
      "grades",
      "practice",
      "students",
      "materials",
      "activities",
    ];
    const invalidSections = sections.filter((s) => !validSections.includes(s));

    if (invalidSections.length > 0) {
      return res.status(400).json({
        message: `Invalid sections: ${invalidSections.join(", ")}`,
        validSections,
      });
    }

    const uniqueSections = [...new Set(sections)];

    classroom.restricted_sections = uniqueSections;
    await classroom.save();

    return res.status(200).json({
      message: "Sections restriction updated successfully",
      data: classroom,
    });
  } catch (error) {
    console.error("Error restricting sections:", error);
    return res.status(500).json({
      message: "Failed to update sections restriction",
      error: error.message,
    });
  }
});

export const hide_classroom = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the meal ID from the request parameters

  try {
    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    classroom.is_hidden = 1;

    await classroom.save();

    return res.status(200).json({ data: "Classroom successfully is hidden." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete classroom." });
  }
});

export const unhide_classroom = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the meal ID from the request parameters

  try {
    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    classroom.is_hidden = 0;

    await classroom.save();

    return res
      .status(200)
      .json({ data: "Classroom successfully is softly unhidden." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete classroom." });
  }
});
