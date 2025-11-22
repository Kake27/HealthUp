const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const authRoutes = require("./routes/userRoutes.js");
const patientroutes=require("./routes/patientRoutes.js");
const doctorroutes=require("./routes/doctorRoutes.js");
const paymentRoutes = require('./routes/paymentroutes.js');
const helmet = require('helmet');
const Trie = require("./trie.js");
const fuzzySearch = require("./fuzzysearch.js");
const medicines = require('./medicines.json');
// // after loading medicines
// const trie = new Trie();
// // insert medicines robustly
// function normalizeName(name) {
//   if (typeof name !== "string") return "";
//   return name.trim().toLowerCase().replace(/[^a-z0-9 ]+/g, "");
// }

// medicines.forEach((m) => {
//   const raw = (typeof m === "string") ? m : (m && (m.name || m.title || m.label));
//   const nm = normalizeName(raw || "");
//   if (nm) trie.insert(nm);
// });


const trie = new Trie();

function normalizeName(name) {
  if (typeof name !== "string") return "";
  return name.trim().toLowerCase().replace(/[^a-z0-9 ]+/g, "");
}

medicines.forEach((m) => {
  const raw = typeof m === "string" ? m : (m && (m.name || m.title || m.label));
  const nm = normalizeName(raw || "");
  if (nm) trie.insert(nm, m.price); // 💰 directly store price
});


console.log("Trie built. root children:", Object.keys(trie.root.children).length, "medicines total:", medicines.length);


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


//Local Host URL
const MONGO_URI="mongodb://localhost:27017";

// Code to connect our backend to database
mongoose.connect(MONGO_URI, {
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "Backend is working!" });
  });
  
// app.get("/api/medicines/:key", (req, res) => {
//   const name = (req.params.key || "").toLowerCase().trim();
// //  console.log(name, "kya naam hai medicine ka");

//   function normalize(str) {
//     return str.toLowerCase().replace(/[^a-z]/g, '');
//   }

//   for (let i = 0; i < medicines.length; i++) {
//    // console.log(medicines[i].name, "ffffffffffff");

//     if (normalize(medicines[i].name) === normalize(name)) {
//       return res.json({ price: medicines[i].price });
//     }
//   }

//   res.json({ price: 50 }); // fallback price
// });

app.get("/api/medicines/:key", (req, res) => {
  const name = (req.params.key || "").toLowerCase().trim();
  const price = trie.find(name);

  if (price !== null) {
    return res.json({ price: price});
  }

  // fallback if not found
  res.json({ price: 50 });
});





app.get("/api/medicines/search/:q", (req, res) => {
  const q = (req.params.q || "").trim();
  console.log("Search query:", q);
  if (!q) return res.json([]);

  const suggestions = fuzzySearch(trie, q, 4, 10);
  console.log("Suggestions:", suggestions);
  res.json(suggestions);
});


app.use("/api/healthcare/auth", authRoutes);
app.use("/api/healthcare/patient",patientroutes);
app.use("/api/healthcare/doctor",doctorroutes);
app.use('/api/payment', paymentRoutes);
// To run a server we have to specify a PORT 
const PORT=9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));