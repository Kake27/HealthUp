const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text" }, { default_language: "english" });
medicineSchema.index({ name: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);
