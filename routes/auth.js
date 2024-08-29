import  express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { registerUser,saveNameAndUsername,loginUser,forgotPassword,verifyToken,resetPassword,checkPhone,sendOtpToEmail,verifyOtp} from "../controllers/authController";

const router = express.Router()

router.route('/register').post(registerUser);
router.route('/login').post(loginUser); 

router.route('/email/send').post(sendOtpToEmail);

router.route('/password/forgot').post(forgotPassword);

router.route('/verify/password/token').post(verifyToken);

router.route('/verify/otp').post(verifyOtp);

router.route('/password/reset/:userId').put(resetPassword);



export default router;