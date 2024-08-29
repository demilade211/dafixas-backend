import  express from "express";
import { authenticateUser,allowedRoles } from "../middlewares/authMiddleware";
import { createJobRequest} from "../controllers/jobController";

const router = express.Router()  

router.route('/create').post(authenticateUser,createJobRequest); 


export default router;