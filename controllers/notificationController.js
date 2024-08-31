import UserModel from "../models/user"
import NotificationModel from "../models/notification"
import notification from "../models/notification";
import {paginate} from "../utils/helpers"


export const getNotifications = async(req,res,next)=>{
    const {pageNumber} = req.query;
    const {id} = req.user;
    const size = 8;

    try {  
        const user = await NotificationModel.findOne({user: id}).populate("notifications.user")
        
        const filteredNotification = user.notifications.filter(notification=>{
            return notification.post !== null && notification.user !== null
        })

        user.notifications = filteredNotification;
        await user.save()

        let paginatedNotifications = paginate(filteredNotification,pageNumber,size)
        
        return res.status(200).json({
            success: true,
            notifications:paginatedNotifications
        })

    } catch (error) {
        return next(error)
    }
}

export const setNotificationsToRead = async(req,res,next)=>{
    const {id} = req.user;
    try {  
        const user = await UserModel.findById(id)

        if(user.unreadNotification){
            user.unreadNotification = false;
            await user.save();
        }
        return res.status(200).json({
            success: true,
            message:"Set to read"
        })
    } catch (error) {
        return next(error)
    }
}