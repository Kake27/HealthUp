
const appoint_patient=require("../models/appointmentmodel.js");
const doctor_profile=require("../models/doctormodel.js");
const patient_profile=require("../models/patientmodel.js")
const User=require("../models/usermodel.js")
const jwt = require('jsonwebtoken');
require("dotenv").config();



async function get_patient(req, res) {
  try {

console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);

    const token = req.body.token ||
      req.headers['auth-token'] ||
      req.headers['authorization']?.split(' ')[1];
    console.log(token,"token");
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }else{
      console.log(token);
    }

    // 1. Verify JWT
    let payload;
    try {
      payload =  jwt.verify(token, "piyush");
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // 2. Make sure the user has role 'doctor'
    const user = await User.findById(payload.id).select('role');
    if (!user || user.role !== 'patient') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // 3. Fetch the full Doctor profile linked to that user
    const patient = await patient_profile.findOne({ user: payload.id })
      .populate('user', '-password -__v') // pull in user info except password
      .lean();

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // 4. Return every field
    return res.status(200).json({ success: true, patient });
  } catch (e) {
    console.error('get_patient Error:', e);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

















const appointment = async (req, res) => {
  try {
    // Extract patient and doctor IDs from req.params
    const { pid, did } = req.params
    // Extract appointment details from req.body
    const { date, symptoms } = req.body;

    // Create a new appointment with initial fields filled by the patient
    const newAppointment = new appoint_patient({
      doctor:did,
      patient:pid,
      date,
      symptoms,
      fee: 500,
      status: "Pending",  // Initially set as pending
      isPaid: false  
    });

    // Save the appointment instance in the database
    await newAppointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppointment
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error booking appointment",
      error: error.message
    });
  }
};



const search=async (req,res)=>{
    try {
        const { keyword } = req.params;
        // Search in specialization and optionally treatableDiseases if defined
        const results = await doctor_profile.find({
          $or: [
            { specialization: { $regex: keyword, $options: "i" } },
            { name: { $regex: keyword, $options: "i" } },
          ],
        }).populate("user", "name email").lean().select("specialization experience availableDays availableTime user photo");
    console.log(results);
        res.json(results);
      } catch (error) {
        console.log(error);
        res.status(400).send({
          success: false,
          message: "Error In Search Doctor API",
          error: error.message,
        });
      }
}


const getallappointments=async (req,res)=>{
try{
  const appointments = await appoint_patient.find({ patient: req.user._id })
  .populate({
     path:"doctor",
     select:"specialization", 
    populate: {
      path: "user",
      select: "name"         
    }
  }
  )
  .lean().select("date timeSlot fee status isPaid symptoms doctor")
  .sort({ date: -1 });

console.log(appointments);
res.status(200).json({ success: true, appointments });
}
catch(error){
  console.error("Error fetching patient appointments:", error);
  res.status(500).json({
    success: false,
    message: "Error fetching patient appointments",
    error: error.message,
  });

}

};



const gateway=(req,res)=>{


}



const braintree=(req,res)=>{



}



const braintree_payment=(req,res)=>{



}


module.exports={appointment,search,getallappointments,gateway,braintree,braintree_payment,get_patient};