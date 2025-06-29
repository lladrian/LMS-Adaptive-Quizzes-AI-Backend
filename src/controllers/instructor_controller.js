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



export const create_instructor = asyncHandler(async (req, res) => {
    const { first_name, middle_name, last_name, password, email } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!first_name || !middle_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields (first_name, middle_name, last_name, email, password, fullname)." });
        }
        
        if (await Student.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await Admin.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await Instructor.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });

        const hash_password = hashConverterMD5(password);


   
        const newInstructor = new Instructor({
            first_name: first_name,
            middle_name: middle_name,
            last_name: last_name,
            password: hash_password,
            email: email,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newInstructor.save();

        return res.status(200).json({ message: 'New instructor account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create instructor account.' });
    }
});


export const get_all_instructor = asyncHandler(async (req, res) => {    
    try {
        const instructors = await Instructor.find({ role: 'instructor' });
        const student_instructors = await Student.find({ role: 'instructor' });

        // Merge both results
        const mergedInstructors = [...instructors, ...student_instructors];
        
        return res.status(200).json({ data: mergedInstructors });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all instructors.' });
    }
});

export const get_specific_instructor = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const instructor = await Instructor.findById(id);
   
        res.status(200).json({ data: instructor });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific instructor.' });
    }
});


// export const login_instructor = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//     try {
//         // Check if both email and password are provided
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Please provide both email and password' });
//         }

//         // Find the user by email
//         let instructor = await Instructor.findOne({ email: email }); // Don't use .lean() here
//         const hash = hashConverterMD5(password);

//         // Check if the admin exists and if the password is correct
//         if (instructor && instructor.password == hash) {
//             return res.status(200).json({ data: instructor });
//         }

//         return res.status(400).json({ message: 'Wrong email or password.'});
//     } catch (error) {
//         return res.status(500).json({ error: 'Failed to login ' });
//     }
// });


       

export const update_instructor = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { email, first_name, middle_name, last_name } = req.body;

    try {
        if (!email || !first_name || !middle_name || !last_name) {
            return res.status(400).json({ message: "All fields are required: email, first_name, middle_name, last_name." });
        }

        const updatedInstructor = await Instructor.findById(id);
        const updatedStudentInstructor = await Student.findById(id);

       // const updatedAdminInstructor = await Admin.findById(id);

                   
        if (!updatedInstructor && !updatedStudentInstructor) {
            return res.status(404).json({ message: "User not found" });
        }

        if(updatedInstructor) {
            updatedInstructor.email = email ? email : updatedInstructor.email;
            updatedInstructor.first_name = first_name ? first_name : updatedInstructor.first_name;
            updatedInstructor.middle_name = middle_name ? middle_name : updatedInstructor.middle_name;
            updatedInstructor.last_name = last_name ? last_name : updatedInstructor.last_name;

            await updatedInstructor.save();
        }

        // if(updatedAdminInstructor) {
        //     updatedAdminInstructor.email = email ? email : updatedAdminInstructor.email;
        //     updatedAdminInstructor.fullname = fullname ? fullname : updatedAdminInstructor.fullname;
                            
        //     await updatedAdminInstructor.save();
        // }

        if(updatedStudentInstructor) {
            updatedStudentInstructor.email = email ? email : updatedStudentInstructor.email;
            updatedStudentInstructor.first_name = first_name ? first_name : updatedStudentInstructor.first_name;
            updatedStudentInstructor.middle_name = middle_name ? middle_name : updatedStudentInstructor.middle_name;
            updatedStudentInstructor.last_name = last_name ? last_name : updatedStudentInstructor.last_name;
                            
            await updatedStudentInstructor.save();
        }
  
        return res.status(200).json({ data: 'Instructor account successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update instructor account.' });
    }
});



export const update_instructor_password = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).json({ message: "All fields are required: password." });
        }
        const hash = hashConverterMD5(password);
        const updatedInstructor = await Instructor.findById(id);
                   
        if (!updatedInstructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }
                
        updatedInstructor.password = password ? hash : updatedInstructor.password; 
        await updatedInstructor.save();

        return res.status(200).json({ data: 'Instructor password successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update instructor password.' });
    }
});


export const delete_instructor = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedInstructor = await Instructor.findByIdAndDelete(id);

        if (!deletedInstructor) return res.status(404).json({ message: 'Instructor not found' });

        return res.status(200).json({ data: 'Instructor account successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete instructor account.' });
    }
});