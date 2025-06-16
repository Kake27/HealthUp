// helper/authhelper.js
const bcrypt = require("bcryptjs");

// Hash a plain‐text password with 10 salt rounds
const hashing = async (password, saltRounds = 10) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (e) {
    console.error("Hashing Error:", e);
    throw e;
  }
};

// Compare a plain text password with a hash
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (e) {
    console.error("Compare Password Error:", e);
    throw e;
  }
};

module.exports = { hashing, comparePassword };
