// controllers/authcontroller.js
const userlogin  = require("../models/usermodel.js");
const doctorsign = require("../models/doctormodel.js");
const patientsign= require("../models/patientmodel.js");
const { hashing, comparePassword } = require("../helper/authhelper.js");
const jwt        = require("jsonwebtoken");
const crypto     = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const signupdoctor = async (req, res) => {
  try {
    const {
      name, email, password, role,
      specialization, experience,
      availableDays, availableTime,
      consultationFee
    } = req.body;

    // 1) Validate required
    if (!name || !email || !password || !role || !specialization) {
      return res.status(400).json({
        success: false,
        error: "You have not filled all the required fields"
      });
    }

    // 2) Unique email
    if (await userlogin.exists({ email })) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists"
      });
    }

    // 3) Hash password
    const hashedPassword = await hashing(password, 10);

    // 4) Create User
    const newUser = await userlogin.create({
      name, email, password: hashedPassword, role
    });

    // 5) Build Doctor record
    const doctorData = {
      user: newUser._id,
      specialization,
      experience: Number(experience),
      availableDays: Array.isArray(availableDays) ? availableDays : [availableDays],
      availableTime,
      consultationFee: Number(consultationFee),
    };
  if (req.file) {
  doctorData.photo = {
    data: req.file.buffer,
    contentType: req.file.mimetype
  };
}

    const newDoctor = await doctorsign.create(doctorData);

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      doctor: newDoctor
    });
  } catch (e) {
    console.error("Registration Error:", e);
    return res.status(500).json({
      success: false,
      message: "Error in Registration",
      error: e.message
    });
  }
};

const signuppatient = async (req, res) => {
  try {
    const { name, email, password, role, age, gender, medicalHistory } = req.body;

console.log(name);


    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "You have not filled all the required fields"
      });
    }

    if (await userlogin.exists({ email })) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists"
      });
    }

    const hashedPassword = await hashing(password, 10);

    const newUser = await userlogin.create({
      name, email, password: hashedPassword, role
    });

    const newPatient = await patientsign.create({
      user: newUser._id,
      age: Number(age),
      gender,
      medicalHistory
    });

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient: newPatient
    });
  } catch (e) {
    console.error("Patient Registration Error:", e);
    return res.status(500).json({
      success: false,
      message: "Error in Registration",
      error: e.message
    });
  }
};

const loginboth = async (req, res) => {
  try {
    const { email, password, role } = req.body;

console.log(email);

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "You have not filled all the required fields"
      });
    }

    const user = await userlogin.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered"
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      "piyush",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token
    });
  } catch (e) {
    console.error("Login Error:", e);
    return res.status(500).json({
      success: false,
      message: "Error in login",
      error: e.message
    });
  }
};

const forgotpass = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userlogin.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "No user with that email" });
    }

    // Generate token + expiry
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken   = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hr
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: 
        `Click the link to reset your password:\n\n` +
        `http://localhost:5173/reset-password/${token}\n\n` +
        `If you didn't request this, ignore this email.\n`
    };

    transporter.sendMail(mailOptions, err => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({ success: false, error: "Error sending email" });
      }
      res.json({ success: true, message: "Password reset email sent." });
    });
  } catch (e) {
    console.error("Forgot Password Error:", e);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1) Validate incoming
    if (!password) {
      return res
        .status(400)
        .json({ success: false, error: 'New password is required' });
    }

    // 2) Find the user by token & expiry
    const user = await userlogin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: 'Token is invalid or expired' });
    }

    // 3) Hash the new password
    user.password = await hashing(password);

    // 4) Clear the reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: 'Password has been reset' });
  } catch (e) {
    console.error('Reset Password Error:', e);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: e.message });
  }
};

module.exports = {
  signupdoctor,
  signuppatient,
  loginboth,
  forgotpass,
  resetPassword
};
