const express = require("express");
const router = express.Router();
const {appointment,search,getallappointments,gateway,braintree,braintree_payment,get_patient}=require('../controllers/patientcontroller.js');
const patient_middleware=require("../middlewares/patientmiddle.js");
//for appointemnt booking by patient 
router.post("/book-appointment/:pid/:did",appointment);


//for searching of doctor by diseases name 
router.post("/search/:keyword",patient_middleware,search);

//for getting info of all appointments that is booked by that particular patient
router.post("/all-appointment",patient_middleware,getallappointments);
router.get("/getpatient",patient_middleware,get_patient);

module.exports=router;