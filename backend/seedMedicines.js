const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Medicine = require("./models/medicineModel");

async function seedMedicines() {
  const jsonPath = path.join(__dirname, "medicines.json");
  const medicines = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const total = await Medicine.countDocuments();
  if (total > 0) {
    console.log(`Medicine collection already contains ${total} records. Skipping seed.`);
    return;
  }

  const normalized = medicines
    .map((item) => {
      const name = typeof item === "string" ? item : item?.name || item?.title || item?.label;
      if (!name) return null;

      return {
        name: String(name).trim(),
        price: Number(item?.price || 0),
      };
    })
    .filter(Boolean);

  if (!normalized.length) {
    console.log("No medicine records found in medicines.json.");
    return;
  }

  await Medicine.insertMany(normalized, { ordered: false });
  console.log(`Seeded ${normalized.length} medicines into MongoDB.`);
}

if (require.main === module) {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log("MongoDB Connected");
      await seedMedicines();
      process.exit(0);
    })
    .catch((err) => {
      console.error("MongoDB seed failed:", err);
      process.exit(1);
    });
}

module.exports = seedMedicines;
