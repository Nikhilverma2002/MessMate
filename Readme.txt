const path = require("path");
const staticPath = path.join(__dirname, "../../public");
const registerSchema = require("../models/registerSchema");
const MessModel = require("../models/messSchema");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { log } = require("console");

exports.index = async (req, res) => {
  try {
    const messSystem = await MessModel.find({});

    res.json({ messList: messSystem });

    res.render("index", {
      messList: messSystem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
exports.Appindex = async (req, res) => {
  try {
    const messSystem = await MessModel.find({});
    return res.json({ messList: messSystem });
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
exports.AppregisterPost = async (req, resp) => {
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

    // Assuming that your schema keys are the same as the body fields
    const checkemail = await registerSchema.findOne({ email: inputEmail });
    const checknumber = await registerSchema.findOne({ number: inputMobileNumber });

    if (checknumber) {
      return resp
        .status(405)
        .json({ success: false, message: "Number is already registered" });
    } else if (checkemail) {
      return resp
        .status(405)
        .json({ success: false, message: "Email is already registered" });
    } else {
      if (inputPassword === inputConfirmPassword) {
        const userdata = new registerSchema({
          name: inputName,
          email: inputEmail,
          number: inputMobileNumber,
          interval: Status,
          password: inputPassword,
          college: inputCollegeOrJob,
          address: inputAddress,
          // confirmPassword should not be saved to the database
          // It's typically used only for validation
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        userdata.password = await bcrypt.hash(userdata.password, salt);

        const user = await userdata.save();

        // Generate auth token
        const token = await userdata.generateAuthToken();

        // Send back the token and user data in the response
        resp.status(200).json({
          success: true,
          message: "Registration successful",
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            number: user.number,
            interval: user.interval,
            college: user.college,
            address: user.address,
          }
        });
      } else {
        return resp
          .status(401)
          .json({ success: false, message: "Passwords do not match" });
      }
    }
  } catch (error) {
    console.error(error);
    return resp
      .status(401)
      .json({ success: false, message: "Please try again later" });
  }
};


// login ke liye
exports.loginPost = async (req, resp) => {
  const email = req.body.email;
  const password = req.body.password;
  // console.log(email + "   " + password);

  try {
    const useremail = await registerSchema.findOne({ email: email });
    // console.log(useremail);
    const ismatch = await bcrypt.compare(password, useremail.password);
    // console.log(1111111);
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
exports.ApploginPost = async (req, resp) => {
  const { email, password } = req.body; // Simplified destructuring

  try {
    const user = await registerSchema.findOne({ email: email });
    if (!user) {
      return resp.status(401).json({ success: false, message: "Email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = await user.generateAuthToken();
      // For mobile apps, consider sending the token in the response instead of setting a cookie
      resp.status(200).json({
        success: true,
        message: "Successfully logged in",
        token: token // Send the token in the response
      });
    } else {
      resp.status(402).json({
        success: false,
        message: "Your Email or Password is incorrect"
      });
    }
  } catch (error) {
    console.log(error);
    resp.status(401).json({ success: false, message: "Your Email or Password is incorrect" });
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
exports.AppprofileGet = async (req, resp) => {
  try {

    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.secretkey);

    const user = await registerSchema.findById(decoded._id);

    if (!user) {
      return resp.status(404).json({ success: false, message: "User not found" });
    }

    resp.json({ success: true, user: user });

  } catch (error) {
    console.log(error);

    // Determine if the error is due to an invalid token
    if (error.name === 'JsonWebTokenError') {
      resp.status(401).json({ success: false, message: "Invalid token. Please log in again." });
    } else {
      resp.status(500).json({ success: false, message: "An error occurred. Please try again later." });
    }
  }
};

exports.AppprofilePost = async (req, resp) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return resp.status(401).send('Access Denied / Unauthorized request');
    }

    const verifiedToken = jwt.verify(token, process.env.secretKey);
    if (!verifiedToken) {
      return resp.status(401).send('Unauthorized request');
    }

    const user = await registerSchema.findById(verifiedToken._id);
    if (!user) {
      return resp.status(404).send('User not found');
    }

    // Extract name, email, and money from the request body
    const { name, email, money } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;

    console.log(money);
    if (money) {
      user.money = Array.isArray(money) ? money.join(', ') : money;
    }

    await user.save(); // Save the updated user to the database

    resp.status(200).send('Profile updated successfully');
  } catch (error) {
    console.error(error);
    resp.status(500).send('An error occurred. Please try again later.');
  }
};

//admin

exports.adminpost = async (req, res) => {
  res.sendFile("html/admin.html", { root: staticPath });
};
exports.AppadminAction = async (req, res) => {
  try {
    // Example administrative action: Fetching a list of users
    // Ensure this endpoint is secured and only accessible by authorized users
    const users = await UserModel.find({});
    res.json({ success: true, users: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// card allot

exports.cardAllotment = async (req, res) => {
  res.sendFile("html/cardAlloatment.html", { root: staticPath });
};
exports.AppcardAllotment = async (req, res) => {
  res.json({ success: true, data: cardAllotmentData });
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
exports.Apptesting = async (req, res) => {
  try {
    const messSystem = await MessModel.find({});
    // Return the data as JSON
    res.json({ success: true, messList: messSystem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
