const bcrypt = require("bcryptjs"); // Use bcryptjs instead of bcrypt

const hashing = async (password) => {
  try {
    const saltRounds = 10; // Corrected variable name
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (e) {
    console.error("Hashing Error:", e);
    throw e;
  }
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = { hashing, comparePassword };
