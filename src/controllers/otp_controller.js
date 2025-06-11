import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import moment from 'moment-timezone';
import Student from '../models/student.js';
import Admin from '../models/admin.js';
import Instructor from '../models/instructor.js';
import OTP from '../models/otp.js';
import mailer from '../mailer/otp_mailer.js'; // Import the mailer utility

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



function generateOTP(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // appends a random digit (0–9)
  }
  return otp;
}


export const create_otp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "Please provide all fields (email)." });
        }

        const student = await Student.findOne({ email: email });
        const instructor = await Instructor.findOne({ email: email });
        const admin = await Admin.findOne({ email: email });

        

        if (!student && !instructor && !admin) {
            return res.status(404).json({ message: "User not found." });
        }

        const otp_code = generateOTP();
        const user_type = student?.role || instructor?.role || admin?.role;
        const user_id = student?.id || instructor?.id || admin?.id;

        const otpRecord = await OTP.findOne({ 
            user: user_id
        });

     
        if(!otpRecord) {
            const newOTP = new OTP({
                otp_code: otp_code,
                user: user_id,
                user_type: user_type.charAt(0).toUpperCase() + user_type.slice(1).toLowerCase(),
                created_at: storeCurrentDate(0, 'hours')
            });

            await newOTP.save();
            mailer(email, "OTP Code", otp_code);

            return res.status(200).json({ data: 'New otp code successfully created.' });
        } else {
            otpRecord.otp_code = otp_code ? otp_code : otpRecord.otp_code;
            otpRecord.user = user_id ? user_id : otpRecord.user;
            otpRecord.user_type = user_type ? user_type.charAt(0).toUpperCase() + user_type.slice(1).toLowerCase() : otpRecord.user_type;
            otpRecord.created_at = storeCurrentDate(0, 'hours') ? storeCurrentDate(0, 'hours') : otpRecord.created_at;

            await otpRecord.save();
            mailer(email, "OTP Code", otp_code);

            return res.status(200).json({ data: 'New otp code successfully updated.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create otp.', data : error });
    }
});

export const otp_verification_email_verification = asyncHandler(async (req, res) => {
    const { otp_code, email } = req.body;

    try {    
        if (!otp_code || !email) {
            return res.status(400).json({ message: "Please provide all fields (otp_code, email)." });
        }

        const student = await Student.findOne({ email: email });
        const instructor = await Instructor.findOne({ email: email });
        //const admin = await Admin.findOne({ email: email });

        if (!student && !instructor) {
            return res.status(404).json({ message: "User not found." });
        }

        const user_type = student?.role || instructor?.role;
        const user_id = student?.id || instructor?.id;

        const otpRecord = await OTP.findOne({ 
            user: user_id, 
            user_type: user_type.charAt(0).toUpperCase() + user_type.slice(1).toLowerCase(), 
            otp_code: otp_code 
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "No OTP record found." });
        }

        const now = new Date();
        const createdAt = new Date(otpRecord.created_at);
        const diffInMinutes = (now - createdAt) / 1000 / 60;

        if (diffInMinutes > 3) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        const otp = await OTP.findById(otpRecord.id).populate('user', null, otpRecord.user_type.charAt(0).toUpperCase() + otpRecord.user_type.slice(1).toLowerCase())

        const studentStatus = await Student.findOne({ 
            _id: otp.user.id
        });

        const instructorStatus = await Instructor.findOne({ 
            _id: otp.user.id
        });

        if(studentStatus) {
             studentStatus.status =  "verified";
             await studentStatus.save();
        }

        if(instructorStatus) {
            instructorStatus.status = "verified";
            await instructorStatus.save();
        }

        return res.status(200).json({ data: "OTP verified successfully." });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to verify OTP.' });
    }
});


export const otp_verification_password = asyncHandler(async (req, res) => {
    const { otp_code, email, password } = req.body;

    try {    
        if (!otp_code || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields (otp_code, email, password)." });
        }

        const student = await Student.findOne({ email: email });
        const instructor = await Instructor.findOne({ email: email });
        const admin = await Admin.findOne({ email: email });

        if (!student && !instructor && !admin) {
            return res.status(404).json({ message: "User not found." });
        }

        const user_type = student.role || instructor.role || admin.role;
        const user_id = student.id || instructor.id || admin.id;

        const otpRecord = await OTP.findOne({ 
            user: user_id, 
            user_type: user_type.charAt(0).toUpperCase() + user_type.slice(1).toLowerCase(), 
            otp_code: otp_code 
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "No OTP record found." });
        }

        const now = new Date();
        const createdAt = new Date(otpRecord.created_at);
        const diffInMinutes = (now - createdAt) / 1000 / 60;

        if (diffInMinutes > 3) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        const otp = await OTP.findById(otpRecord.id).populate('user', null, otpRecord.user_type.charAt(0).toUpperCase() + otpRecord.user_type.slice(1).toLowerCase())

        const studentPassword = await Student.findOne({ 
            _id: otp.user.id
        });

        const instructorPassword = await Instructor.findOne({ 
            _id: otp.user.id
        });

        const adminPassword = await Admin.findOne({ 
            _id: otp.user.id
        });

        if(studentPassword) {
             studentPassword.password =  password ? hashConverterMD5(password) : studentPassword.password;
             await studentPassword.save();
        }

        if(instructorPassword) {
            instructorPassword.password = password ?  hashConverterMD5(password) : instructorPassword.password;
            await instructorPassword.save();
        }

        if(adminPassword) {
            adminPassword.password = password ?  hashConverterMD5(password) : adminPassword.password;
            await adminPassword.save();
        }

        return res.status(200).json({ data: "OTP verified successfully." });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to verify OTP.' });
    }
});