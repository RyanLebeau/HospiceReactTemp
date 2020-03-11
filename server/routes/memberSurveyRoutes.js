const passport = require('passport');
const express = require("express");
const { validateBody, schemas } = require('../middleware/routeValidation');
const router = express.Router();

const MemberSurveyController = require('../controllers/memberSurveyController');
const authenticate = passport.authenticate('JwtToken', { session: false });

router.get('/', authenticate, MemberSurveyController.readall);
router.get('/:memberSurveyID', authenticate, MemberSurveyController.read);
router.post('/', validateBody(schemas.memberSurvey.create), authenticate, MemberSurveyController.create);
router.post('/query', authenticate, MemberSurveyController.query);
router.patch('/:memberSurveyID', authenticate, MemberSurveyController.update);
router.delete('/:memberSurveyID', authenticate, MemberSurveyController.delete);

module.exports = router;