
const appoint_model=require("../models/appointmentmodel.js");
const doctor_profile=require("../models/doctormodel.js");
const patient_precription=require("../models/prescriptionmodel.js");


const update_profile=async(req,res)=>{
    try {
        // Extract fields from req.body
        const { specialization, experience, availableDays, availableTime, consultationFee } = req.body;
        const Id = req.params.id;
        // Build an update object
        let updateFields = {};
        if (specialization) updateFields.specialization = specialization;
        if (experience) updateFields.experience = experience;
        if (availableDays) updateFields.availableDays = availableDays;
        if (availableTime) updateFields.availableTime = availableTime;
        if (consultationFee) updateFields.consultationFee = consultationFee;
    
        // If a photo file is uploaded, update the photo field
        if (req.file) {
          updateFields.photo = {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          };
        }
    
        // Find and update the doctor profile that belongs to the logged-in doctor
        const updatedDoctor = await doctor_profile.findOneAndUpdate(
          { user: Id },
          { $set: updateFields },
          { new: true }
        );
    
        if (!updatedDoctor) {
          return res.status(404).json({
            success: false,
            message: "Doctor profile not found",
          });
        }
    
        res.status(200).json({
          success: true,
          message: "Doctor profile updated successfully",
          doctor: updatedDoctor,
        });
      } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({
          success: false,
          message: "Error updating doctor profile",
          error: error.message,
        });
      }

};


const update_appoint=async (req,res)=>{
    try {
        const appointmentId = req.params.id; // The appointment to update
        const { timeSlot, status, isPaid } = req.body; // Fields doctor is allowed to update
    
        // Find the appointment by ID
        const appointment = await appoint_model.findById(appointmentId);
        if (!appointment) {
          return res.status(404).json({ success: false, message: "Appointment not found" });
        }
    
        // Verify that the logged-in doctor is assigned to this appointment.
        // req.user should be set by the requireDoctor middleware.
        if (appointment.doctor.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own appointments" });
        }
    
        // Update allowed fields if provided in the request body
        if (timeSlot) appointment.timeSlot = timeSlot;
        if (status) appointment.status = status;
        if (typeof isPaid !== "undefined") {
          appointment.paymentStatus = isPaid ? "Paid" : "Unpaid";
        }
    
        // Save the updated appointment
        await appointment.save();
    
        res.status(200).json({
          success: true,
          message: "Appointment updated successfully",
          appointment,
        });
      } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({
          success: false,
          message: "Error updating appointment",
          error: error.message,
        });
      }

};

const prescription=async (req,res)=>{
  try {
    const appointmentId = req.params.id;
    const { medicines, notes } = req.body;
    
    // Create a new prescription entry
    const newPrescription = new patient_precription({
      appointment: appointmentId,
      doctor: req.user._id,
      medicines,
      notes,
    });
    
    await newPrescription.save();
    
    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: newPrescription,
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    res.status(500).json({ success: false, message: "Error creating prescription", error: error.message });
  }


};


const upcoming_appointments=async (req,res)=>{
try{
  const appointments = await appoint_model.find({ doctor: req.user._id })
  .populate({
    path: "patient",
    select: "age gender medicalHistory", 
    populate: {
      path: "user",
      select: "name"         
    }}).select("date timeSlot fee status isPaid symptoms") 
  .sort({ date: -1 }); 

res.status(200).json({ success: true, appointments });

}
catch(error){
  console.error("Error fetching doctor appointments:", error);
  res.status(500).json({
    success: false,
    message: "Error fetching doctor appointments",
    error: error.message,
  });
}

};




module.exports={update_appoint,update_profile,prescription,upcoming_appointments};