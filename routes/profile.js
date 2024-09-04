import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { getWalletBalance, getProfile, updatePersonalInfo,updateLocation,updatePassword,updateBankInfo,updateLevel1,updateLevel2,updateLevel3,updateLevel4 } from "../controllers/profileController";

const router = express.Router()

router.route('/').get(authenticateUser, getProfile)
    .put(authenticateUser, updatePersonalInfo);
router.route('/location').put(authenticateUser, updateLocation);
router.route('/security').put(authenticateUser, updatePassword);
router.route('/bank-info').put(authenticateUser, updateBankInfo); 
router.route('/updateLevel1').post(authenticateUser, updateLevel1); 
router.route('/updateLevel2').post(authenticateUser, updateLevel2); 
router.route('/updateLevel3').post(authenticateUser, updateLevel3); 
router.route('/updateLevel4').post(authenticateUser, updateLevel4); 
router.route('/wallet').get(authenticateUser, getWalletBalance);


export default router;