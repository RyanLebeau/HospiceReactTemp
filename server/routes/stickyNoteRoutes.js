/*
==============================================================
This route will validate that the correct token is being used
and then pull its specific data from the StickyNoteController.
==============================================================
*/

const passport = require('passport');
const express = require("express");
const { validateBody, schemas } = require('../middleware/routeValidation');
const router = express.Router();

const StickyNoteController = require('../controllers/stickyNotesController');
const authenticate = passport.authenticate('JwtToken', { session: false });

router.get('/', authenticate, StickyNoteController.readall);
router.get('/:stickyNoteID', authenticate, StickyNoteController.read);
router.post('/', validateBody(schemas.stickyNote.create), authenticate, StickyNoteController.create);
router.post('/query', authenticate, StickyNoteController.query);
router.patch('/:stickyNoteID', authenticate, StickyNoteController.update);
router.delete('/:stickyNoteID', authenticate, StickyNoteController.delete);

module.exports = router;