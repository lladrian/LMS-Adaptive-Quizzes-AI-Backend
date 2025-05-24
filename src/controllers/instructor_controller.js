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
    const { fullname, password, email } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields (email, password, fullname)." });
        }
        
        if (await Student.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await Admin.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await Instructor.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });

        const hash_password = hashConverterMD5(password);
   
        const newInstructor = new Instructor({
            fullname: fullname,
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
        const instructors = await Instructor.find();

        return res.status(200).json({ data: instructors });
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
    const { email, fullname } = req.body;

    try {
        if (!email || !fullname) {
            return res.status(400).json({ message: "All fields are required: email and fullname." });
        }

        const updatedInstructor = await Instructor.findById(id);
                   
        if (!updatedInstructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }
                
        updatedInstructor.email = email ? email : updatedInstructor.email;
        updatedInstructor.fullname = fullname ? fullname : updatedInstructor.fullname;
                        
        await updatedInstructor.save();

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