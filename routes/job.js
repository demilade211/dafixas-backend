import  express from "express";
import { authenticateUser,allowedRoles } from "../middlewares/authMiddleware";
import { createJobRequest,getUserJobs} from "../controllers/jobController";

const router = express.Router()  

router.route('/create').post(authenticateUser,createJobRequest); 
router.route('/requests').get(authenticateUser,getUserJobs); 

export default router;