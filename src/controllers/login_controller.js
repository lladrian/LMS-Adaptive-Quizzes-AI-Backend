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



export const login_user = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

    try {
        // Check if both email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        const hash = hashConverterMD5(password);

        // Find the user by email
        let student = await Student.findOne({ email: email }); // Don't use .lean() here
        let admin = await Admin.findOne({ email: email }); // Don't use .lean() here
        let instructor = await Instructor.findOne({ email: email }); // Don't use .lean() here

        // Check if the admin exists and if the password is correct
        if (student && student.password == hash) {
            return res.status(200).json({ data: student });
        }

        if (admin && admin.password == hash) {
            return res.status(200).json({ data: admin });
        }

        if (instructor && instructor.password == hash) {
            return res.status(200).json({ data: instructor });
        }

        return res.status(400).json({ message: 'Wrong email or password.'});
    } catch (error) {
        return res.status(500).json({ error: 'Failed to login ' });
    }
});