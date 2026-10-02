
const appoint_patient=require("../models/appointmentmodel.js");
const doctor_profile=require("../models/doctormodel.js");
const patient_profile=require("../models/patientmodel.js");
const prescription=require("../models/prescriptionmodel.js");
const User=require("../models/usermodel.js")
const jwt = require('jsonwebtoken');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "piyush";

function getTokenFromRequest(req) {
  const headerToken = req.body?.token || req.headers["auth-token"] || req.headers["authorization"];
  if (!headerToken) return null;
  return headerToken.startsWith("Bearer ") ? headerToken.slice(7) : headerToken;
}



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

    const doctor = (await doctor_profile.findOne({ user: did })) || (await doctor_profile.findById(did));
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const patientDoc = (await patient_profile.findOne({ user: pid })) || (await patient_profile.findById(pid));
    if (!patientDoc) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const doctorId = doctor._id;
    const patientId = patientDoc._id;
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    if (!Array.isArray(doctor.availableDays) || doctor.availableDays.length === 0) {
      return res.status(400).json({ success: false, message: "Doctor has no availability configured" });
    }

    if (!doctor.availableDays.includes(dayName)) {
      return res.status(400).json({ success: false, message: `Doctor not available on ${dayName}.` });
    }

    if (!doctor.availableTime || !doctor.availableTime.includes("-")) {
      return res.status(400).json({ success: false, message: "Doctor availability time is not configured properly." });
    }

    const [rawStart, rawEnd] = doctor.availableTime.split("-").map((s) => s.trim());
    const start24 = parseTime12to24(rawStart);
    const end24 = parseTime12to24(rawEnd);
    const slotDuration = 15;

    const allSlots = generateSlots(start24, end24, slotDuration);

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedAppts = await appoint_patient.find({
      doctor: doctorId,
      date: { $gte: dayStart, $lt: dayEnd }
    }).select("timeSlot -_id");

    const bookedSlots = bookedAppts.map(a => a.timeSlot);
    const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

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
            doctor: doctorId,
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

    const assignedSlot = availableSlots[0];

    try {
      const newAppt = await appoint_patient.create({
        doctor: doctorId,
        patient: patientId,
        date,
        timeSlot: assignedSlot,
        fee: doctor.consultationFee,
        status: "Pending",
        isPaid: false,
        symptoms
      });

      return res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        appointment: newAppt
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Slot already booked by someone else. Please select another slot."
        });
      }

      throw err;
    }
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
        const matchingUsers = await User.find({
          name: { $regex: keyword, $options: "i" },
        }).select("_id");

        const results = await doctor_profile.find({
          $or: [
            { specialization: { $regex: keyword, $options: "i" } },
            { user: { $in: matchingUsers.map(user => user._id) } },
          ],
        }).populate("user", "name email").lean().select("specialization experience availableDays availableTime user photo");

        return res.json(results);
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          success: false,
          message: "Error In Search Doctor API",
          error: error.message,
        });
      }
}


const getallappointments = async (req, res) => {
  try {
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

    const patientDoc = await patient_profile.findOne({ user: payload.id });
    if (!patientDoc) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await appoint_patient
      .find({
        patient: patientDoc._id,
        status: { $ne: "Completed" },
        date: { $gte: today }
      })
      .populate({
        path: "doctor",
        select: "specialization consultationFee",
        populate: {
          path: "user",
          select: "name"
        }
      })
      .select("date timeSlot fee status isPaid symptoms doctor")
      .sort({ date: 1 })
      .lean();

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching patient appointments",
      error: error.message,
    });
  }
};


const patient_prescription = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ success: false, error: "Token not provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }

    const patientDoc = await patient_profile.findOne({ user: decoded.id });
    if (!patientDoc) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    const patient_pres = await prescription
      .find({ patient: patientDoc._id })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .lean();

    return res.status(200).json({ success: true, patient_pres });
  } catch (error) {
    console.error("Error fetching patient prescription:", error);
    return res.status(500).json({
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