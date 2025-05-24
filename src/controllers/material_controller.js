import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Material from '../models/material.js';

import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path'; // Import dirname

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads/');

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

export const extract_material = asyncHandler(async (req, res) => {
    const { material_id } = req.params; // Get the meal ID from the request parameters
    
    try {
        const material = await Material.findById(material_id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found.' });
        }

        const filePath = path.join(uploadsDir, material.material);
        const ext = path.extname(filePath).toLowerCase();

        if (material.material && ext === '.pdf') {
           let text = "";
           const dataBuffer = fs.readFileSync(filePath);
           const pdfData = await pdf(dataBuffer);
           text = pdfData.text;

           return res.status(200).json({ data: text });
        }

        if (material.material && ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });

            return res.status(200).json({ data: result.value });
        }

         return res.status(200).json({ data: 'No file material or neither PDF nor DOCX file material.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to extract material.' });
    }
});

export const create_material = asyncHandler(async (req, res) => {
    const { classroom_id } = req.body;
    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = `materials/${filename}`; 
    
    try {
        // Check if all required fields are provided
        if (!classroom_id) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id)." });
        }
   
        const newMaterial = new Material({
            classroom: classroom_id,
            material: req.file ? filename_insert : null,
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
    const { classroom_id } = req.body;
    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = `materials/${filename}`; 

    try {
        if (!classroom_id) {
            return res.status(400).json({ message: "Please provide all fields (classroom_id)." });
        }

        const updatedMaterial = await Material.findById(id);

        updatedMaterial.classroom = classroom_id ? classroom_id : updatedMaterial.classroom;
        updatedMaterial.material = req.file ? filename_insert : updatedMaterial.material;
        
        if(req.file) {
            const filePath = path.join(uploadsDir, updatedMaterial.material);
        
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

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