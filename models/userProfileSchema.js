const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  hashPassword: { type: String, required: true, default: "password" },
  enrolment: { type: Array },
});

const userProfile = mongoose.model("userProfile", userProfileSchema);

module.exports = userProfile;
