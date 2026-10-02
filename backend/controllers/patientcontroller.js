
const appoint_patient=require("../models/appointmentmodel.js");
const doctor_profile=require("../models/doctormodel.js");
const patient_profile=require("../models/patientmodel.js");
const prescription=require("../models/prescriptionmodel.js");
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









function parseTime12to24(twelveHour) {
  const [time, meridian] = twelveHour.split(" ");
  let [hh, mm] = time.split(":").map(Number);
  if (meridian.toUpperCase() === "PM" && hh < 12) hh += 12;
  if (meridian.toUpperCase() === "AM" && hh === 12) hh = 0;
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}


function generateSlots(start, end, duration) {
  const slots = [];
  let [sh, sm] = start.split(":").map(Number);
  let [eh, em] = end.split(":").map(Number);

  const cur = new Date(0, 0, 0, sh, sm);
  const endTime = new Date(0, 0, 0, eh, em);

  while (cur < endTime) {
    const hh = cur.getHours().toString().padStart(2, "0");
    const mm = cur.getMinutes().toString().padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    cur.setMinutes(cur.getMinutes() + duration);
  }
  return slots;
}

const appointment = async (req, res) => {
  try {
    const { pid, did } = req.params;
    const { date: dateString, symptoms } = req.body;

    const date = new Date(dateString);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    // 1️⃣ Fetch Doctor
    const doctor = await doctor_profile.findOne({ user: did });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!Array.isArray(doctor.availableDays) || doctor.availableDays.length === 0) {
      return res.status(400).json({ success: false, message: "Doctor has no availability configured" });
    }

    if (!doctor.availableDays.includes(dayName)) {
      return res.status(400).json({ success: false, message: `Doctor not available on ${dayName}.` });
    }

    // 2️⃣ Generate slots
    const [rawStart, rawEnd] = doctor.availableTime.split("-").map((s) => s.trim());
    const start24 = parseTime12to24(rawStart);
    const end24 = parseTime12to24(rawEnd);
    const slotDuration = 15;

    const allSlots = generateSlots(start24, end24, slotDuration);

    // 3️⃣ Get booked slots for that day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedAppts = await appoint_patient.find({
      doctor: did,
      date: { $gte: dayStart, $lt: dayEnd }
    }).select("timeSlot -_id");

    const bookedSlots = bookedAppts.map(a => a.timeSlot);
    const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

    // 4️⃣ No available slot → Suggest next available date
    if (availableSlots.length === 0) {
      const week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let nextDate = new Date(dayStart);

      for (let i = 1; i <= 7; i++) {
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDay = week[nextDate.getDay()];

        if (doctor.availableDays.includes(nextDay)) {
          const nextDayStart = new Date(nextDate);
          nextDayStart.setHours(0, 0, 0, 0);

          const nextDayEnd = new Date(nextDate);
          nextDayEnd.setHours(23, 59, 59, 999);

          const bookedNext = await appoint_patient.find({
            doctor: did,
            date: { $gte: nextDayStart, $lt: nextDayEnd }
          }).select("timeSlot -_id");

          const bookedNextSlots = bookedNext.map(a => a.timeSlot);

          const nextDaySlots = generateSlots(start24, end24, slotDuration);
          const freeNextDaySlots = nextDaySlots.filter(s => !bookedNextSlots.includes(s));

          if (freeNextDaySlots.length > 0) {
            return res.status(400).json({
              success: false,
              message: `No slots on ${dayName}. Next available: ${nextDay}, ${nextDate.toLocaleDateString()} at ${freeNextDaySlots[0]}`
            });
          }
        }
      }

      return res.status(400).json({
        success: false,
        message: "No available slots in the next 7 days."
      });
    }

    // SAFE SLOT ASSIGNMENT — FIRST FREE SLOT
    const assignedSlot = availableSlots[0];

    //  ATOMIC CREATE (with race-condition handling)
    let newAppt;
    try {
      newAppt = await appoint_patient.create({
        doctor: did,
        patient: pid,
        date,
        timeSlot: assignedSlot,
        fee: doctor.consultationFee,
        status: "Pending",
        isPaid: false,
        symptoms
      });

    } catch (err) {
      // If two people try to book same slot → unique index protects us
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Slot already booked by someone else. Please select another slot."
        });
      }

      throw err;
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppt
    });

  } catch (error) {
    console.error("Error booking appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Error booking appointment",
      error: error.message
    });
  }
};



const search=async (req,res)=>{
    try {
        const { keyword } = req.params;
      
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


const getallappointments = async (req, res) => {
  try {

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


    // Get today's date at midnight (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
console.log(req);
    const appointments = await appoint_patient
      .find({
        patient: payload.id,
        status: { $ne: "True" }, // status not "Completed"
        date: { $gte: today } // today or future
      })
      .populate({
        path: "doctor",
        select: "specialization",
        populate: {
          path: "user",
          select: "name"
        }
      })
      .select("date timeSlot fee status isPaid symptoms doctor")
      .sort({ date: 1 }) // soonest first
      .lean();

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patient appointments",
      error: error.message,
    });
  }
};


const patient_prescription = async (req, res) => {
  try {
    // Get token from body or headers
    const token =
      req.body.token ||
      req.headers["auth-token"] ||
      req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, error: "Token not provided" });
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, "piyush"); // Replace "piyush" with your secret
    } catch (e) {
      return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }

    const patientId = decoded.id || decoded._id; // Check what you stored in token

    // Now use patientId to fetch prescriptions
    const patient_pres = await prescription.find({ patient: patientId });

    console.log(patient_pres);
    res.status(200).json({ success: true, patient_pres });
  } catch (error) {
    console.error("Error fetching patient prescription:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patient prescription",
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


module.exports={appointment,search,getallappointments,gateway,braintree,braintree_payment,get_patient,patient_prescription};