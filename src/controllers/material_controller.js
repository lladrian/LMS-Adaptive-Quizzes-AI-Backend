import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Material from '../models/material.js';

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

export const create_material = asyncHandler(async (req, res) => {
    const { classroom_id, material } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!classroom_id || !material) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, material)." });
        }
   
        const newMaterial = new Material({
            classroom: classroom_id,
            material: material,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newMaterial.save();

        return res.status(200).json({ message: 'New material successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create material.' });
    }
});

export const get_all_material_specific_classroom = asyncHandler(async (req, res) => {  
    const { classroom_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const classroom = await Classroom.findById(classroom_id).populate('instructor');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const materials = await Material.find({ 
            classroom: classroom.id 
        });

        return res.status(200).json({ data: materials });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all materials specific classroom.' });
    }
});

export const get_specific_material = asyncHandler(async (req, res) => {  
    const { material_id } = req.params; // Get the meal ID from the request parameters
  
    try {
        const material = await Material.findById(material_id).populate('classroom');

        if (!material) {
            return res.status(404).json({ message: 'Material not found.' });
        }

        return res.status(200).json({ data: material });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get specific material.' });
    }
});


export const update_material = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { classroom_id, material } = req.body;

    try {
        if (!classroom_id || !material) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id, material)." });
        }

        const updatedMaterial = await Material.findById(id);

        updatedMaterial.classroom = classroom_id ? classroom_id : updatedMaterial.classroom;
        updatedMaterial.material = material ? material : updatedMaterial.material;
        
        await updatedMaterial.save();

        return res.status(200).json({ data: 'Material successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update material.' });
    }
});


export const delete_material = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedMaterial = await Material.findByIdAndDelete(id);

        if (!deletedMaterial) return res.status(404).json({ message: 'Material not found' });

        return res.status(200).json({ data: 'Material successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete material.' });
    }
});