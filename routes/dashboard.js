import  express from "express";
import { authenticateUser,allowedRoles } from "../middlewares/authMiddleware";
import { getJobSummary } from "../controllers/dashboardController";

const router = express.Router()  
 
router.route('/summary').get(authenticateUser,getJobSummary);  

export default router;