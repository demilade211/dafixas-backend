import  express from "express";
import { authenticateUser,allowedRoles } from "../middlewares/authMiddleware";
import { getAllTournaments,getTournamentById,removePlayerFromTournamentByUsername,makeRecurringPayment,updateTournament,getRounds,getPaginatedGroups,getGroupAndSlot,getResultRounds,getResultPaginatedGroups,createTournament,registerForTournament,addTeamToTournament,movePlayersToNewRound,updateTeamPositionAndMembersKills} from "../controllers/tournamentController";

const router = express.Router()

router.route('/').get(getAllTournaments); 
router.route('/:tournamentId').get(getTournamentById);
// router.route('/arrangement/:tournamentId').get(getArrangement);  
router.route('/rounds/:tournamentId').get(getRounds);  
router.route('/groups/:tournamentId/:roundId').get(getPaginatedGroups); 
router.route('/group-slot-details/:tournamentId/:roundId').get(authenticateUser,getGroupAndSlot);  
router.route('/result/rounds/:tournamentId').get(getResultRounds);  
router.route('/result/groups/:tournamentId/:roundId').get(getResultPaginatedGroups);  
router.route('/create').post(authenticateUser,createTournament);
router.route('/update-tournament/:tournamentId').put(authenticateUser,updateTournament);
router.route('/register/:tournamentId').post(authenticateUser,registerForTournament);
router.route('/pay/:tournamentId').post(authenticateUser,makeRecurringPayment);  
// Route to remove a player from a tournament by username (only for admin)
router.route('/remove-player/:tournamentId/:username').delete(authenticateUser, allowedRoles('admin'), removePlayerFromTournamentByUsername);
router.route('/add-team/:tournamentId').put(authenticateUser,addTeamToTournament);
router.route('/move-player/:tournamentId/:roundId/:groupId').post(authenticateUser,movePlayersToNewRound);
router.route('/update/:tournamentId/:roundId/:groupId/:teamId').put(authenticateUser,updateTeamPositionAndMembersKills);



export default router;