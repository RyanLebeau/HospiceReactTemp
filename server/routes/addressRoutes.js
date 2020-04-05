/*
=============================================================
This route will validate that the correct token is being used
and then pull its specific data from the addressController.
=============================================================
*/

const passport = require('passport');
const express = require("express");
const { validateBody, schemas } = require('../middleware/routeValidation');
const router = express.Router();

const AddressController = require('../controllers/addressController');
const authenticate = passport.authenticate('JwtToken', { session: false });

router.get('/', authenticate, AddressController.readall);
router.get('/:addressID', authenticate, AddressController.read);
router.post('/', validateBody(schemas.facility.create), authenticate, AddressController.create);
router.post('/query', authenticate, AddressController.query);
router.patch('/:addressID', authenticate, AddressController.update);
router.delete('/:addressID', authenticate, AddressController.delete);

module.exports = router;