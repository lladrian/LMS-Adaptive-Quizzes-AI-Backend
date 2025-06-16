import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Student from '../models/student.js';
import Admin from '../models/admin.js';
import Instructor from '../models/instructor.js';


function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");
    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
}


function hashConverterMD5(password) {
    return crypto.createHash('md5').update(String(password)).digest('hex');
}



export const create_student = asyncHandler(async (req, res) => {
    const { first_name, middle_name, last_name, password, email, student_id_number } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!first_name || !middle_name || !last_name || !email || !password || !student_id_number) {
            return res.status(400).json({ message: "Please provide all fields (email, password, first_name, middle_name, last_name, student_id_number)." });
        }


        if (await Student.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await Admin.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await Instructor.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });


        const hash_password = hashConverterMD5(password);
   
        const newStudent = new Student({
            first_name: first_name,
            middle_name: middle_name,
            last_name: last_name,
            password: hash_password,
            email: email,
            student_id_number: student_id_number,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newStudent.save();

        return res.status(200).json({ message: 'New student account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create student account.' });
    }
});


export const get_all_student = asyncHandler(async (req, res) => {    
    try {
        const students = await Student.find({ role: 'student' });


        return res.status(200).json({ data: students });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all students.' });
    }
});

export const get_specific_student = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const student = await Student.findById(id);
   
        res.status(200).json({ data: student });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific student.' });
    }
});


// export const login_student = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//     try {
//         // Check if both email and password are provided
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Please provide both email and password' });
//         }

//         // Find the user by email
//         let student = await Student.findOne({ email: email }); // Don't use .lean() here
//         const hash = hashConverterMD5(password);

//         // Check if the admin exists and if the password is correct
//         if (student && student.password == hash) {
//             return res.status(200).json({ data: student });
//         }

//         return res.status(400).json({ message: 'Wrong email or password.'});
//     } catch (error) {
//         return res.status(500).json({ error: 'Failed to login ' });
//     }
// });




export const update_student = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { email, student_id_number, first_name, middle_name, last_name } = req.body;

    try {
        if (!email || !student_id_number || !first_name || !middle_name || !last_name) {
            return res.status(400).json({ message: "All fields are required: email, student_id_number, first_name, middle_name, last_name." });
        }

        const updatedStudent = await Student.findById(id);
                           
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
                        
        updatedStudent.email = email ? email : updatedStudent.email;
        updatedStudent.first_name = first_name ? first_name : updatedStudent.first_name;
        updatedStudent.middle_name = middle_name ? middle_name : updatedStudent.middle_name;
        updatedStudent.last_name = last_name ? last_name : updatedStudent.last_name;
        updatedStudent.student_id_number = student_id_number ? student_id_number : updatedStudent.student_id_number;
                                
        await updatedStudent.save();

        return res.status(200).json({ data: 'Student account successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update student account.' });
    }
});



export const update_student_password = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).json({ message: "All fields are required: password." });
        }

        const hash = hashConverterMD5(password);
        const updatedStudent = await Student.findById(id);
                           
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
                        
        updatedStudent.password = password ? hash : updatedStudent.password;
                                
        await updatedStudent.save();

        return res.status(200).json({ data: 'Student password successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update student password.' });
    }
});


export const delete_student = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedStudent = await Student.findByIdAndDelete(id);

        if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });

        return res.status(200).json({ data: 'Student account successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete student account.' });
    }
});