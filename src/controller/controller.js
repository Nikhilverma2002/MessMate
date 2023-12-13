const path = require("path");
const staticPath = path.join(__dirname, "../../public");
const registerSchema = require("../models/registerSchema");
const MessModel = require("../models/messSchema");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { log } = require("console");
const contactSchema = require("../models/contactSchema");

exports.index = async (req, res) => {
  try {
    const messSystem = await MessModel.find({}); // Use await here to wait for the result

    res.render("index", {
      messList: messSystem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.registerPost = async (req, resp) => {
  try {
    const {
      inputName,
      inputEmail,
      inputPassword,
      inputMobileNumber,
      inputConfirmPassword,
      Status,
      inputAddress,
      inputCollegeOrJob,
    } = req.body;
    const checkemail = await registerSchema.findOne({ inputEmail });
    const checknumber = await registerSchema.findOne({ inputMobileNumber });

    if (checknumber) {
      resp
        .status(405)
        .json({ success: false, message: "Number is already registered" });
    } else if (checkemail) {
      resp
        .status(405)
        .json({ success: false, message: "Email is already registered" });
    } else {
      if (inputPassword == inputConfirmPassword) {
        const userdata = new registerSchema({
          name: inputName,
          email: inputEmail,
          number: inputMobileNumber,
          interval: Status,
          password: inputPassword,
          college: inputCollegeOrJob,
          address: inputAddress,
          confirmPassword: inputConfirmPassword,
        });
        const token = await userdata.generateAuthToken();
        resp.cookie("jwt", token, {
          expires: new Date(Date.now() + 5259600000),
          httpOnly: true,
          sameSite: "Strict",
        });
        const user = await userdata.save();
        resp
          .status(200)
          .json({ success: true, message: "register successful", user });
      } else {
        resp
          .status(401)
          .json({ success: false, message: "Password do not match" });
      }
    }
  } catch (error) {
    resp
      .status(401)
      .json({ success: false, message: "Please try again later" });
  }
};

// login ke liye
exports.loginPost = async (req, resp) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email + "   " + password);

  try {
    const useremail = await registerSchema.findOne({ email: email });
    const ismatch = await bcrypt.compare(password, useremail.password);
    const token = await useremail.generateAuthToken();
    if (ismatch) {
      resp.cookie("jwt", token, {
        expires: new Date(Date.now() + 5259600000),
        httpOnly: true,
        sameSite: "Strict",
      });
      resp.status(200).json({
        success: true,
        message: "Successfuly",
      });
    } else {
      resp.status(402).json({
        success: false,
        message: "Your Email or Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    resp
      .status(401)
      .json({ success: false, message: "Your Email or Password is incorrect" });
  }
};

exports.profileGet = async (req, resp) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.secretKey);
    const user = await registerSchema.findOne({ _id: verify._id });

    resp.render("profile", {
      user: user,
    });
  } catch (error) {
    console.log(error);
    resp
      .status(402)
      .json({ success: false, message: "Please login or create an account" });
  }
};

exports.profilePost = async (req, resp) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.secretKey);
    const user = await registerSchema.findById(verify._id);
    if (!user) {
      return resp
        .status(401)
        .send("User not found you have to login or register.");
    }
    const { name, email, money } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (money) user.money = money;
    await user.save();
    //TODO :
    resp.redirect("profile");
  } catch (error) {
    console.error(error);
    resp.status(401).send("Login timeout. Please login.");
  }
};

//admin

exports.adminpost = async (req, res) => {
  res.sendFile("html/admin.html", { root: staticPath });
};

// card allot

exports.cardAllotment = async (req, res) => {
  res.sendFile("html/cardAlloatment.html", { root: staticPath });
};

exports.userlogin = async (req, res) => {
  res.sendFile("html/login.html", { root: staticPath });
};

//edit profile
exports.editprofile = async (req, res) => {
  res.sendFile("html/edit.html", { root: staticPath });
};

//recharge card
exports.recharge = async (req, res) => {
  res.sendFile("html/recharge.html", { root: staticPath });
};

//testing learning ejs

exports.testing = async (req, res) => {
  try {
    const messSystem = await MessModel.find({}); // Use await here to wait for the result

    res.render("test", {
      messList: messSystem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

//contact form

exports.contactPost = async (req, resp) => {
  console.log(11111111);
  const name = req.body.name;
  const number = req.body.number;
  const subject = req.body.subject;
  const message = req.body.message;
  console.log(name);
  console.log(number);

  try {
    const contactData = new contactSchema({
      name: name,
      number: number,
      subject: subject,
      message: message,
    });
    const contact = await contactData.save();
    resp
      .status(200)
      .json({ success: true, message: "We will contact you soon", contact });
  } catch (error) {
    console.error(error);
    resp.status(401).send("Some Error occured");
  }
};

//edit profile

exports.editPost = async (req, resp) => {
  console.log(11111111,req.body);
  const token = req.cookies.jwt;
  const verify = jwt.verify(token, process.env.secretKey);
  const user = await registerSchema.findById(verify._id);6  
  console.log(user);
  const name = req.body.name;
  const number = req.body.number;
  const address = req.body.address;
  console.log(name);
  console.log(number);

  try {
    const editData = new editSchema({
      name: name,
      number: number,
      message: address,
    });
    const edit = await editData.save();
    resp
      .status(200)
      .json({ success: true, message: "Profile Updated Successfully", edit });
  } catch (error) {
    console.error(error);
    resp.status(401).send("Some Error occured");
  }
};
