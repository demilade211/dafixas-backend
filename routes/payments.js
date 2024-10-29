import  express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { initializePayment,makeRecurringPayment} from "../controllers/paymentController";

const router = express.Router()
 
router.route('/initialize').post(authenticateUser,initializePayment); 
router.route('/pay').post(authenticateUser,makeRecurringPayment); 


export default router;