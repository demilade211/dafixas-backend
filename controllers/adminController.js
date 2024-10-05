import UserModel from '../models/user'; // Ensure that the correct path to the User model is used
import ProfileModel from "../models/profile"
import JobModel from "../models/job.js"
import SupervisorModel from "../models/supervisortokens.js"
import ErrorHandler from "../utils/errorHandler.js";
import crypto from "crypto"
import sendEmail from "../utils/sendEmail"
import newOTP from 'otp-generators';
import { handleEmail } from "../utils/helpers"; 


export const adminSummary = async (req, res, next) => {
    try {
        // Query to count users for each role
        const userCount = await UserModel.countDocuments({ role: 'user' });
        const artisanCount = await UserModel.countDocuments({ role: 'artisan' });
        const supervisorCount = await UserModel.countDocuments({ role: 'supervisor' });
        const adminCount = await UserModel.countDocuments({ role: 'admin' });

        return res.status(200).json({
            success: true,
            summary: {
                users: userCount,
                artisans: artisanCount,
                supervisors: supervisorCount,
                admins: adminCount
            }
        });
    } catch (error) {
        return next(error);
    }
}; 

export const getArtisans = async (req, res, next) => {
    const { pageNumber = 1, size = 10, status } = req.query; // Add status to query parameters
    const page = Number(pageNumber); // Ensure page number is a number
    const limit = Number(size); // Ensure size is a number

    try {
        // Build the query object
        let query = { role: 'artisan' };

        // If status is provided, filter by verified/unverified
        if (status === 'verified') {
            query.verified = true;
        } else if (status === 'unverified') {
            query.verified = false;
        }

        // Calculate the number of documents to skip
        const skips = limit * (page - 1);

        // Fetch paginated artisans with the specified role and status
        const artisans = await UserModel.find(query)
            .select('name email tel state verified verificationLevel') // Select fields to display from User model
            .skip(skips) // Skip previously fetched artisans
            .limit(limit) // Limit the results per page 
            .sort({ createdAt: -1 })

        // Count the total number of artisans
        const totalArtisans = await UserModel.countDocuments({ role: 'artisan' });

        // Count the number of verified artisans
        const verifiedArtisans = await UserModel.countDocuments({ role: 'artisan', verified: true });

        // Count the number of unverified artisans
        const unverifiedArtisans = await UserModel.countDocuments({ role: 'artisan', verified: false });

        return res.status(200).json({
            success: true,
            totalArtisans,
            verifiedArtisans,
            unverifiedArtisans,
            artisans, 
        });
    } catch (error) {
        return next(error);
    }
};

export const getUserDetails = async (req, res, next) => {

    const { userId } = req.params;// Assuming the user ID is available in req.user

    try {
        // Find the profile associated with the user ID, excluding the 'assignedJobs' field
        const profile = await ProfileModel.findOne({ user: userId})
            .populate('user'); // Populate the user details (name, email, tel, avatar)

        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404)); 
        }

        return res.status(200).json({
            success: true,
            profile
        });

    } catch (error) {
        return next(error);
    }
};

export const getSupervisors = async (req, res, next) => {
    const { pageNumber } = req.query; // Get the page number from the query parameters
    const page = Number(pageNumber) || 1; // Default to page 1 if not provided
    const size = 8; // Number of supervisors per page

    try {
        // Query to get supervisors
        const query = { role: 'supervisor' };

        // Get the total number of supervisors
        const totalSupervisors = await UserModel.countDocuments(query);

        // Pagination logic
        const skips = size * (page - 1);

        // Fetch paginated list of supervisors
        const supervisors = await UserModel.find(query)
            .sort({ createdAt: -1 }) // Sort by the most recent
            .skip(skips) // Skip previous results
            .limit(size) // Limit the number of results
            .select('-password -resettoken -expiretoken'); // Exclude sensitive fields

        return res.status(200).json({
            success: true,
            totalSupervisors, // Total number of supervisors
            supervisors // List of supervisors for the current page
        });
    } catch (error) {
        return next(error);
    }
};

export const getUsers = async (req, res, next) => {
    const { pageNumber } = req.query; // Get the page number from the query parameters
    const page = Number(pageNumber) || 1; // Default to page 1 if not provided
    const size = 8; // Number of users per page

    try {
        // Get the total number of users with role 'user'
        const totalUsers = await UserModel.countDocuments({ role: 'user' });

        // Pagination logic
        const skips = size * (page - 1);

        // Fetch paginated list of users with role 'user'
        const users = await UserModel.find({ role: 'user' })
            .sort({ createdAt: -1 }) // Sort by the most recent
            .skip(skips) // Skip previous results
            .limit(size) // Limit the number of results
            .select('-password -resettoken -expiretoken'); // Exclude sensitive fields

        return res.status(200).json({
            success: true,
            totalUsers, // Total number of users with role 'user'
            users // List of users with role 'user' for the current page
        });
    } catch (error) {
        return next(error);
    }
};
 

export const getUserProjects = async (req, res, next) => {
    const { userId } = req.params; // Get userId from request parameters
    const { status, pageNumber } = req.query; // Get status and pageNumber from query parameters
    const page = Number(pageNumber) || 1; // Default to page 1 if not provided
    const size = 8; // Number of jobs to return per page

    try {
        // Build query to filter by user and optional status
        let query = { user: userId };

        if (status) {
            query.status = status; // Filter by status if provided
        }
 
        // Get total count of jobs for pagination
        const totalProjects = await JobModel.countDocuments(query);

        // Pagination logic
        const skips = size * (page - 1);

        // Fetch paginated user jobs
        const jobs = await JobModel.find(query)
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skips)
            .limit(size)
            .populate('user'); // Populate user information

        return res.status(200).json({
            success: true, 
            projects:jobs,
            totalProjects,
        });
    } catch (error) {
        return next(error);
    }
};

export const getProjects = async (req, res, next) => {
    const { status, pageNumber } = req.query; // Get status and pageNumber from query parameters
    const page = Number(pageNumber) || 1; // Default to page 1 if not provided
    const size = 8; // Number of projects to return per page

    try {
        // Build query object to filter projects by status if provided
        let query = {};

        if (status) {
            query.status = status; // Add status filter if provided
        }

        // Get total number of projects for pagination
        const totalProjects = await JobModel.countDocuments(query);

        // Pagination logic
        const skips = size * (page - 1);

        // Fetch paginated projects
        const projects = await JobModel.find(query)
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skips)
            .limit(size)
            .populate('user') // Populate user info
            .populate('supervisors') // Populate supervisors if any
            .populate('artisans'); // Populate artisans if any

        return res.status(200).json({
            success: true,
            totalProjects,
            projects
        });
    } catch (error) {
        return next(error);
    }
};

export const getProject = async (req, res, next) => {
    const { projectId } = req.params; // Get project ID from request parameters 

    try {
        // Build query to find the project by ID
        let query = { _id: projectId };
 

        // Fetch the project details by ID and optional status
        const project = await JobModel.findOne(query)
            .populate('user') // Populate user information
            .populate('supervisors') // Populate supervisors if any
            .populate('artisans'); // Populate artisans if any

        // Check if the project exists
        if (!project) {
            return next(new ErrorHandler('Project not found', 404)); 
        }

        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        return next(error);
    }
};

export const acceptRequest = async (req, res, next) => {
    const { jobId } = req.params; // Get the job ID from the route parameters

    try {
        // Find the job by ID and update the status to 'accepted'
        const job = await JobModel.findByIdAndUpdate(
            jobId,
            { status: 'accepted' },
            { new: true } // Return the updated document
        );

        // Check if the job was found
        if (!job) {
            return next(new ErrorHandler('Job not found', 404));
        }

        return res.status(200).json({
            success: true,
            message: 'Job status updated to accepted',
            job
        });
    } catch (error) {
        return next(error);
    }
};

export const rejectRequest = async (req, res, next) => {
    const { jobId } = req.params; // Get the job ID from the route parameters

    try {
        // Find the job by ID and update the status to 'rejected'
        const job = await JobModel.findByIdAndUpdate(
            jobId,
            { status: 'rejected' },
            { new: true } // Return the updated document
        );

        // Check if the job was found
        if (!job) {
            return next(new ErrorHandler('Job not found', 404));
        }

        return res.status(200).json({
            success: true,
            message: 'Job status updated to rejected',
            job
        });
    } catch (error) {
        return next(error);
    }
};

export const assignSupervisorToJob = async (req, res, next) => {
    const { jobId, supervisorId } = req.params; // Get the job and supervisor IDs from route parameters

    try {
        // Find the supervisor by ID and check if their role is 'supervisor'
        const supervisor = await UserModel.findById(supervisorId);

        if (!supervisor) {
            return next(new ErrorHandler('Supervisor not found', 404));
        }

        if (supervisor.role !== 'supervisor') {
            return next(new ErrorHandler('User is not a supervisor', 400));
        }

        // Find the job by ID and push the supervisor to the array of supervisors
        const job = await JobModel.findByIdAndUpdate(
            jobId,
            { $push: { supervisors: supervisorId } }, // Push supervisorId to the supervisors array
            { new: true } // Return the updated document
        );

        // Check if the job was found
        if (!job) {
            return next(new ErrorHandler('Job not found', 404));
        }

        return res.status(200).json({
            success: true,
            message: 'Supervisor assigned to the job successfully',
            job
        });
    } catch (error) {
        return next(error);
    }
};
 

export const inviteSupervisor = async (req, res, next) => {
    const { email } = req.body; 

    try {
        // Check if the email is already in use
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (user) return next(new ErrorHandler("User with this email already exists", 400));

        // Generate invitation token
        const inviteToken = crypto.randomBytes(20).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(inviteToken).digest('hex');

        // Set token expiry time (30 minutes)
        const tokenExpire = Date.now() + 30 * 60 * 1000;

        // Check if an invitation already exists for this email
        let supervisorToken = await SupervisorModel.findOne({ email: email.toLowerCase() });

        if (supervisorToken) {
            // If the token already exists, update the inviteToken and expiry
            supervisorToken.inviteToken = hashedToken;
            supervisorToken.inviteTokenExpire = tokenExpire;
        } else {
            // Create a new token record if none exists
            supervisorToken = await SupervisorModel.create({
                email: email.toLowerCase(),
                inviteToken: hashedToken,
                inviteTokenExpire: tokenExpire, 
            });
        }

        await supervisorToken.save({ validateBeforeSave: false });

        // Prepare the invitation email content
        const inviteUrl = `https://www.yourdomain.com/auth/complete-superviso/${inviteToken}`;
        const message = `
            <p>You have been invited to register as a supervisor. Please click the link below to complete your registration:</p>
            <a href="${inviteUrl}">Register as Supervisor</a>
            <p>If you did not request this email, please ignore it.</p>
        `;

        try {
            // Send the invitation email
            await sendEmail({
                email: email.toLowerCase(),
                subject: "Supervisor Invitation",
                message,
                html: message
            });
 

            return res.status(200).json({
                success: true,
                message: `Invitation email sent to ${email}`
            });

        } catch (error) {
            // In case email sending fails, clear the invite token and expiry
            supervisorToken.inviteToken = undefined;
            supervisorToken.inviteTokenExpire = undefined;

            await supervisorToken.save({ validateBeforeSave: false });

            return next(new ErrorHandler("Email could not be sent", 500));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

export const verifyInviteToken = async (req, res, next) => {
    const { token } = req.body;

    try {
        // Hash the token provided in the request
        const inviteToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the supervisor token document matching the hashed token and where the token hasn't expired
        const supervisorToken = await SupervisorToken.findOne({
            inviteToken,
            inviteTokenExpire: { $gt: Date.now() } // Ensure the token is still valid
        });

        if (!supervisorToken) {
            return next(new ErrorHandler('Invitation token is invalid or has expired', 400));
        }

        // If the token is valid, return success
        return res.status(200).json({
            success: true,
            message: 'Invitation token verified successfully',
            email: supervisorToken.email // Returning the email for further steps (e.g., registration)
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};