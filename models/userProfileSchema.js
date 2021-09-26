const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, default: "" },
    lastName: { type: String, required: true, default: "" },
    email: { type: String, required: true, default: "" },
    hashPassword: { type: String, required: true, default: "password" },
    enrolment: { type: Array, required: true, default: [] },
  },
  { timestamps: true }
);

const userProfile = mongoose.model("userProfile", userProfileSchema);

module.exports = userProfile;
