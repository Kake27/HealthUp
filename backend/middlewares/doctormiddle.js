const jwt = require("jsonwebtoken");
const userlogin = require("../models/usermodel.js");

const requireDoctor = async (req, res, next) => {
  try {
    const rawToken = req.header("Authorization") || req.header("auth-token");
    const token = rawToken?.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "piyush");
    req.user = await userlogin.findById(decoded.id);

    if (!req.user || req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access Denied. Only doctors allowed." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = requireDoctor;
