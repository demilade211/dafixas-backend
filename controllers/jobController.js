import { removeTemp } from "../utils/upload"
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from 'cloudinary';
import JobModel from "../models/job.js"
import { newRequestNotification } from '../utils/notifications.js';

export const createJobRequest = async (req, res, next) => {
    const { jobType, serviceType, description, startDate, startTime, endTime, state, address } = req.body;
    const { _id } = req.user;

    try {
        let images = [];
        let video = null;

        // Check if files were uploaded
        if (!req.files.video) {
            const filesArray = Object.values(req.files); // Assuming your input field is named 'image'



            // Upload images to Cloudinary and get URLs
            images = await Promise.all(
                (Array.isArray(filesArray[0]) ? filesArray[0] : filesArray).map(async (file) => {
                    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                        folder: 'job_requests/images',
                        resource_type: "image"
                    });
                    removeTemp(file.tempFilePath)
                    return {
                        public_id: result.public_id,
                        url: result.secure_url
                    }
                })
            );
        }




        // Check if a video was uploaded
        if (req.files && req.files.video) {
            const videoFile = req.files.video;

            const result = await cloudinary.v2.uploader.upload(videoFile.tempFilePath, {
                folder: 'job_requests/videos',
                resource_type: "video"
            });
            removeTemp(videoFile.tempFilePath);
            video = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        // Create the new job object
        const newJob = {
            user: _id, // User creating the job
            jobType,
            serviceType,
            description,
            pictures: images, // Array of images
            video: video, // Video file description
            startDate,
            startTime,
            endTime,
            location: { state, address },
            supervisors: [],
            artisans: [],
            status: "pending" // Default status
        };

        // Save the job to the database
        const job = await JobModel.create(newJob);

        const adminUserId = '66d0055302243ec58f5e2799'; // Replace this with actual admin ID
        await newRequestNotification(_id, adminUserId, job._id, next);

        return res.status(201).json({
            success: true,
            job
        });
    } catch (error) {
        if (req.files && req.files.video) {
            removeTemp(req.files.video.tempFilePath);
        }
        return next(error);
    }
};

export const getUserJobs = async (req, res, next) => {
    const { _id } = req.user; // Assuming user ID is in req.user
    const { status } = req.query; // Get status from query parameters

    try {
        // Build the query object
        let query = { user: _id };

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        // Fetch jobs from the database
        const jobs = await JobModel.find(query) 

        return res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        return next(error);
    }
};