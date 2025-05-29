const jwt = require("jsonwebtoken");
const userlogin = require("../models/usermodel");

const requirePatient = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const decoded = jwt.verify(token, "your_secret_key");
    req.user = await userlogin.findById(decoded.id);

    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({ message: "Access Denied. Only patients allowed." });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = requirePatient;
