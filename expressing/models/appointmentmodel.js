const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String },
    fee: { type: Number, default: 500 },
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled", "Completed"], default: "Pending" },
    isPaid: { type: Boolean, default: false }, // Payment status
    symptoms: { type: String } // Optional, if you want to record reason for the visit
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);
module.exports = Appointment;
