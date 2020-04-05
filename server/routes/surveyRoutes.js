/*
=============================================================
This route will validate that the correct token is being used
and then pull its specific data from the SurveyController.
==============================================================
*/

const passport = require('passport');
const express = require("express");
const { validateBody, schemas } = require('../middleware/routeValidation');
const router = express.Router();

const SurveyController = require('../controllers/surveyController');
const authenticate = passport.authenticate('JwtToken', { session: false });

router.get('/', authenticate, SurveyController.readall);
router.get('/:surveyID', authenticate, SurveyController.read);
router.post('/', validateBody(schemas.survey.create), authenticate, SurveyController.create);
router.post('/query', authenticate, SurveyController.query);
router.patch('/:surveyID', authenticate, SurveyController.update);
router.delete('/:surveyID', authenticate, SurveyController.delete);

module.exports = router;