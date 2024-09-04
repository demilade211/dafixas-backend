import  express from "express";
import { authenticateUser,allowedRoles } from "../middlewares/authMiddleware";
import { createJobRequest,getUserJobs,getArtisanAssignedJobs,acceptJob,getJobDetail} from "../controllers/jobController";

const router = express.Router()  

router.route('/create').post(authenticateUser,createJobRequest); 
router.route('/requests').get(authenticateUser,getUserJobs); 
router.route('/getArtisanAssignedJobs').get(authenticateUser,getArtisanAssignedJobs);  
router.route('/accept/:jobId').post(authenticateUser,acceptJob);  
router.route('/:jobId').get(authenticateUser,getJobDetail);  

export default router;