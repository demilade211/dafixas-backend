import  express from "express";
import {getWebhook} from "../controllers/webhookController";

const router = express.Router()

router.route('/').post(getWebhook);




export default router;