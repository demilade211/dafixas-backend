import  express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import {getLoggedInUser } from "../controllers/userController"

const router = express.Router()

router.route('/me').get(authenticateUser,getLoggedInUser);  





export default router;