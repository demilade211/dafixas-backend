import  express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import {searchUsers,getLoggedInUser,reportUser,blockUser,unblockUser,deleteMyAccount,setAccountType} from "../controllers/userController"

const router = express.Router()

router.route('/me').get(authenticateUser,getLoggedInUser); 
router.route('/search').get(searchUsers); 

router.route('/me/delete').post(authenticateUser,deleteMyAccount); 





export default router;