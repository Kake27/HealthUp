
const appoint_patient=require("../models/appointmentmodel.js");
const doctor_profile=require("../models/doctormodel.js");


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
        }).populate("user", "name email").lean().select("specialization experience availableDays availableTime user");
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


module.exports={appointment,search,getallappointments,gateway,braintree,braintree_payment};