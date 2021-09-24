const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  vacancies: { type: Number, required: true },
  dateStart: { type: String, required: true },
  courseStartTime: { type: Number },
  courseEndTime: { type: Number },
  location: { type: String, required: true },
  participantList: { type: String, required: true },
});

const workshopProfile = mongoose.model("workshopProfile", workshopSchema);

module.exports = workshopProfile;
