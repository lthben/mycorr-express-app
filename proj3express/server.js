const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userProfile = require("./models/userProfileSchema");
const workshopProfile = require("./models/workshopSchema");
const cors = require("cors");

app.use(express.json()); //to ensure that the data is in a JSON format
app.use(cors());
app.use(express.urlencoded({ extended: false }));

mongoose.connect("mongodb://localhost:27017/mycorr", {
  useNewUrlParser: true,
});
// mongoose.connection.once("open", () => {
//   console.log("connected to mongo");
// });

//show everything
app.get("/user", async (req, res) => {
  const findUserProfile = await userProfile.find();
  res.json(findUserProfile);
  //   res.send("hello");
});
//create new userID
app.post("/usernew", async (req, res) => {
  newUser = new userProfile({
    name: req.body.name,
    email: req.body.email,
    enrolment: req.body.enrolment,
  });
  await newUser.save();
  res.redirect("/");
  //   res.json({ status: "ok,", msg: "saved" });
});
//delete by ID
app.delete("/:id", async (req, res) => {
  try {
    let response = await userProfile.findByIdAndDelete(req.params.id);
    //   res.json({ status: "ok", msg: "deleted" });
    // console.log("deleting one by id: ", response);
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});
//update by ID
app.put("/:id", async (req, res) => {
  try {
    let response = await userProfile.findByIdAndUpdate(req.params.id, req.body);
    console.log(response);
    //   res.json({ status: "ok", msg: "updated" });
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////

//workshop database collection
//show everything
app.get("/wsuser", async (req, res) => {
  const findworkshopProfile = await workshopProfile.find();
  res.json(findworkshopProfile);
  //   res.send("hello");
});
//create new userID
app.post("/wsusernew", async (req, res) => {
  newWorkshop = new workshopProfile({
    category: req.body.category,
    title: req.body.title,
    vacancies: req.body.vacancies,
    dateStart: req.body.dateStart,
    courseStartTime: req.body.courseStartTime,
    courseEndTime: req.body.courseEndTime,
    location: req.body.location,
    participantList: req.body.participantList,
  });
  await newWorkshop.save();
  res.redirect("/user");
  //   res.json({ status: "ok,", msg: "saved" });
});
//delete by ID
app.delete("/ws/:id", async (req, res) => {
  try {
    let response = await workshopProfile.findByIdAndDelete(req.params.id);
    //   res.json({ status: "ok", msg: "deleted" });
    // console.log("deleting one by id: ", response);
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});
//update by ID
app.put("/ws/:id", async (req, res) => {
  try {
    let response = await workshopProfile.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    console.log(response);
    //   res.json({ status: "ok", msg: "updated" });
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

// app.delete("/all/:id", async (req, res) => {
//   await ToDo.findByIdAndDelete(req.params.id, {
//     useFindAndModify: false,
//   });

//   res.send("Deleted");
// });

// app.get("/all", (req, res) => {
//   res.send("all");
// });

app.listen(7000, () => {
  console.log("listening");
});
