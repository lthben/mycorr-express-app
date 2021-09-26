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
  const user = await userProfile.findOne({ email: email }, "hashPassword");
  if (user) {
    hash = user.hashPassword;
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
    res.json({ status: "ok", msg: "you are logged in" });
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

//create new userID
app.post("/usernew", async (req, res) => {
  try {
    // newUser = new userProfile({
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    //   email: req.body.email,
    //   hashPassword: req.body.hashPassword,
    // });
    newUser = new userProfile(req.body);
    let response = await newUser.save();
    console.log("created: ", response);
    res.json({ status: "ok", msg: response });
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

app.delete("/userdeleteall", async (req, res) => {
  let response = await userProfile.deleteMany({});
  console.log("deleted all user profiles");
  res.send(response);
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
