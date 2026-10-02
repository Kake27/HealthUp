const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    //Links this doctor to a User model (common in authentication).
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    availableDays: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }],
    availableTime: { type: String },
    photo: { data: Buffer, contentType: String }, // Store image data directly in MongoDB
    consultationFee: { type: Number, required: true },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", DoctorSchema);
module.exports = Doctor;
