import UserModel from "../models/user" 
import NotificationModel from "../models/notification" 
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

export const newRequestNotification = async(userId,userToNotifyId,jobId,next)=>{

    try {
        const userToNotify = await NotificationModel.findOne({user:userToNotifyId});

        const newNotification = {
            type: "newJobRequest",
            user: userId, 
            job:jobId,
            date: Date.now(), 
        }

        if (!userToNotify) return next(new ErrorHandler("User doesn't exist", 200))

        userToNotify.notifications.unshift(newNotification);
        await userToNotify.save();
        await setNotificationToUnread(userToNotifyId,next)
        return;
    } catch (error) {
        return next(error)
    }

}

export const assignSupervisorNotification = async(userId,userToNotifyId,jobId,next)=>{

    try {
        const userToNotify = await NotificationModel.findOne({user:userToNotifyId});

        const newNotification = {
            type: "newAssignSupervisor",
            user: userId, 
            job:jobId,
            date: Date.now(), 
        }

        if (!userToNotify) return next(new ErrorHandler("User doesn't exist", 200))

        userToNotify.notifications.unshift(newNotification);
        await userToNotify.save();
        await setNotificationToUnread(userToNotifyId,next)
        return;
    } catch (error) {
        return next(error)
    }

}

export const assignArtisanNotification = async(userId,userToNotifyId,jobId,next)=>{

    try {
        const userToNotify = await NotificationModel.findOne({user:userToNotifyId});

        const newNotification = {
            type: "newAssignArtisan",
            user: userId, 
            job:jobId,
            date: Date.now(), 
        }

        if (!userToNotify) return next(new ErrorHandler("User doesn't exist", 200))

        userToNotify.notifications.unshift(newNotification);
        await userToNotify.save();
        await setNotificationToUnread(userToNotifyId,next)
        return;
    } catch (error) {
        return next(error)
    }

}
 