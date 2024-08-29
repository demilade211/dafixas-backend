import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { createTeam, acceptTeamUpRequest,getUserTeam,checkUsername,getTeamUpRequests, sendTeamUpRequestToPlayer, exitTeam, removeTeammate } from "../controllers/teamController";

const router = express.Router();

router.route('/create').post(authenticateUser, createTeam);
router.route('/').get(authenticateUser, getUserTeam);//get teams
router.route('/check').get(checkUsername);
router.route('/team-up-requests').get(authenticateUser,getTeamUpRequests);
router.route('/accept/:teamId').put(authenticateUser, acceptTeamUpRequest);
router.route('/send-request/:teamId/:playerId').post(authenticateUser, sendTeamUpRequestToPlayer);
router.route('/exit/:teamId').put(authenticateUser, exitTeam);
router.route('/remove/:teamId/:playerId').put(authenticateUser, removeTeammate);

export default router;
