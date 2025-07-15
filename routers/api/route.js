const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const encodeController = require('../../controllers/videoController');
const videosController = require('../../controllers/apiController');
const checkRole = require('../../middleware/checkRole')
const auth = require('../../middleware/auth');

app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

router.post('/addmovie',auth,checkRole(['user','admin']), videosController.addnewmovie);
router.post('/addseries',auth,checkRole(['user','admin']), videosController.addnewseries);
router.post('/encode', auth,checkRole(['user','admin']), encodeController.encode);
router.get('/movies', videosController.getMovie);

module.exports = router;