const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const userProfile = require("./models/userProfileSchema");
const workshopProfile = require("./models/workshopSchema");
const bcrypt = require("bcrypt");

require("dotenv").config();
const PORT = process.env.PORT;
const mongodbURI = process.env.MONGODBURI;
const salt = process.env.SECRET;

const store = new MongoDBStore({
  uri: mongodbURI,
  collection: "currentSessions",
});

app.use(express.json()); //to ensure that the data is in a JSON format
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET, //a random string do not copy this value or your stuff will get hacked
    resave: false, // default more info: https://www.npmjs.com/package/express-session#resave
    saveUninitialized: false, // default  more info: https://www.npmjs.com/package/express-session#resave
    store: store,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  })
);

mongoose.connect(mongodbURI, {
  useNewUrlParser: true,
});

// ******************************
//
// user login and auth
//
// ******************************

//generate hashPassword when user registers for a new account that includes a user password
//store the hashPassword in the user profile
app.get("/get-hash", async (req, res) => {
  // console.log("salt: ", salt);
  // res.send(salt);
  // const userPassword = req.body.password;
  const userPassword = "test_password";
  const password = userPassword + salt;
  console.log("password: ", password);
  // res.send(password);
  const hashPassword = await bcrypt.hash(password, 12);
  req.session.hashPassword = hashPassword;
  console.log("hashPassword: ", hashPassword);
  res.send(hashPassword);
});

//login
app.post("/login", async (req, res) => {
  //retrieve your username & email, check it exists and retrieve the hash
  //retrieve your salt
  //add salt to your password

  // const password = req.body.password;
  const userPassword = "test_password";
  const hash = "$2b$12$WOXnSELtdQJORJh2qquUuO9oiaaPFI5dHn2uTBuHg7lkrkDrOeXMC";

  const password = userPassword + salt;

  const valid = await bcrypt.compare(password, hash);

  if (valid) {
    req.session.auth = true;
    res.json({ status: "ok", msg: "you are logged in" });
  } else {
    req.session.auth = false;
    res
      .status(403)
      .json({ status: "unauthorised", msg: "you are not logged in" });
  }
});

// ******************************
//
// user profile collection
//
// ******************************
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

app.listen(PORT, () => {
  console.log("listening ... ");
});
