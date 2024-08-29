import  express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { initializePayment,verifyAndAddTualePoints,makeRecurringPayment,initializeSubscription} from "../controllers/paymentController";

const router = express.Router()
 
router.route('/pay').post(authenticateUser,makeRecurringPayment); 


export default router;