const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const usercontroller = require("../../controllers/userController");
const checkRole = require('../../middleware/checkRole')
const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload')

app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

router.get('/',auth,usercontroller.getuser)

router.get('/about/:id', usercontroller.getuserbyid);

router.get('/login',(req,res)=>{
  res.render('login.ejs')
})

router.get('/logout',usercontroller.logout)

router.post('/login',usercontroller.handleUserLogin)

router.post('/signup', usercontroller.handleUserSignup);

router.get('/signup',(req,res)=>{
  res.render('register.ejs')
})

router.post('/delete', usercontroller.deleteuser);

router.post('/encode',usercontroller.encode)

// router.get('/refresh',usercontroller.refresh);

router.post('/todo',usercontroller.todo);

router.get('/admin', auth, checkRole(['user','admin']), (req, res) => {
  res.send('Welcome, user!');
});

router.get('/dashboard',usercontroller.dashboardController);

router.post('/upload', auth, checkRole(['admin']),upload.single('file'), usercontroller.handleUpload);


module.exports = router;
