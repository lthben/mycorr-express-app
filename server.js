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

//user profile collection
//show everything
app.get("/userindex", async (req, res) => {
  const findUserProfile = await userProfile.find();
  res.json(findUserProfile);
});
//create new userID
app.post("/usernew", async (req, res) => {
  try {
    newUser = new userProfile({
      name: req.body.name,
      email: req.body.email,
      enrolment: req.body.enrolment,
    });
    let response = await newUser.save();
    console.log("created: ", response);
    res.send(response);
    // res.redirect("/");
    //   res.json({ status: "ok,", msg: "saved" });
  } catch (err) {
    console.log(err);
  }
});

//seed some users
const user_seed = require("./models/user_seed");
app.post("/userseed", async (req, res) => {
  await userProfile.deleteMany({});
  await userProfile.create(user_seed, (err, data) => {
    if (err) console.log(err);
    else {
      res.json({ status: "ok", msg: "seeded" });
      console.log("seeded: ", data);
    }
  });
});

//delete by ID
app.delete("/userdelete/:id", async (req, res) => {
  try {
    let response = await userProfile.findByIdAndDelete(req.params.id);
    //   res.json({ status: "ok", msg: "deleted" });
    console.log("deleting one by id: ", response);
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});
//update by ID
app.put("/userupdate/:id", async (req, res) => {
  try {
    let response = await userProfile.findByIdAndUpdate(req.params.id, req.body);
    console.log("user update by ID: ", response);
    //   res.json({ status: "ok", msg: "updated" });
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});
// ***************************
//
//  workshop collection
//
// ***************************

//show all workshop profiles
app.get("/wsindex", async (req, res) => {
  const findworkshopProfile = await workshopProfile.find();
  res.json(findworkshopProfile);
});

//create new workshop profile
app.post("/wsnew", async (req, res) => {
  newWorkshop = new workshopProfile({
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    vacancies: req.body.vacancies,
    dateStart: req.body.dateStart,
    courseStartTime: req.body.courseStartTime,
    courseEndTime: req.body.courseEndTime,
    location: req.body.location,
    participantList: req.body.participantList,
  });
  let response = await newWorkshop.save();
  // res.redirect("/user");
  res.json({ status: "ok,", msg: "saved" });
  console.log("Created: ", response);
});

//seed some workshops
const ws_seed = require("./models/ws_seed");
app.post("/wsseed", async (req, res) => {
  await workshopProfile.deleteMany({});
  await workshopProfile.create(ws_seed, (err, data) => {
    if (err) console.log(err);
    else {
      res.json({ status: "ok", msg: "seeded" });
      console.log("seeded: ", data);
    }
  });
});

//delete by ID
app.delete("/wsdelete/:id", async (req, res) => {
  try {
    let response = await workshopProfile.findByIdAndDelete(req.params.id);
    //   res.json({ status: "ok", msg: "deleted" });
    console.log("deleting one by id: ", response);
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

//update by ID
app.put("/wsupdate/:id", async (req, res) => {
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

app.listen(5000, () => {
  console.log("listening at port 5000");
});
