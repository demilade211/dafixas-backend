import { removeTemp } from "../utils/upload"
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from 'cloudinary';
import JobModel from "../models/job.js"
import UserModel from "../models/user"
import ProfileModel from "../models/profile"
import { newRequestNotification } from '../utils/notifications.js';
import {paginate} from "../utils/helpers"

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
    const { status, pageNumber } = req.query; // Get status and pageNumber from query parameters
    const number = Number(pageNumber) || 1; // Default to page 1 if not provided
    const size = 8; // Number of jobs to return per page

    try {
        let jobs;

        // Build the query object
        let query = { user: _id };

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        // Determine if it's the first page or subsequent pages
        if (number === 1) {
            jobs = await JobModel.find(query)
                .sort({ createdAt: -1 }) // Sort by most recent
                .limit(size)
                .populate('user')
                .populate('supervisors')
                .populate('artisans'); // Populate related fields
        } else {
            const skips = size * (number - 1);
            jobs = await JobModel.find(query)
                .skip(skips) // Skip previously fetched jobs
                .limit(size)
                .sort({ createdAt: -1 })
                .populate('user')
                .populate('supervisors')
                .populate('artisans');
        }

        return res.status(200).json({
            success: true,
            jobs
        });

    } catch (error) {
        return next(error);
    }
};

export const getArtisanAssignedJobs = async (req, res, next) => {
    const { pageNumber } = req.query;
    const { _id, role } = req.user;
    const size = 8;

    try {
        // Check if the user is an artisan
        if (role !== 'artisan') {
            return next(new ErrorHandler('You are not an artisan', 403));
        }

        // Find the profile associated with the user
        const profile = await ProfileModel.findOne({ user: _id }).populate('assignedJobs.jobId');

        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        let assignedJobs = profile.assignedJobs;

        // Filter by status if provided
        const { status } = req.query;
        if (status) {
            assignedJobs = assignedJobs.filter(job => job.status === status);
        }

        // Paginate the assigned jobs
        const paginatedJobs = paginate(assignedJobs, pageNumber, size);

        return res.status(200).json({
            success: true,
            jobs: paginatedJobs
        });
    } catch (error) {
        return next(error);
    }
}; 

export const getJobDetail = async (req, res, next) => {
    const { jobId } = req.params;
    const { _id, role } = req.user;

    try {
        // Check if the user is an artisan TEST
        // if (role !== 'artisan') {
        //     return next(new ErrorHandler('You are not an artisan', 403));
        // }

        // Find the job by ID and ensure the job belongs to the artisan
        const job = await JobModel.findOne({ _id: jobId})
            .populate('user')
            .populate('artisans')
            .populate('supervisors');

        if (!job) {
            return next(new ErrorHandler('Job not found', 404));
        }

        return res.status(200).json({
            success: true,
            job
        });
    } catch (error) {
        return next(error);
    }
}; 

export const acceptJob = async (req, res, next) => {
    const { jobId } = req.params;
    const { id,role } = req.user;

    try {
        // Find the artisan's profile
        const profile = await ProfileModel.findOne({ user: id });
        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        // Check if the user is an artisan
        if (role !== 'artisan') {
            return next(new ErrorHandler('You are not an artisan', 403));
        }

        // Find the assigned job in the artisan's profile
        const assignedJob = profile.assignedJobs.find(job => job.jobId.toString() === jobId);
        if (!assignedJob) {
            return next(new ErrorHandler('Job not found in assigned jobs', 404));
        }

        // Check if the job has already been accepted or completed
        if (assignedJob.status !== 'pending') {
            return next(new ErrorHandler(`Job has already been ${assignedJob.status}`, 400));
        }

        // Update the status of the assigned job to 'accepted'
        assignedJob.status = 'accepted';
        await profile.save();

        // Find the job and add the artisan to the assignedArtisans array
        const job = await JobModel.findById(jobId);
        if (!job) {
            return next(new ErrorHandler('Job not found', 404));
        }

        // Add artisan to assignedArtisans if not already added
        const isArtisanAssigned = job.assignedArtisans.some(artisan => artisan.toString() === id);
        if (!isArtisanAssigned) {
            job.assignedArtisans.push(id);
        }
        await job.save();

        res.status(200).json({
            success: true,
            message: 'Job accepted successfully',
            job: {
                jobId: assignedJob.jobId,
                status: assignedJob.status,
                jobType: assignedJob.jobType,
                address: assignedJob.address,
                startDate: assignedJob.startDate,
            },
        });
    } catch (error) {
        return next(error);
    }
};

