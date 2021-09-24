const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  enrolment: { Boolean },
});

const userProfile = mongoose.model("userProfile", userProfileSchema);

module.exports = userProfile;
