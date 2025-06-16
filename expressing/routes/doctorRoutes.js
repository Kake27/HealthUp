const express = require("express");
const router = express.Router();
          
const {update_appoint,update_profile,upcoming_appointments,prescription}=require("../controllers/doctorcontroller.js");
const doctmiddleware=require("../middlewares/doctormiddle.js");

router.post("/update-appointment/:id",doctmiddleware,update_appoint);
router.post("/update-profile",doctmiddleware,update_profile);
router.post("/prescription/:id",doctmiddleware,prescription);

router.get("/doctor-appointment",doctmiddleware,upcoming_appointments)

module.exports=router;