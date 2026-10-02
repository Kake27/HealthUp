
const appoint_model=require("../models/appointmentmodel.js");
const User=require("../models/usermodel.js");
const doctor_profile=require("../models/doctormodel.js");
const patient_precription=require("../models/prescriptionmodel.js");
const jwt = require('jsonwebtoken');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "piyush";

function getTokenFromRequest(req) {
  const headerToken = req.body?.token || req.headers["auth-token"] || req.headers["authorization"];
  if (!headerToken) return null;
  return headerToken.startsWith("Bearer ") ? headerToken.slice(7) : headerToken;
}

async function get_doctor(req, res) {
  try {

console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // 2. Make sure the user has role 'doctor'
    const user = await User.findById(payload.id).select('role');
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // 3. Fetch the full Doctor profile linked to that user
    const doctor = await doctor_profile.findOne({ user: payload.id })
      .populate('user', '-password -__v') // pull in user info except password
      .lean();

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    // 4. Return every field
    return res.status(200).json({ success: true, doctor });
  } catch (e) {
    console.error('get_doctor Error:', e);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const update_profile=async(req,res)=>{
    try {
        const { specialization, experience, availableDays, availableTime, consultationFee } = req.body;
        const doctor = await doctor_profile.findOne({ user: req.user._id });

        if (!doctor) {
          return res.status(404).json({ success: false, message: "Doctor profile not found" });
        }

        let updateFields = {};
        if (specialization) updateFields.specialization = specialization;
        if (experience) updateFields.experience = experience;
        if (availableDays) updateFields.availableDays = availableDays;
        if (availableTime) updateFields.availableTime = availableTime;
        if (consultationFee) updateFields.consultationFee = consultationFee;

        if (req.file) {
          updateFields.photo = {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          };
        }

        const updatedDoctor = await doctor_profile.findOneAndUpdate(
          { _id: doctor._id },
          { $set: updateFields },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: "Doctor profile updated successfully",
          doctor: updatedDoctor,
        });
      } catch (error) {
        console.error("Error updating doctor profile:", error);
        return res.status(500).json({
          success: false,
          message: "Error updating doctor profile",
          error: error.message,
        });
      }

};


const update_appoint=async (req,res)=>{
    try {
        const appointmentId = req.params.id;
        const { timeSlot, status, isPaid } = req.body;

        const doctor = await doctor_profile.findOne({ user: req.user._id });
        if (!doctor) {
          return res.status(403).json({ success: false, message: "Doctor profile not found" });
        }

        const appointment = await appoint_model.findById(appointmentId);
        if (!appointment) {
          return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.doctor.toString() !== doctor._id.toString()) {
          return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own appointments" });
        }

        if (timeSlot) appointment.timeSlot = timeSlot;
        if (status) appointment.status = status;
        if (typeof isPaid !== "undefined") appointment.isPaid = Boolean(isPaid);

        await appointment.save();

        return res.status(200).json({
          success: true,
          message: "Appointment updated successfully",
          appointment,
        });
      } catch (error) {
        console.error("Error updating appointment:", error);
        return res.status(500).json({
          success: false,
          message: "Error updating appointment",
          error: error.message,
        });
      }

};



const createPrescription = async (req, res) => {
  try {
    const appointmentId  = req.params.id;
    const { medicines, instructions } = req.body;

    const doctor = await doctor_profile.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(403).json({ success: false, message: "Doctor profile not found" });
    }

    const appointment = await appoint_model.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only create prescription for your own appointment" });
    }

    await appoint_model.findByIdAndUpdate(
      appointmentId,
      { status: 'Completed' },
      { new: true }
    );

    const patientId = appointment.patient;
    if (!patientId) {
      return res.status(400).json({ success: false, message: "Appointment has no patient" });
    }

    const newPrescription = new patient_precription({
      appointment: appointmentId,
      doctor: doctor._id,
      patient: patientId,
      medicines,
      instructions
    });

    await newPrescription.save();

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: newPrescription
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating prescription",
      error: error.message
    });
  }
};



const upcoming_appointments=async (req,res)=>{
try{
  const doctor = await doctor_profile.findOne({ user: req.user._id });
  if (!doctor) {
    return res.status(403).json({ success: false, message: "Doctor profile not found" });
  }

  const appointments = await appoint_model
    .find({ doctor: doctor._id })
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .sort({ date: 1 })
    .lean();

  return res.status(200).json({ success: true, appointments });
}
catch(error){
  console.error("Error fetching doctor appointments:", error);
  return res.status(500).json({
    success: false,
    message: "Error fetching doctor appointments",
    error: error.message,
  });
}

};




module.exports={update_appoint,update_profile,createPrescription,upcoming_appointments,get_doctor};