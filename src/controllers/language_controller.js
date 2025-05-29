import asyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import Language from '../models/language.js';


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


export const create_language = asyncHandler(async (req, res) => {
    const { language, version, name, starting_code } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!language || !version || !name || !starting_code) {
            return res.status(400).json({ message: "Please provide all fields (language, version, name, starting_code)." });
        }
   
        const newLanguage = new Language({
            name: name,
            starting_code: starting_code,
            language: language,
            version: version,
            created_at: storeCurrentDate(0, 'hours'),
        });

        await newLanguage.save();

        return res.status(200).json({ message: 'New language successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create language.' });
    }
});

export const get_all_language = asyncHandler(async (req, res) => {    
    try {
        const languages = await Language.find();

        return res.status(200).json({ data: languages });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all languages.' });
    }
});

export const update_language = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters
    const { language, version, name, starting_code } = req.body;

    try {
        if (!language || !version || !name || !starting_code) {
            return res.status(400).json({ message: "All fields are required: language, name, starting_code and version." });
        }

        const updatedLanguage = await Language.findById(id);

        if (!updatedLanguage) return res.status(404).json({ message: 'Language not found' });

        updatedLanguage.language = language ? language : updatedLanguage.language;
        updatedLanguage.version = version ? version : updatedLanguage.version;
        updatedLanguage.name = name ? name : updatedLanguage.name;
        updatedLanguage.starting_code = starting_code ? starting_code : updatedLanguage.starting_code;

        await updatedLanguage.save();

        return res.status(200).json({ data: 'Language successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update language.' });
    }
});



export const delete_language = asyncHandler(async (req, res) => {    
    const { id } = req.params; // Get the meal ID from the request parameters

    try {
        const deletedLanguage = await Language.findByIdAndDelete(id);

        if (!deletedLanguage) return res.status(404).json({ message: 'Language not found' });

        return res.status(200).json({ data: 'Language successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete language.' });
    }
});



