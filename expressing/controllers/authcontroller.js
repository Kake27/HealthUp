const userlogin = require("../models/usermodel.js");
const doctorsign = require("../models/doctormodel.js");
const patientsign = require("../models/patientmodel.js");
const { hashing, comparePassword } = require('../helper/authhelper.js');
const jwt = require("jsonwebtoken"); 
require('dotenv').config();
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const signupdoctor = async (req, res) => {
    try {
      // Destructure individual fields from req.body
      const { name, email, password, role, specialization, experience, availableDays, availableTime, photo, consultationFee } = req.body;
  
      // Validate required fields (for user signup)
      if (!name || !email || !password || !role) {
        return res.status(400).send({ error: "You have not filled all the required fields" });
      }
  
      // Check if a user with the provided email already exists
      const existingUser = await userlogin.findOne({ email });
      if (existingUser) {
        return res.status(400).send({
          success: false,
          error: "There is already an account with this emailId"
        });
      }
  
      const hashed=await hashing(password);
      // Create and save a new user
      const newUser = new userlogin({
        name,
        email,
        password:hashed,
        role
      });
      await newUser.save();
  
      // Create and save a new doctor profile linked to the new user
      const newDoctor = new doctorsign({
        user: newUser._id, // Reference to the User document
        specialization,
        experience,
        availableDays,
        availableTime,
        photo,
        consultationFee,
      });
      await newDoctor.save();
  
      res.status(201).send({
        success: true,
        message: "Doctor registered successfully",
        doctor: newDoctor,
      });
    } catch (e) {
      console.error("Registration Error:", e);
      res.status(500).json({
        success: false,
        message: "Error in Registration",
        error: e.message || e,
      });
    }
  };



 const  signuppatient =async (req,res)=>{
    try{
const {name,email,password,role,age,gender,medicalHistory}=req.body;
if (!name || !email || !password || !role) {
    return res.status(400).send({ error: "You have not filled all the required fields" });
  }

  const existingUser = await userlogin.findOne({ email });
      if (existingUser) {
        return res.status(400).send({
          success: false,
          error: "There is already an account with this emailId"
        });
      }
  const hashed=await hashing(password);
      const newUser = new userlogin({
        name,
        email,
        password:hashed, 
        role
      });
      await newUser.save();

const newpatient= new patientsign({
    user: newUser._id,
    age,
    gender,
    medicalHistory,
});
await newpatient.save();

res.status(201).send({
    success:true,
    message: "Patient registered successfully",
        patient: newpatient,
})
 }
 catch(e){
    console.error("Registration Error:", e);
    res.status(500).json({
      success: false,
      message: "Error in Registration",
      error: e.message || e,});

 }
}




const loginboth= async (req,res)=>{
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).send({ error: "You have not filled all the required fields" });
    }

    // Find user by email
    const user = await userlogin.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    console.log("User found:", user.email);

    // Compare passwords
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).send({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate token with secret key
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      "your_secret_key", // Replace with a secure secret key from .env
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Error in login",
      error: error.message || error,
    });
  }

}




 const forgotpass= async(req,res)=>{

  try {

    const { email } = req.body;
    // 1. Check if the user exists
    const user = await userlogin.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user with that email" });
    }

    // 2. Generate a token
    const token = crypto.randomBytes(20).toString("hex");

    // 3. Set token and expiration (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // 4. Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or any email service provider
      auth: {
        user: "radhakrishn9256@gmail.com",
        pass: "vhqpczqafmoypspk", // your email password or app-specific password
      },
    });

    // 5. Email content
    const mailOptions = {
      to: user.email,
      from: "radhakrishn9256@gmail.com",
      subject: "Password Reset",
      text:
        "You are receiving this because you  have requested the reset of your account's password.\n\n" +
        "Please click on the following link, or paste it into your browser to complete the process:\n\n" +
        `http://${req.headers.host}/api/healthcare/auth/reset-password/${token}\n\n` +
        "If you did not request this, please ignore this email and your password will remain unchanged.\n",
    };

    // 6. Send the email
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({ error: "Error sending email" });
      }
      res.json({ message: "Password reset email has been sent." });
    });
} catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};








module.exports = { signupdoctor, signuppatient, loginboth, forgotpass };



