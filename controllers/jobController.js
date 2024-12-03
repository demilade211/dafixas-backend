import { removeTemp } from "../utils/upload"
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from 'cloudinary';
import JobModel from "../models/job.js"
import UserModel from "../models/user"
import JobPaymentModel from "../models/jobPayments.js"
import ProfileModel from "../models/profile"
import { newRequestNotification } from '../utils/notifications.js';
import { paginate } from "../utils/helpers"
import sendBulkEmail from "../utils/sendBulkEmail.js";

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

        const requestUrl = `https://www.dafixas.com/dashboard/job-requests/${job._id}`;
        const message = `
            <p>A new job request has been created. Please find the details below:</p>
            <p>You can review the job request and take necessary actions by clicking the link below:</p> 
            <a href="${requestUrl}">View Job Request</a>
            <p>If you did not request this email, please ignore it.</p>
        `;

        try {
            // Send the invitation email
            await sendBulkEmail({
                email: email.toLowerCase(),
                subject: "daFixas Has a New Request",
                message,
                html: message
            },
                [
                    { email: "abimbola.adefolalu@megalabourers.com" }, 
                ]
            );

            return res.status(201).json({
                success: true,
                job
            });
        } catch (error) {

            return next(new ErrorHandler("Email could not be sent", 500));
        }


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
    const { status, pageNumber } = req.query;
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

    try {
        // Find the job by ID and populate the necessary fields, including projectCosting.artisans
        const job = await JobModel.findOne({ _id: jobId })
            .populate('user') // Populate user who created the job
            .populate('artisans') // Populate artisans assigned to the job
            .populate('supervisors') // Populate supervisors assigned to the job
            .populate({
                path: 'projectCosting.artisans.artisan', // Populate artisans in projectCosting
                model: 'User', // Assuming 'User' is the model name for artisans 
            });

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
    const { id, role } = req.user;

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

        // Update the status of the assigned job to 'assigned'
        assignedJob.status = 'assigned';
        await profile.save();

        // Find the job
        const job = await JobModel.findById(jobId);
        if (!job) {
            return next(new ErrorHandler('Job not found', 404));
        }

        // Add artisan to assignedArtisans if not already added
        const isArtisanAssigned = job.artisans.some(artisan => artisan.toString() === id);
        if (!isArtisanAssigned) {
            job.artisans.push(id);
        }

        // Update the job status to 'assigned'
        job.status = 'assigned';

        // Add artisan to projectCosting.artisans if not already added
        const isArtisanInCosting = job.projectCosting.artisans.some(artisan => artisan.artisan.toString() === id);
        if (!isArtisanInCosting) {
            job.projectCosting.artisans.push({
                artisan: id,
                fee: 0, // Set artisan fee here; you can also retrieve it dynamically if needed
            });
        }

        // Save the job with the updated projectCosting and status
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
                projectCosting: job.projectCosting, // Return updated projectCosting
            },
        });
    } catch (error) {
        return next(error);
    }
};


export const rejectJob = async (req, res, next) => {
    const { jobId } = req.params; // Job ID from request parameters
    const { id, role } = req.user; // Get the user ID and role from authenticated user

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

        // Check if the job has already been rejected, accepted, or completed
        if (assignedJob.status !== 'pending') {
            return next(new ErrorHandler(`Job has already been ${assignedJob.status}`, 400));
        }

        // Update the status of the assigned job to 'rejected'
        assignedJob.status = 'rejected';
        await profile.save();

        // Find the job by ID
        const job = await JobModel.findById(jobId);
        if (!job) {
            return next(new ErrorHandler('Job not found', 404));
        }

        // Update the job status to 'rejected'
        job.status = 'rejected';

        // Save the job after updating
        await job.save();

        res.status(200).json({
            success: true,
            message: 'Job rejected successfully',
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

export const approveJob = async (req, res, next) => {
    const { jobId } = req.params;
    const { id } = req.user;

    try {
        // Find the job
        const job = await JobModel.findById(jobId);
        if (!job) return next(new ErrorHandler('Job not found', 404));

        // Set the job status to 'approved'
        job.status = 'approved';
        await job.save();

        // Get the artisan's profile
        const profile = await ProfileModel.findOne({ user: id });
        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        // Update the status of the assigned job in the artisan's profile
        const assignedJob = profile.assignedJobs.find(job => job.jobId.toString() === jobId);
        if (assignedJob) {
            assignedJob.status = 'approved';
            await profile.save();
        }

        res.status(200).json({
            success: true,
            message: 'Job approved successfully',
        });
    } catch (error) {
        return next(error);
    }
};

export const makePayment = async (req, res, next) => {
    const { jobId } = req.params;
    const { amount } = req.body;
    const { id } = req.user;

    try {
        // Get the artisan's profile
        const profile = await ProfileModel.findOne({ user: id });
        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        // Verify sufficient balance
        if (profile.wallet.balance < amount) {
            return next(new ErrorHandler('Insufficient wallet balance', 400));
        }

        // Deduct the amount and update the wallet balance
        profile.wallet.balance -= amount;
        await profile.save();

        // Find the job and update its status to 'paid'
        const job = await JobModel.findById(jobId);
        if (!job) return next(new ErrorHandler('Job not found', 404));

        job.status = 'paid';
        await job.save();

        // Update the status of the assigned job in the artisan's profile
        const assignedJob = profile.assignedJobs.find(job => job.jobId.toString() === jobId);
        if (assignedJob) {
            assignedJob.status = 'paid';
            await profile.save();
        }

        const payment = {
            user: id,
            jobId: jobId,
            amount: amount,
        }

        const newPayment = await JobPaymentModel.create(payment);

        res.status(200).json({
            success: true,
            message: 'Payment successful and job marked as paid',
            walletBalance: profile.wallet.balance,
        });
    } catch (error) {
        return next(error);
    }
};
