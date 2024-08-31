import  express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { getNotifications,setNotificationsToRead} from "../controllers/notificationController";

const router = express.Router()

router.route('/').get(authenticateUser,getNotifications)
                .post(authenticateUser,setNotificationsToRead);


export default router;