import { removeTemp } from "../utils/upload"
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from 'cloudinary';
import JobModel from "../models/job.js"
import UserModel from "../models/user"
import ProfileModel from "../models/profile"
import { newRequestNotification } from '../utils/notifications.js';
import {paginate} from "../utils/helpers"

export const getJobSummary = async (req, res, next) => {
    const { _id, role } = req.user;

    try {
        // Check if the user is an artisan
        if (role !== 'artisan') {
            return next(new ErrorHandler('You are not an artisan', 403));
        }

        // Find the profile associated with the user
        const profile = await ProfileModel.findOne({ user: _id });

        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        const assignedJobs = profile.assignedJobs;

        // Calculate job statistics
        const totalAssignedJobs = assignedJobs.length;
        const totalRejectedJobs = assignedJobs.filter(job => job.status === 'rejected').length;
        const totalCompletedJobs = assignedJobs.filter(job => job.status === 'completed').length;
        const totalAcceptedJobs = assignedJobs.filter(job => job.status === 'accepted').length;

        return res.status(200).json({
            success: true,
            summary: {
                totalAssignedJobs,
                totalRejectedJobs,
                totalCompletedJobs,
                totalAcceptedJobs
            }
        });
    } catch (error) {
        return next(error);
    }
};
