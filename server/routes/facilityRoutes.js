/*
=============================================================
This route will validate that the correct token is being used
and then pull its specific data from the facilityController.
=============================================================
*/

const passport = require('passport');
const express = require("express");
const { validateBody, schemas } = require('../middleware/routeValidation');
const router = express.Router();

const FacilityController = require('../controllers/facilityController');
const authenticate = passport.authenticate('JwtToken', { session: false });

router.get('/', authenticate, FacilityController.readall);
router.get('/:facilityID', authenticate, FacilityController.read);
router.post('/', authenticate, validateBody(schemas.facility.create), FacilityController.create);
router.post('/query', authenticate, FacilityController.query);
router.patch('/:facilityID', authenticate, FacilityController.update);
router.delete('/:facilityID', authenticate, FacilityController.delete);

module.exports = router;