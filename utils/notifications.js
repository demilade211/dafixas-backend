import UserModel from "../models/user"
import profileModel from "../models/profile"
import PostModel from "../models/post"
import NotificationModel from "../models/notification"
import FollowersModel from "../models/followers"
import ErrorHandler from "./errorHandler";

export const setNotificationToUnread = async(userId,next)=>{

    try {
        const user = await UserModel.findById(userId);

        if(!user.unreadNotification){
            user.unreadNotification = true;
            await user.save();  
        }
        return;
    } catch (error) {
        return next(error)
    }

}

export const newTipNotification = async(userId,userToNotifyId,numOfTuales,next)=>{

    try {
        const userToNotify = await NotificationModel.findOne({user:userToNotifyId});

        const newNotification = {
            type: "newTip",
            user: userId, 
            date: Date.now(),
            numOfTuales
        }

        await userToNotify.notifications.unshift(newNotification);
        await userToNotify.save();
        await setNotificationToUnread(userToNotifyId,next)
        return;
    } catch (error) {
        return next(error)
    }

}
 