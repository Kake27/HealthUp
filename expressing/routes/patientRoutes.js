const express = require("express");
const router = express.Router();
const {appointment,search,getallappointments,gateway,braintree,braintree_payment}=require('../controllers/patientcontroller.js');
const patient_middleware=require("../middlewares/patientmiddle.js");
//for appointemnt booking by patient 
router.post("/book-appointment/:pid/:did",patient_middleware,appointment);


//for searching of doctor by diseases name 
router.post("/search/:keyword",patient_middleware,search);

//for getting info of all appointments that is booked by that particular patient
router.post("/all-appointment",patient_middleware,getallappointments)


module.exports=router;