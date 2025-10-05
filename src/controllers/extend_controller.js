import MainActivity from "../models/main_activity.js";
import asyncHandler from 'express-async-handler';

export const extend_time = asyncHandler(async (req, res) => {    
    const { activity_id } = req.params; // Get the meal ID from the request parameters
    const { minutes } = req.body;

    try {
        if (!minutes) {
            return res.status(400).json({ message: "All fields are required: minutes." });
        }

        const updatedMainActivity = await MainActivity.findById(activity_id);

        if (!updatedMainActivity) return res.status(404).json({ message: 'Activity not found' });

        // updatedMainActivity.extended_minutes = minutes ? minutes : updatedLanguage.extended_minutes;

        const currentMinutes = parseInt(updatedMainActivity.extended_minutes) || 0;
        const inputMinutes = parseInt(minutes) || 0;

        const total = currentMinutes + inputMinutes;

        // ✅ Prevent result from going below 0
        updatedMainActivity.extended_minutes = total < 0 ? 0 : total;


        await updatedMainActivity.save();

        return res.status(200).json({ 
            success: true,
            data: {
              id: updatedMainActivity._id,
              extended_minutes: updatedMainActivity.extended_minutes,
              total_time: updatedMainActivity.submission_time + updatedMainActivity.extended_minutes,
            },
            message: `Time extended by ${minutes} minutes successfully`,
         });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update activity.' });
    }
});

