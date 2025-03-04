import UserModel from "../models/user"
import ProfileModel from "../models/profile.js"
import NotificationModel from "../models/notification.js"
import Chat from "../models/chat.js"
import otpModel from "../models/otps"
import ErrorHandler from "../utils/errorHandler.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import crypto from "crypto"
import sendEmail from "../utils/sendEmail"
import newOTP from 'otp-generators';
import { handleEmail } from "../utils/helpers";
import { sendWhatsappOtp } from "../utils/sendWhatsapp.js";
import { sendSms } from "../utils/sendSms.js";

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;



export const sendOtpToEmail = async (req, res, next) => {

    const { email } = req.body;

    const { tel } = req.query;

    // Generate token
    const otp = newOTP.generate(5, { alphabets: false, upperCase: false, specialChar: false });

    // Hash and set to resetPasswordToken
    const hashed = crypto.createHash('sha256').update(otp).digest('hex');

    // Set token expire time
    const expiryDate = Date.now() + 30 * 60 * 1000

    const message = `Hi there use the otp below to complete your registeration:\n\n${otp}\n\nif you have not 
        requested this email, then ignore it.`

    try {

        const user = await otpModel.findOne({ email: email.toLowerCase() })

        if (user) {

            // Hash and set to resetPasswordToken
            user.otp = hashed;

            // Set token expire time
            user.expiretoken = expiryDate;

            await user.save({ validateBeforeSave: false });

            // Send OTP via WhatsApp (if tel is provided)
            if (tel) {
                //await sendWhatsappOtp(tel, otp);
                await sendSms(`+${tel}`, `Your dafixas OTP is: ${otp}`, next);  // Send OTP via SMS
            }

            return await handleEmail(user, next, message, res)

        }


        const savedUser = await otpModel.create({
            email,
            otp: hashed,
            expiretoken: expiryDate
        });


        // Send OTP via WhatsApp (if tel is provided)
        if (tel) {
            //await sendWhatsappOtp(tel, otp);
            await sendSms(`+${tel}`, `Your dafixas OTP is: ${otp}`, next);  // Send OTP via SMS
        }
        return await handleEmail(savedUser, next, message, res)



    } catch (error) {
        return next(error)
    }
}

export const verifyOtp = async (req, res, next) => {
    const { otp } = req.body;

    try {
        // Hash URL otp
        const resetOtp = crypto.createHash('sha256').update(otp).digest('hex')

        const user = await otpModel.findOne({
            otp: resetOtp,
            expiretoken: { $gt: Date.now() }
        })

        if (!user) return next(new ErrorHandler('OTP is invalid or has expired', 200))

        return res.status(200).json({
            success: true,
            message: `OTP Verified`,
        })


    } catch (error) {
        return next(error)
    }
}

export const registerUser = async (req, res, next) => {

    try {
        const { name, role, state, tel, email, password, confirmPassword , skill} = req.body

        if (!name || !role || !state || !tel || !email || !password || !confirmPassword) return next(new ErrorHandler("Alls fields required", 400))


        if (password !== confirmPassword) return next(new ErrorHandler("Passwords do not match", 200))

        if (password.length < 6) return next(new ErrorHandler("Password cannot be less than 6 characters", 200))

        const user = await UserModel.findOne({ email: email.toLowerCase() })

        if (user) return next(new ErrorHandler("User already registered", 200))

        //const dob = new Date(dateOfBirth)


        // Create the user with or without the skill field
        const userData = {
            email: email.toLowerCase(),
            name,
            role,
            state,
            password,
            tel,
            authorizations: [],
        };

        if (role === "artisan") {
            userData.skill = skill || ""; // Assign skill if role is artisan
        }

        const savedUser = await UserModel.create(userData);



        let profileFields = {
            user: savedUser._id,
            state,
            tel
        };

        if (role === "user") {
            profileFields.wallet = { balance: 0 };
        }

        if (role === "artisan") {
            profileFields.bankInfo = {
                account_name: "",
                account_number: "",
                bank_name: "",
                bank_code: "",
            };
            profileFields.verification = {
                level1: {
                    validId: { public_id: "", url: "" },
                    passport: { public_id: "", url: "" },
                    verified: false,
                },
                level2: {
                    tel: "",
                    address: "",
                    verified: false,
                },
                level3: {
                    tradeCertificate: { public_id: "", url: "" },
                    proofOfTraining: { public_id: "", url: "" },
                    cv: { public_id: "", url: "" },
                    verified: false,
                },
                level4: {
                    testDay: "",
                    testTime: "",
                    verified: false,
                },
            };
        }

        const savedProfile = await ProfileModel.create(profileFields);
        const savedNotification = await NotificationModel.create({ user: savedUser._id });
        // Create new chat directly for the new user
        const newChat = new Chat({
            members: [savedUser._id, "66d0055302243ec58f5e2799"], // Predefined user ID
        });
        await newChat.save();


        const payload = { userid: savedUser._id }
        const authToken = await jwt.sign(payload, process.env.SECRETE, { expiresIn: '7d' })//expiresIn: '7d' before

        res.status(200).json({
            success: true,
            token: authToken,
            name: savedUser.name
        })

    } catch (error) {
        return next(error)
    }
}

//To login {{DOMAIN}}/api/login
export const loginUser = async (req, res, next) => {

    const { email, password } = req.body

    try {

        if (!email || !password) return next(new ErrorHandler("All fields required", 400))

        if (password.length < 6) return next(new ErrorHandler("Password cannot be less than 6 characters", 200))


        const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+password")


        if (!user) return next(new ErrorHandler("Invalid Credentials", 200))

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return next(new ErrorHandler("Invalid Credentials", 200))
        }

        const payload = {
            userid: user._id
        }

        const authToken = await jwt.sign(payload, process.env.SECRETE, { expiresIn: '7d' })

        let name = user.name || "No name"

        // Check if there's already a chat with the logged-in user and the predefined user
        const existingChat = await Chat.findOne({
            members: { $all: [user._id, "66d0055302243ec58f5e2799"] },
        });

        if (!existingChat) {
            // Create a new chat if none exists
            const newChat = new Chat({
                members: [user._id, "66d0055302243ec58f5e2799"],
            });
            await newChat.save();
        }

        res.status(200).json({
            success: true,
            token: authToken,
            name
        })

    } catch (error) {
        return next(error)
    }
}

//Forgot password {{DOMAIN}}/api/v1/password/forgot
export const forgotPassword = async (req, res, next) => {

    const { email } = req.body;

    try {

        const user = await UserModel.findOne({ email: email.toLowerCase() })

        if (!user) return next(new ErrorHandler("User with this email not found", 200))

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and set to resetPasswordToken
        user.resettoken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token expire time
        user.expiretoken = Date.now() + 30 * 60 * 1000

        await user.save({ validateBeforeSave: false });


        const resetUrl = `https://www.dafixas.com/auth/reset/${resetToken}`;
        const message = `
            <p>Please click on the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Link</a>
            <p>If you did not request this email, please ignore it.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: "daFixas Password Recovery",
                message,
                html: message
            })

            return res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`
            })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false })
            return next(new ErrorHandler(error.message, 500))

        }


    } catch (error) {
        return next(error)
    }
}

//reset password {{DOMAIN}}/api/v1/verify/password/:token
export const verifyToken = async (req, res, next) => {
    const { token } = req.body;

    try {
        // Hash URL token
        const resettoken = crypto.createHash('sha256').update(token).digest('hex')

        const user = await UserModel.findOne({
            resettoken,
            expiretoken: { $gt: Date.now() }
        })

        if (!user) return next(new ErrorHandler('Password reset token is invalid or has been expired', 200))

        return res.status(200).json({
            success: true,
            message: `Token Verified`,
            userId: user._id
        })


    } catch (error) {
        return next(error)
    }
}

//reset password {{DOMAIN}}/api/v1/password/reset/:userId
export const resetPassword = async (req, res, next) => {
    const { userId } = req.params;
    const { password, confirmPassword } = req.body;

    try {

        const user = await UserModel.findById(userId)

        if (!user) return next(new ErrorHandler('Pass a valid user Id', 400))

        if (!password || !confirmPassword) return next(new ErrorHandler('All fields required', 400))

        if (password !== confirmPassword) {
            return next(new ErrorHandler('Password does not match', 200))
        }

        // Setup new password

        user.password = password;

        user.resettoken = undefined;
        user.expiretoken = undefined;

        await user.save();

        const payload = { userid: user._id }
        const authToken = await jwt.sign(payload, process.env.SECRETE, { expiresIn: '7d' })

        res.status(200).json({
            success: true,
            token: authToken,
            name: user.name
        })

    } catch (error) {
        return next(error)
    }
}


