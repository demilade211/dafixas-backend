import ErrorHandler from "./errorHandler";
import sendEmail from "./sendEmail";
import fs from "fs"
 

export const paginate = (items, page, perPage) => {
  return items.slice(perPage * (page - 1), perPage * page);
}

export const paginate2 = (pageNumber, pageSize) => {
  const page = Number(pageNumber) || 1;
  const limit = Number(pageSize) || 8;
  const skips = limit * (page - 1);
  return { page, limit, skips };
};

export const handleEmail = async (user, next, message,res) => {
  try {
    await sendEmail({
      email: user.email,
      subject: "Gamrs Log OTP",
      message
    })

    return res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`
    })

  } catch (error) {
    user.otp = undefined;
    user.expiretoken = undefined;

    await user.save({ validateBeforeSave: false })
    return next(new ErrorHandler(error.message, 500))
  }
}

export const generateRandomPassword = () => {
  const characters = '0123456789';
  let password = '';
  for (let i = 0; i < 5; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
};
