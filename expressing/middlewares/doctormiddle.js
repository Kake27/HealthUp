const jwt = require("jsonwebtoken");
const userlogin = require("../models/usermodel.js");

const requireDoctor = async (req, res, next) => {
  try {
    const token = req.header("Authorization") || req.header("auth-token");
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const decoded = jwt.verify(token, "piyush");
    req.user = await userlogin.findById(decoded.id);
    console.log(req.user.role,"dekhta hain");

    if (!req.user || req.user.role !== "doctor") {
      console.log("fff");
      return res.status(403).json({ message: "Access Denied. Only doctors allowed." });
    }
        next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = requireDoctor;
