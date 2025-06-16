const express = require("express");
const router = express.Router();
const { signupdoctor, signuppatient, loginboth, forgotpass } = require("../controllers/authcontroller.js");
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

router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const {newPassword } = req.body;
    try {
      // Find the user with matching token and valid expiration
      const user = await userlogin.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
  

     if (!user) {
        return res.status(400).json({ error: "Password reset token is invalid or has expired." });
      }

      // const hashed=await hashing(newPassword);
      // Update the password (ensure you hash it before saving, if needed)
      user.password = await hashing(newPassword); // You should hash this password!
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      await user.save();
  
      res.json({ message: "Password has been reset successfully." });
    } catch (error) {
      console.error("Reset Password Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router;
