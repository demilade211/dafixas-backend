import UserModel from "../models/user" 
import ErrorHandler from "../utils/errorHandler.js"; 
import bcrypt from "bcryptjs";

export const getLoggedInUser = async(req,res,next)=>{
    const {_id} = req.user;

    try {  
        const user = await UserModel.findById(_id);     


        return res.status(200).json({
            success: true,
            user,   
        })

    } catch (error) {
        return next(error)
    }
}

export const searchUsers = async (req, res, next) => {

    const { username } = req.query;

    if(username.length < 1)return next(new ErrorHandler("Search text can't be less than 1",200));

    try {
        // Find all users in the UserModel
        const users = await UserModel.find({
            username: {$regex: username , $options: "i"}//i means it shouldnt be case sensitive
        });
 

        // Return the list of users if found
        return res.status(200).json({
            success: true,
            message: 'Users found',
            users
        });
    } catch (error) {
        // Handle errors
        return next(error);
    }
};


 
export const deleteMyAccount = async(req,res,next)=>{
    const {password} = req.body
    const{_id} = req.user

    try {  

        const user = await UserModel.findById(_id).select("+password");

        if(!password) return next(new ErrorHandler("Please Enter password",200))

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return next(new ErrorHandler("Invalid Password",200))
        }
        user.isDeactivated = true
        user.save()

        

        return res.status(200).json({
            success: true,
            message: "Account Deactivated. Account will be permanently deleted after 30 days. To reactivated within 30 days contact our support team"
        })

    } catch (error) {
        return next(error)
    }
}

 