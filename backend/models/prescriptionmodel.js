const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // Example: "1 tablet twice a day"
        duration: { type: String, required: true }, // Example: "5 days"
      },
    ],
    instructions: { type: String }, // Any additional instructions
  },
  { timestamps: true }
);

const Prescription = mongoose.model("Prescription", PrescriptionSchema);
module.exports = Prescription;
