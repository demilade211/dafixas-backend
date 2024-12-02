import UserModel from "../models/user"
import ProfileModel from "../models/profile"
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary"
import { paginate } from "../utils/helpers"
import { removeTemp } from "../utils/upload"
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: "config/config.env" });

const url = 'https://api.paystack.co';

let secreteKey = process.env.NODE_ENV === "DEVELOPMENT" ? process.env.PAYSTACK_SECRETE_KEY_TEST : process.env.PAYSTACK_SECRETE_KEY_LIVE

const config = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secreteKey}`
    }
}

export const getBankList = async (req, res, next) => {
    try {

        const paystackResponse = await axios.get(`${url}/bank`, config)


        return res.status(200).json({
            success: true,
            banks: paystackResponse.data.data
        })

    } catch (error) {
        return next(error)
    }
}

export const getProfile = async (req, res, next) => {
    const { _id } = req.user; // Assuming the user ID is available in req.user

    try {
        // Find the profile associated with the user ID, excluding the 'assignedJobs' field
        const profile = await ProfileModel.findOne({ user: _id }, '-assignedJobs')
            .populate('user', 'name email tel avatar state skill'); // Populate the user details (name, email, tel, avatar)

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

export const getWalletBalance = async (req, res, next) => {
    const { _id,role } = req.user; // Assuming the user ID is available in req.user

    try {

        console.log("hi");

        if (role !== "user") {
            return next(new ErrorHandler('Only user has wallet', 400));
        }

        // Find the user's profile and get the wallet balance
        const profile = await ProfileModel.findOne({ user: _id });

        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        return res.status(200).json({
            success: true,
            balance: profile.wallet.balance
        });

    } catch (error) {
        return next(error);
    }
};

export const updatePersonalInfo = async (req, res, next) => {
    const { firstName,lastName, tel,state } = req.body;
    const { _id } = req.user;
    let avatar;

    try {
        let user = await UserModel.findById(_id);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const name = `${firstName} ${lastName}`

        // Update name
        if (name) user.name = name 

        // Update telephone number
        if (tel) user.tel = tel;

        if (state) user.state = state;

        // Update avatar if a new one is uploaded
        if (req.files && req.files.avatar) {
            avatar = req.files.avatar;

            // Upload new avatar to Cloudinary
            const result = await cloudinary.v2.uploader.upload(avatar.tempFilePath, {
                folder: 'user_avatars',
                crop: "scale",
                resource_type: "auto"
            });

            // Update user's avatar field with new avatar data
            user.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        // Save the updated user information
        await user.save();

        // Remove the temporary file after successful upload
        if (avatar) removeTemp(avatar.tempFilePath);

        return res.status(200).json({
            success: true,
            message: "Personal information updated successfully",
            user: {
                name: user.name,
                tel: user.tel,
                avatar: user.avatar,
                state:user.state
            }
        });

    } catch (error) {
        // Clean up the temporary file in case of an error
        if (avatar) removeTemp(avatar.tempFilePath);
        return next(error);
    }
};

export const updateLocation = async (req, res, next) => {
    const { _id } = req.user; // Assuming the user ID is available in req.user
    const { state, address } = req.body; // Extracting state and address from the request body

    try {
        // Find the user's profile and update the location field
        const profile = await ProfileModel.findOneAndUpdate(
            { user: _id }, // Find the profile based on user ID
            { 
                $set: { 
                    'location.state': state, 
                    'location.address': address 
                } 
            },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        return res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            location: profile.location
        });

    } catch (error) {
        return next(error);
    }
};

export const updatePassword = async (req, res, next) => {
    const { id } = req.user;
    const { currentPassword, newPassword } = req.body
    try {

        if (newPassword.length < 6) return next(new ErrorHandler("Password cannot be less than 6 characters", 200))

        const user = await UserModel.findById(id).select("+password")

        const isPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isPassword) {
            return next(new ErrorHandler("Invalid Old Password", 200))
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Changed"
        })

    } catch (error) {
        return next(error)
    }
}

export const updateBankInfo = async (req, res, next) => {
    const { _id, role } = req.user;
    const { account_name, account_number, bank_name, bank_code } = req.body;

    try {
        // Check if the user's role is not an artisan
        if (role !== 'artisan') {
            return next(new ErrorHandler('You are not authorized to update bank information', 403));
        }

        // Find the user's profile by the user ID
        let profile = await ProfileModel.findOne({ user: _id });

        // If profile not found, return an error
        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        // Update bank information
        profile.bankInfo = {
            account_name: account_name || profile.bankInfo.account_name,
            account_number: account_number || profile.bankInfo.account_number,
            bank_name: bank_name || profile.bankInfo.bank_name,
            bank_code: bank_code || profile.bankInfo.bank_code
        };

        // Save the updated profile
        await profile.save();

        return res.status(200).json({
            success: true,
            message: 'Bank information updated successfully',
            bankInfo: profile.bankInfo
        });
    } catch (error) {
        return next(error);
    }
};

export const updateLevel1 = async (req, res, next) => {
    const { firstName, lastName } = req.body;
    const { id,role } = req.user;
    const { validId, passport } = req.files; // Assuming files are sent as 'validId' and 'passport'

    try {
        // Check if the user is an artisan
        const profile = await ProfileModel.findOne({ user: id });
        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        if (role !== 'artisan') {
            return next(new ErrorHandler('You are not an artisan', 403));
        }

        // Upload validId document
        let validIdResult = profile.verification.level1.validId;
        if (validId) {
            const result = await cloudinary.v2.uploader.upload(validId.tempFilePath, {
                folder: 'validIds',
                resource_type: 'auto', // Allows uploading of any file type
            });
            validIdResult = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        // Upload passport image
        let passportResult = profile.verification.level1.passport;
        if (passport) {
            const result = await cloudinary.v2.uploader.upload(passport.tempFilePath, {
                folder: 'passports',
                resource_type: 'image', // Restricting to image only
            });
            passportResult = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        // Update profile
        profile.verification.level1 = {
            firstName,
            lastName,
            validId: validIdResult,
            passport: passportResult,
            verified: profile.verification.level1.verified,
        };
        await profile.save();

        await UserModel.findByIdAndUpdate(id, { verificationLevel: 1 });

        res.status(200).json({
            success: true,
            message: 'Level 1 details updated successfully',
            level1: profile.verification.level1,
        });
    } catch (error) {
        return next(error);
    }
};

export const updateLevel2 = async (req, res, next) => {
    const { tel, address } = req.body;
    const { id,role } = req.user;

    try {
        const profile = await ProfileModel.findOne({ user: id });
        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        if (role !== 'artisan') {
            return next(new ErrorHandler('You are not an artisan', 403));
        }

        profile.verification.level2 = {
            tel,
            address,
            verified: profile.verification.level2.verified,
        };
        await profile.save();

        await UserModel.findByIdAndUpdate(id, { verificationLevel: 2 });

        res.status(200).json({
            success: true,
            message: 'Level 2 details updated successfully',
            level2: profile.verification.level2,
        });
    } catch (error) {
        return next(error);
    }
};

export const updateLevel3 = async (req, res, next) => {
    const { tradeCertificate, proofOfTraining, cv } = req.files; // Assuming files are sent as 'tradeCertificate', 'proofOfTraining', 'cv'
    const { id,role } = req.user;

    try {
        const profile = await ProfileModel.findOne({ user: id });
        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        if (role !== 'artisan') {
            return next(new ErrorHandler('You are not an artisan', 403));
        }

        // Upload documents
        let tradeCertificateResult = profile.verification.level3.tradeCertificate;
        let proofOfTrainingResult = profile.verification.level3.proofOfTraining;
        let cvResult = profile.verification.level3.cv;

        if (tradeCertificate) {
            const result = await cloudinary.v2.uploader.upload(tradeCertificate.tempFilePath, {
                folder: 'tradeCertificates',
                resource_type: 'auto',
            });
            tradeCertificateResult = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        if (proofOfTraining) {
            const result = await cloudinary.v2.uploader.upload(proofOfTraining.tempFilePath, {
                folder: 'proofOfTraining',
                resource_type: 'auto',
            });
            proofOfTrainingResult = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        if (cv) {
            const result = await cloudinary.v2.uploader.upload(cv.tempFilePath, {
                folder: 'cv',
                resource_type: 'auto',
            });
            cvResult = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        // Update profile
        profile.verification.level3 = {
            tradeCertificate: tradeCertificateResult,
            proofOfTraining: proofOfTrainingResult,
            cv: cvResult,
            verified: profile.verification.level3.verified,
        };
        await profile.save();

        await UserModel.findByIdAndUpdate(id, { verificationLevel: 3 });

        res.status(200).json({
            success: true,
            message: 'Level 3 details updated successfully',
            level3: profile.verification.level3,
        });
    } catch (error) {
        return next(error);
    }
};

export const updateLevel4 = async (req, res, next) => {
    const { testDay, testTime } = req.body;
    const { id,role } = req.user;

    try {
        const profile = await ProfileModel.findOne({ user: id });
        if (!profile) {
            return next(new ErrorHandler('Profile not found', 404));
        }

        if (role !== 'artisan') {
            return next(new ErrorHandler('You are not an artisan', 403));
        }

        profile.verification.level4 = {
            testDay,
            testTime,
            verified: profile.verification.level4.verified,
        };
        await profile.save();

        await UserModel.findByIdAndUpdate(id, { verificationLevel: 4 });

        res.status(200).json({
            success: true,
            message: 'Level 4 details updated successfully',
            level4: profile.verification.level4,
        });
    } catch (error) {
        return next(error);
    }
};
