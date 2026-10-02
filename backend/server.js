require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const authRoutes = require("./routes/userRoutes.js");
const patientroutes=require("./routes/patientRoutes.js");
const doctorroutes=require("./routes/doctorRoutes.js");
const paymentRoutes = require('./routes/paymentroutes.js');
const helmet = require('helmet');
const Medicine = require("./models/medicineModel.js");
const seedMedicines = require("./seedMedicines.js");

const medicineSearchIndex = process.env.ATLAS_SEARCH_INDEX || "medicines-search";

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          '*.braintreegateway.com',
          '*.braintree-api.com',
        ],
        connectSrc: [
          "'self'",
          '*.braintreegateway.com',
          '*.braintree-api.com'
        ],
        frameSrc: [
          'https://assets.braintreegateway.com',
          '*.braintreegateway.com'
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    }
  })
);






app.use(express.json());
app.use(cors());


const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await seedMedicines();
  })
  .catch((err) => console.log(err));

app.get('/api/test', (req, res) => {
  res.status(200).json({ message: "Backend is working!" });
});

app.get("/api/medicines/:key", async (req, res) => {
  const key = (req.params.key || "").trim();
  if (!key) return res.json({ price: 50 });

  try {
    const medicine = await Medicine.findOne({
      name: new RegExp(`^${escapeRegex(key)}$`, "i"),
    }).lean();

    if (medicine) {
      return res.json({ price: medicine.price });
    }

    return res.json({ price: 50 });
  } catch (error) {
    console.error("Exact medicine lookup error:", error);
    return res.status(500).json({ error: "Medicine lookup failed" });
  }
});

app.get("/api/medicines/search/:q", async (req, res) => {
  const q = (req.params.q || "").trim();
  if (!q) return res.json([]);

  try {
    const atlasSearchResults = await Medicine.aggregate([
      {
        $search: {
          index: medicineSearchIndex,
          text: {
            query: q,
            path: "name",
            fuzzy: {
              maxEdits: 2,
              prefixLength: 1,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          score: { $meta: "searchScore" },
        },
      },
      { $limit: 10 },
    ]);

    if (atlasSearchResults.length) {
      return res.json(
        atlasSearchResults.map((item) => ({
          name: item.name,
          price: item.price,
          score: item.score,
        }))
      );
    }
  } catch (searchError) {
    console.warn("Atlas Search is not available for this Mongo deployment.", searchError.message);
  }

  try {
    const fallbackResults = await Medicine.find({
      name: { $regex: escapeRegex(q), $options: "i" },
    })
      .limit(10)
      .lean();

    return res.json(fallbackResults);
  } catch (error) {
    console.error("Medicine search fallback error:", error);
    return res.status(500).json({ error: "Medicine search failed" });
  }
});


app.use("/api/healthcare/auth", authRoutes);
app.use("/api/healthcare/patient",patientroutes);
app.use("/api/healthcare/doctor",doctorroutes);
app.use('/api/payment', paymentRoutes);
const PORT = Number(process.env.PORT || 9000);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));