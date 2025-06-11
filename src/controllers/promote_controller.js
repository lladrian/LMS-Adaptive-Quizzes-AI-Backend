import asyncHandler from 'express-async-handler';
import Student from '../models/student.js';
import Admin from '../models/admin.js';
import Instructor from '../models/instructor.js';


export const promote_user = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { role_name } = req.body;

    try {
        if (!role_name) {
            return res.status(400).json({ message: "All fields are required: role_name." });
        }

        //const updatedAdmin = await Admin.findById(id);
        const updatedInstructor = await Instructor.findById(id);
        const updatedStudent = await Student.findById(id);

        if(!updatedInstructor && !updatedStudent) {
            return res.status(404).json({ message: "User not found." });
        }      

        // if(updatedAdmin) {
        //     updatedAdmin.role = role_name ? role_name : updatedAdmin.role;
        //     await updatedAdmin.save();
        // }

        if(updatedInstructor) {
            updatedInstructor.role = role_name ? role_name : updatedInstructor.role;
            await updatedInstructor.save();
        }

        if(updatedStudent) {
            if(role_name == "admin") {
                return res.status(400).json({ message: "Sorry, the student cannot be promoted to admin." });
            }
            updatedStudent.role = role_name ? role_name : updatedStudent.role;
            await updatedStudent.save();
        }



        return res.status(200).json({ data: 'User role successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update role.' });
    }
});

