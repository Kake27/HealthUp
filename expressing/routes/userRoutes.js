const express = require("express");
const router = express.Router();
const { signupdoctor, signuppatient, loginboth, forgotpass,  resetPassword } = require("../controllers/authcontroller.js");
const userlogin = require("../models/usermodel.js");
const { hashing } = require('../helper/authhelper.js');
const multer = require("multer");
const upload = multer(); 
// for first time registration/signup (doctors)
router.post("/signup-doctor",upload.single("photo"),signupdoctor);
// for first time registration/signup (patients)
router.post("/signup-patient",signuppatient);

//for login when you have already registered 
router.post("/login",loginboth);

//When you just do-not remember the password
router.post("/forgot-password",forgotpass);

router.post("/reset-password/:token", resetPassword);
  

module.exports = router;
