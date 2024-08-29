import  express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { getProfileByUsername,updateProfile} from "../controllers/profileController";

const router = express.Router()

router.route('/').get(getProfileByUsername);  
router.route('/update').put(authenticateUser,updateProfile);  


export default router;