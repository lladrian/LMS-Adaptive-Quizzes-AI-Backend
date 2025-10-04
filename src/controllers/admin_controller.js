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



export const create_admin = asyncHandler(async (req, res) => {
    const { first_name, middle_name, last_name, password, email } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!first_name || !middle_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields (email, password, first_name, middle_name, last_name)." });
        }

        if (await Student.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await Admin.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await Instructor.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });

        const hash_password = hashConverterMD5(password);
   
        const newAdmin = new Admin({
            first_name: first_name,
            middle_name: middle_name,
            last_name: last_name,
            password: hash_password,
            email: email,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newAdmin.save();

        return res.status(200).json({ message: 'New admin account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create admin account.' });
    }
});


export const get_all_admin = asyncHandler(async (req, res) => {    
    try {
        const instructor_admins = await Instructor.find({ role: 'admin' });
        const admins = await Admin.find({ role: 'admin' });
        
        // Merge both results
        const mergedAdmins = [...instructor_admins, ...admins];

        return res.status(200).json({ data: mergedAdmins });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all admins.' });
    }
});

export const get_specific_admin = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const admin = await Admin.findById(id);
   
        res.status(200).json({ data: admin });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific admin.' });
    }
});


// export const login_admin = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//     try {
//         // Check if both email and password are provided
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Please provide both email and password' });
//         }

//         // Find the user by email
//         let admin = await Admin.findOne({ email: email }); // Don't use .lean() here
//         const hash = hashConverterMD5(password);


//         // Check if the admin exists and if the password is correct
//         if (admin && admin.password == hash) {
//             return res.status(200).json({ data: admin });
//         }

//         return res.status(400).json({ message: 'Wrong email or password.'});
//     } catch (error) {
//         return res.status(500).json({ error: 'Failed to login ' });
//     }
// });




export const update_admin = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { email, first_name, middle_name, last_name } = req.body;

    try {
        if (!email || !first_name || !middle_name || !last_name) {
            return res.status(400).json({ message: "All fields are required: email, first_name, middle_name, last_name." });
        }

        const updatedAdmin = await Admin.findById(id);
        const updatedInstructorAdmin = await Instructor.findById(id);

           
        if (!updatedAdmin && !updatedInstructorAdmin) {
            return res.status(404).json({ message: "User not found" });
        }

        if(updatedAdmin) {
            updatedAdmin.email = email ? email : updatedAdmin.email;
            updatedAdmin.first_name = first_name ? first_name : updatedAdmin.first_name;
            updatedAdmin.middle_name = middle_name ? middle_name : updatedAdmin.middle_name;
            updatedAdmin.last_name = last_name ? last_name : updatedAdmin.last_name;
                    
            await updatedAdmin.save();
        }

        if(updatedInstructorAdmin) {
            updatedInstructorAdmin.email = email ? email : updatedInstructorAdmin.email;
            updatedInstructorAdmin.first_name = first_name ? first_name : updatedInstructorAdmin.first_name;
            updatedInstructorAdmin.middle_name = middle_name ? middle_name : updatedInstructorAdmin.middle_name;
            updatedInstructorAdmin.last_name = last_name ? last_name : updatedInstructorAdmin.last_name;
                    
            await updatedInstructorAdmin.save();
        }
        
        return res.status(200).json({ data: 'Admin account successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update admin account.' });
    }
});



export const update_admin_password = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).json({ message: "All fields are required: password." });
        }

        const hash = hashConverterMD5(password);
        const updatedAdmin = await Admin.findById(id);
        const updatedInstructorAdmin = await Instructor.findById(id);

           
        if (!updatedAdmin && !updatedInstructorAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        if(updatedAdmin) {
            updatedAdmin.password = password ? hash : updatedAdmin.password;
            await updatedAdmin.save();
        }

        if(updatedInstructorAdmin) {
            updatedInstructorAdmin.password = password ? hash : updatedInstructorAdmin.password;
            await updatedInstructorAdmin.save();
        }
        
        return res.status(200).json({ data: 'Admin password successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update admin password.' });
    }
});


export const delete_admin = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedAdmin = await Admin.findByIdAndDelete(id);

        if (!deletedAdmin) return res.status(404).json({ message: 'Admin not found' });

        return res.status(200).json({ data: 'Admin account successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete admin account.' });
    }
});