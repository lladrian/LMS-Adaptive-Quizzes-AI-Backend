import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import AnswerAssignment from '../models/answer_assignment.js';
import Assignment from '../models/assignment.js';
import Student from '../models/student.js';
import Classroom from '../models/classroom.js';

function storeCurrentDate(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD HH:mm:ss');
}

export const take_assignment = asyncHandler(async (req, res) => {
    const { assignment_id, student_id } = req.params;

    try {
        const existingAnswer = await AnswerAssignment.findOne({
            assignment: assignment_id,
            student: student_id
        });

        if (existingAnswer) {
            return res.status(400).json({ message: 'You have already started this assignment.' });
        }

        const newAnswer = new AnswerAssignment({
            assignment: assignment_id,
            student: student_id,
            opened_at: storeCurrentDate(0, 'hours'),
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newAnswer.save();

        return res.status(200).json({ message: 'New assignment successfully started.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create assignment answer.' });
    }
});

export const get_all_answer_specific_student_specific_classroom = asyncHandler(async (req, res) => {
    const { classroom_id, student_id } = req.params;

    try {
        const classroom = await Classroom.findById(classroom_id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const all_answers = await AnswerAssignment.find({ student: student_id })
            .populate({
                path: 'assignment',
                populate: { path: 'classroom' }
            });

        const answers = all_answers.filter(answer =>
            answer.assignment?.classroom?._id.toString() === classroom.id.toString()
        );

        return res.status(200).json({ data: answers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all answers.' });
    }
});

export const get_all_answer_specific_assignment = asyncHandler(async (req, res) => {
    const { assignment_id } = req.params;

    try {
        const assignment = await Assignment.findById(assignment_id).populate('classroom');
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }

        const answers = await AnswerAssignment.find({ assignment: assignment.id }).populate('student');
        return res.status(200).json({ data: answers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all answers.' });
    }
});

export const get_all_student_missing_answer_specific_assignment = asyncHandler(async (req, res) => {
    const { assignment_id } = req.params;

    try {
        const assignment = await Assignment.findById(assignment_id).populate('classroom');
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }

        const answers = await AnswerAssignment.find({
            assignment: assignment.id,
            submitted_at: { $ne: null }
        }).populate('student');

        const answeredStudentIds = answers.map(ans => ans.student._id);

        const students_missing = await Student.find({
            role: 'student',
            _id: { $nin: answeredStudentIds },
            joined_classroom: assignment.classroom.id,
        });

        return res.status(200).json({ data: students_missing });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get students with missing assignment.' });
    }
});

export const get_specific_answer = asyncHandler(async (req, res) => {
    const { answer_id } = req.params;

    try {
        const answer = await AnswerAssignment.findById(answer_id)
            .populate('assignment')
            .populate('student');

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        return res.status(200).json({ data: answer });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific answer.' });
    }
});

export const create_answer = asyncHandler(async (req, res) => {
    const { array_answers } = req.body;
    const { assignment_id, student_id } = req.params;
    const now = moment.tz('Asia/Manila');

    try {
        if (!array_answers) {
            return res.status(400).json({ message: "Please provide all fields (array_answers)." });
        }

        const assignment = await Assignment.findById(assignment_id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }

        const answer = await AnswerAssignment.findOne({
            assignment: assignment.id,
            student: student_id
        });

        if (answer && answer.submitted_at) {
            return res.status(400).json({ message: 'Sorry! You have already submitted your assignment.' });
        }

        if (!answer) {
            return res.status(400).json({ message: 'You have not started the assignment.' });
        }

        answer.answers = array_answers;
        answer.submitted_at = storeCurrentDate(0, 'hours');

        await answer.save();

        return res.status(200).json({ message: 'Answer successfully submitted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to submit answer.' });
    }
});

export const update_specific_student_assignment_points = asyncHandler(async (req, res) => {
    const { answer_assignment_id } = req.params;
    const { points } = req.body;

    try {
        if (!points) {
            return res.status(400).json({ message: "Please provide all fields (points)." });
        }

        const updatedAnswer = await AnswerAssignment.findById(answer_assignment_id);
        if (!updatedAnswer) {
            return res.status(404).json({ message: "Assignment answer not found" });
        }

        updatedAnswer.points = points || updatedAnswer.points;
        await updatedAnswer.save();

        return res.status(200).json({ data: 'Assignment score updated successfully.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update assignment score.' });
    }
});
