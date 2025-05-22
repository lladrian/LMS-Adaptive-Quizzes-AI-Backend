import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Admin from '../models/admin.js';


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
    const { fullname, password, email } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields (email, password, fullname)." });
        }

        if (await Admin.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });

        const hash_password = hashConverterMD5(password);
   
        const newAdmin = new Admin({
            fullname: fullname,
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
        const admins = await Admin.find();

        return res.status(200).json({ data: admins });
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


export const login_admin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

    try {
        // Check if both email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Find the user by email
        let admin = await Admin.findOne({ email: email }); // Don't use .lean() here

        // Check if the admin exists and if the password is correct
        if (admin && admin.password == hash) {
            return res.status(200).json({ data: admin });
        }

        return res.status(400).json({ message: 'Wrong email or password.'});
    } catch (error) {
        return res.status(500).json({ error: 'Failed to login ' });
    }
});




export const update_admin = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { email, fullname } = req.body;

    try {
        if (!email || !fullname) {
            return res.status(400).json({ message: "All fields are required: email and fullname." });
        }

        const updatedAdmin = await Admin.findById(id);
           
        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        updatedAdmin.email = email ? email : updatedAdmin.email;
        updatedAdmin.fullname = fullname ? fullname : updatedAdmin.fullname;
                
        await updatedAdmin.save();

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
           
        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        updatedAdmin.password = password ? hash : updatedAdmin.password;
                
        await updatedAdmin.save();

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