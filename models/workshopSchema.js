const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    vacancies: { type: Number, required: true },
    dateStart: { type: String, required: true },
    courseStartTime: { type: String },
    courseEndTime: { type: String },
    location: { type: String, required: true },
    participantList: { type: Array, required: true },
  },
  { timestamps: true }
);

const workshopProfile = mongoose.model("workshopProfile", workshopSchema);

module.exports = workshopProfile;
