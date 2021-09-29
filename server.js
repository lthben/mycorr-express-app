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

app.use(cors());
app.use(express.json()); //to ensure that the data is in a JSON format
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

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    console.log("DB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB(mongodbURI);

app.all("/", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// ******************************
//
// user login and auth
//
// ******************************

//generate hashPassword when user registers for a new account that includes a user password
//store the hashPassword in the user profile
app.post("/get-hash", async (req, res) => {
  // console.log("salt: ", salt);
  // res.send(salt);
  const userPassword = req.body.password;
  console.log("userPassword: ", userPassword);
  // const userPassword = "test_password";
  const password = userPassword + salt;
  console.log("password: ", password);
  // res.send(password);
  const hashPassword = await bcrypt.hash(password, 12);
  console.log("hashPassword: ", hashPassword);
  res.json({ status: "ok", msg: hashPassword });
});

//login
app.post("/login", async (req, res) => {
  //retrieve your email & user password, check email exists and if yes, then retrieve the hash from the user profile
  //retrieve your salt
  //add salt to the user password
  //compare userPassword + salt to the stored hash

  const email = req.body.email;

  let hash = "";
  let valid = false;
  const user = await userProfile.findOne({ email: email });
  let userInfo = {};
  if (user) {
    hash = user.hashPassword;
    userInfo = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      enrolment: user.enrolment,
    };
    console.log("user found: ", user);
  } else {
    console.log("user does not exist");
    res.status(404).json({
      status: "user not found",
      msg: "User not found. Please try again.",
    });
    return;
  }

  let password = req.body.password;
  password = password + salt;

  valid = await bcrypt.compare(password, hash);

  if (valid) {
    req.session.auth = true;
    res.json({ status: "ok", msg: "you are logged in", userInfo: userInfo });
    console.log("yes you're logged in");
  } else {
    req.session.auth = false;
    res.status(403).json({
      status: "unauthorised",
      msg: "Wrong password. Please try again.",
    });
    console.log("unauthorised, you are not logged in");
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

//get a single user by Id
app.get("/user/:id", async (req, res) => {
  const user = await userProfile.findById(req.params.id);
  res.json(user);
  console.log("user found: ", user);
});

//Register a user for a workshop and update the user enrolment and workshop participant list. Checks for duplicate signups.
app.put("/iwan", async (req, res) => {
  const userId = req.body.userId;
  const workshopId = req.body.workshopId;
  // console.log("userId: ", userId);
  // console.log("workshopId: ", workshopId);
  const user = await userProfile.findById(userId);
  let _enrolment = user.enrolment;
  // console.log("_enrolment: ", _enrolment);
  const arrIndex = _enrolment.findIndex((enrolment, index) => {
    // console.log("index: ", index);
    // console.log("enrolment.id: ", enrolment.id);
    return enrolment.id === workshopId;
  });
  // console.log("arrIndex: ", arrIndex);
  if (arrIndex !== -1) {
    //an index was found, means cannot cos workshop there already
    res.json({
      status: "rejected",
      msg: "You have already registered for this workshop",
    });
    return;
  }
  const workshop = await workshopProfile.findById(workshopId);
  const workshopObj = {
    //in user profile enrolment list
    id: workshop.id,
    category: workshop.category,
    title: workshop.title,
    dateStart: workshop.dateStart,
    courseStartTime: workshop.courseStartTime,
    courseEndTime: workshop.courseEndTime,
  };
  _enrolment.push(workshopObj);
  await userProfile.findByIdAndUpdate(userId, { enrolment: _enrolment });
  // console.log("response: ", response);
  let _vacancies = workshop.vacancies;
  _vacancies -= 1;
  let userObj = {
    //in workshop profile participant list
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
  let _participantList = workshop.participantList;
  _participantList.push(userObj);
  await workshopProfile.findByIdAndUpdate(workshopId, {
    participantList: _participantList,
    vacancies: _vacancies,
  });
  res.json({
    status: "ok",
    msg: "workshop participant list updated successfully",
  });
});

//withdraw a user from a workshop and update the user and workshop
app.put("/dowan", async (req, res) => {
  const userId = req.body.userId;
  const workshopId = req.body.workshopId;
  // console.log("userId: ", userId);
  console.log("workshopId: ", workshopId);
  const user = await userProfile.findById(userId);
  console.log("enrolments: ", user.enrolment);
  let _enrolment = user.enrolment;
  let filtered = _enrolment.filter((enrolment) => {
    return enrolment.id !== workshopId;
  });
  // console.log("filtered: ", filtered);
  let response = await userProfile.findByIdAndUpdate(
    userId,
    { enrolment: filtered },
    { new: true }
  );
  // console.log("response: ", response);
  // res.json({ status: "ok", msg: "updated user profile" });

  const workshop = await workshopProfile.findById(workshopId);
  let _vacancies = workshop.vacancies;
  _vacancies += 1;
  let _participantList = workshop.participantList;
  filtered = _participantList.filter((participant) => {
    return participant.id !== userId;
  });
  response = await workshopProfile.findByIdAndUpdate(
    workshopId,
    {
      participantList: filtered,
      vacancies: _vacancies,
    },
    { new: true }
  );
  res.json({ status: "ok", msg: "yes, dowan ok" });
});

//create new userID
app.post("/usernew", async (req, res) => {
  try {
    newUser = new userProfile(req.body);
    let response = await newUser.save();
    console.log("created: ", response);
    let userInfo = {
      id: response._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      enrolment: [],
    };
    res.json({ status: "ok", msg: response, userInfo: userInfo });
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

//delete all users
app.delete("/userdeleteall", async (req, res) => {
  let response = await userProfile.deleteMany({});
  console.log("deleted all user profiles");
  res.send(response);
});

//update by ID
app.put("/userupdate/:id", async (req, res) => {
  try {
    let response = await userProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    console.log("user update by ID: ", response);
    res.json({ status: "ok", msg: "updated", updatedUser: response });
    // res.send(response);
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
  console.log(findworkshopProfile);
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
      req.body,
      { new: true }
    );
    console.log(response);
    res.json({ status: "ok", msg: "updated", updatedWorkshop: response });
    // res.send(response);
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log("listening ... ");
});
