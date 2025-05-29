
// This schema is specially for a login 
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["doctor", "patient"], required: true }, // Differentiates doctors & patients
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  //timestamps: true automatically adds createdAt and updatedAt fields to track when a user is created or updated.
  { timestamps: true }
);
// A model is a wrapper around the schema that allows you to interact with the MongoDB collection. It lets you create, read, update, and delete (CRUD) documents.
const User = mongoose.model("User", UserSchema);
module.exports = User;
