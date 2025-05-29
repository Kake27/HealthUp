const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const authRoutes = require("./routes/userRoutes.js");
const patientroutes=require("./routes/patientRoutes.js");
const doctorroutes=require("./routes/doctorRoutes.js");

app.use(express.json());
app.use(cors());

//Local Host URL
const MONGO_URI="mongodb://localhost:27017";

// Code to connect our backend to database
mongoose.connect(MONGO_URI, {
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "Backend is working!" });
  });
  

app.use("/api/healthcare/auth", authRoutes);
app.use("/api/healthcare/patient",patientroutes);
app.use("/api/healthcare/doctor",doctorroutes);

// To run a server we have to specify a PORT 
const PORT=9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));