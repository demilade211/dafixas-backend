import express from 'express';
import {
    createInvite,
    getInvites,
    getInviteById,
    getInviteByName,
    acceptInviteByName,
    rejectInviteByName
} from '../controllers/invitesController';

const router = express.Router();

// Create a new invite
router.route('/').post(createInvite);

// Get all 
router.route('/').get(getInvites); 

// Get a single invite by name
router.route('/name/:name').get(getInviteByName);

// Accept an invite by name
router.route('/accept/:name').put(acceptInviteByName);

// Reject an invite by name
router.route('/reject/:name').put(rejectInviteByName);

export default router;
