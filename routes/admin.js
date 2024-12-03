import  express from "express";
import { authenticateUser,allowedRoles } from "../middlewares/authMiddleware";
import {adminSummary,
    updateVerificationStatus,
    inviteSupervisor,
    searchArtisan,
    verifyInviteToken,
    assignArtisanToJob,
    getArtisansByState,
    getArtisans,
    getUserDetails,
    getSupervisors,
    getUsers,
    getUserProjects, 
    getProjects, 
    getProject, 
    acceptRequest, 
    rejectRequest, 
    assignSupervisorToJob ,
    addMaterialToJob,         // New material-related controllers
    editMaterialInJob,
    deleteMaterialFromJob,
    updateArtisanFeeInJob, 
    completeJob,
    deleteRequest
} from "../controllers/adminController"

const router = express.Router()

router.route('/').get(authenticateUser,allowedRoles('admin','supervisor'),adminSummary);  
router.route('/invite/verify').post(verifyInviteToken);
router.route('/invite/supervisor').post(authenticateUser,allowedRoles('admin'),inviteSupervisor);
router.route('/artisans').get(authenticateUser,allowedRoles('admin'),getArtisans);  
router.route('/user/:userId').get(authenticateUser,allowedRoles('admin','supervisor'),getUserDetails); 
router.route('/supervisors').get(authenticateUser,allowedRoles('admin'),getSupervisors); 
router.route('/users').get(authenticateUser,allowedRoles('admin'),getUsers); 
router.route('/:userId/projects').get(authenticateUser,allowedRoles('admin'),getUserProjects); 
router.route('/projects').get(authenticateUser,allowedRoles('admin','supervisor'),getProjects); 
router.route('/projects/:projectId').get(authenticateUser,allowedRoles('admin'),getProject); 
router.route('/accept/:jobId').post(authenticateUser,allowedRoles('admin'),acceptRequest); 
router.route('/reject/:jobId').post(authenticateUser,allowedRoles('admin'),rejectRequest); 
router.route('/assign/:jobId/:userId').post(authenticateUser,allowedRoles('admin'),assignSupervisorToJob);
router.route('/assign/artisan/:jobId/:userId').post(authenticateUser,allowedRoles('admin','supervisor'),assignArtisanToJob);
router.route('/state/artisans').get(getArtisansByState);  
router.route('/search/artisans').get(searchArtisan); 
router.route('/verify/:level').patch(authenticateUser,allowedRoles('admin'),updateVerificationStatus); 
// New routes for managing materials and artisan fees
router.route('/job/:jobId/material/add').post(authenticateUser, allowedRoles('admin', 'supervisor'), addMaterialToJob); 
router.route('/job/:jobId/material/edit/:materialId').put(authenticateUser, allowedRoles('admin', 'supervisor'), editMaterialInJob); 
router.route('/job/:jobId/material/delete/:materialId').delete(authenticateUser, allowedRoles('admin', 'supervisor'), deleteMaterialFromJob);
router.route('/job/:jobId/artisan/fee/update/:artisanId').put(authenticateUser, allowedRoles('admin', 'supervisor'), updateArtisanFeeInJob);


// New Routes for Job Management
router.route('/complete/:jobId').post(authenticateUser, allowedRoles("supervisor"), completeJob);
router.route('/delete/:jobId').delete(authenticateUser,allowedRoles('admin'),deleteRequest); 

export default router;