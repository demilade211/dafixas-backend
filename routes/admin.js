import  express from "express";
import { authenticateUser,allowedRoles } from "../middlewares/authMiddleware";
import {adminSummary,inviteSupervisor,verifyInviteToken,getArtisans,getUserDetails,getSupervisors,getUsers,getUserProjects, getProjects, getProject, acceptRequest, rejectRequest, assignSupervisorToJob } from "../controllers/adminController"

const router = express.Router()

router.route('/').get(authenticateUser,allowedRoles('admin'),adminSummary);  
router.route('/invite/verify').post(authenticateUser,allowedRoles('admin'),verifyInviteToken);
router.route('/invite/supervisor').post(authenticateUser,allowedRoles('admin'),inviteSupervisor);
router.route('/artisans').get(authenticateUser,allowedRoles('admin'),getArtisans);  
router.route('/user/:userId').get(authenticateUser,allowedRoles('admin'),getUserDetails); 
router.route('/supervisors').get(authenticateUser,allowedRoles('admin'),getSupervisors); 
router.route('/users').get(authenticateUser,allowedRoles('admin'),getUsers); 
router.route('/:userId/projects').get(authenticateUser,allowedRoles('admin'),getUserProjects); 
router.route('/projects').get(authenticateUser,allowedRoles('admin'),getProjects); 
router.route('/projects/:projectId').get(authenticateUser,allowedRoles('admin'),getProject); 
router.route('/accept/:jobId').post(authenticateUser,allowedRoles('admin'),acceptRequest); 
router.route('/reject/:jobId').post(authenticateUser,allowedRoles('admin'),rejectRequest); 
router.route('assign/:jobId/:userId').post(authenticateUser,allowedRoles('admin'),assignSupervisorToJob); 





export default router;