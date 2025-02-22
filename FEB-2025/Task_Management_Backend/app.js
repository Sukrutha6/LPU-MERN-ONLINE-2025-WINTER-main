require("dotenv").config();
//attaches the dot env key values in the process variable that we can now use anywhere
require("./config/dbConfig.js");
const PORT = process.env.PORT || 1814;
const express = require("express"); //express framework for our backend
const morgan = require("morgan");
const cors = require("cors");
const User = require("./models/userModel.js");
const { generateOTP } = require("./utils/otpHelper.js");
const { sendOtpEmail, sendReminderMail } = require("./utils/emailHelper.js");
const OTP = require("./models/otpModel.js");
const bcrypt = require("bcrypt"); //used for hashing
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Task = require("./models/taskModel.js");
const cron = require("node-cron");

// cron.schedule("* * * * *", () => {
//   console.log("running a task every minute"); 
//   sendReminderMail("<email>");
// });
// console.log("Frontend URL= ",process.env.FRONTEND_URL);
//---------------------------------------------------------------------
const app = express(); //app creation 
//---------------------------------------------------------------------
//middlewares
app.use(morgan("dev")); //logs our requests.
app.use(
  //CROSS ORIGIN RESOURCE SHARING
  cors({
    //cors allows or block requests from diff origin.
    //allows the frontend to send and receive cookies or authentication headers when making requests to the backend.
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());
app.use((req, res, next) => {
  console.log("Request received->", req.url);
  next();
});
//--------------------------------------------------------
//request listener/ request handler : ROUTES/API

app.get("/", (req, res) => {
  res.send("<h1>Server is working fine ...</h1>");
});
//GETS USERS:
app.get("/users", (req, res) => {
  try {
  } catch (e) {
    console.log("Errror in GET /users");
    console.log(e.message);
    res.status(500);
    res.json({
      status: "fail",
      message: "Internal Server Error " + err.message,
    });
  }
});
//USER CREATION:
app.post("/users/register", async (req, res) => {
  try {
    const { email, password, otp, fullName } = req.body;
    //Verify the otp from the database, and the user otp:
    const otpDoc = await OTP.findOne({
      email: email,
    }).sort("-createdAt");
    console.log(otpDoc);
    if (!otpDoc) {
      res.status(400);
      res.json({
        status: "fail",
        msg: "Otp is not sent or is expired.",
      });
      return;
    }
    //otp ko destructure karke rename kar rahe here:
    const { otp: hashedOtp } = otpDoc;
    const isOtpCorrect = await bcrypt.compare(otp.toString(), hashedOtp);
    if (!isOtpCorrect) {
      res.status(401); //unauthorized
      res.json({
        status: "fail",
        msg: "Invalid OTP!",
      });
      return;
    }

    //register the user securely <3
    const hashedPasscode = await bcrypt.hash(password, 14);

    const newUser = await User.create({
      email,
      password: hashedPasscode,
      fullName,
    });
    res.status(201);
    res.json({
      status: "success",
      data: {
        user: {
          email: newUser.email,
          fullName: newUser.fullName,
        },
      },
    });
  } catch (err) {
    console.log("Error in /POST users");
    console.log(err.name, err.code);
    console.log(err.message);
    if (err.name === "ValidationError") {
      res.status(400);
      res.json({
        status: "fail",
        message: "Data validation failed: " + err.message,
      });
    } else if (err.code === 11000) {
      res.status(400);
      res.json({
        status: "fail",
        message: "Email already exists",
      });
    } else {
      res.status(500);
      res.json({
        status: "fail",
        message: "Internal Server Error",
      });
    }
  }
});
//OTPS:
app.post("/otps", async (req, res) => {
  // const queryObj= req.query;
  const { email } = req.body;
  //req format + regex + length checking of email.
  if (!email) {
    res.status(400).json({
      status: "fail",
      message: 'Missing required param: "email"',
    });
    return;
  }
  //create a OTP
  const otp = generateOTP();
  //send the OTP to mail
  const isEmailSent = await sendOtpEmail(email, otp);

  if (!isEmailSent) {
    // this is the case when isEmailSent is false
    res.status(500).json({
      status: "fail",
      message: "Email could not be sent! Please try again after 30 seconds!",
    });
    return;
  } else {
    console.log("isEmail sent", isEmailSent);
  }
  //HASHING USING BCRYPT:
  const newSalt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp.toString(), newSalt);

  await OTP.create({
    email,
    otp: hashedOtp,
  });

  res.status(201);
  res.json({
    status: "success",
    message: `OTP sent to ${email}`,
  });
});
//LOGIN:
app.post("/users/login", async (req, res) => {
  try {
    //here user is sending the password.
    const { email, password } = req.body;
    const currUser = await User.findOne({ email: email });
    if (!currUser) {
      res.status(400);
      res.json({
        status: "fail",
        message: "User is not Registered.",
      });
    }
    //This is coming from database, hashedPasscode is from database
    const { password: hashedPassword, fullName, _id } = currUser;
    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordCorrect) {
      res.status(401);
      res.json({
        status: "fail",
        message: "Invalid password!",
      });
      return;
    }
    //JSON WEB TOKEN: jwt to validate the user requests.
    //Header.Payload.Signature - syntax of jwt
    //signature= Hashing of payload and salt(secret key)

    const token = jwt.sign(
      {
        email,
        _id,
        fullName,
      },
      process.env.JWT_SECRET_KEY, //secret key
      {
        expiresIn: "1d", //https://github.com/vercel/ms
      }
    );
    console.log(token);

    //adds a cookie to frontend in the format :- name,value
    //front-end should allow the backend to perform cookie operations
    res.cookie("authorization", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      //as bckend and frntend are in diff domain iskeliye sameSite = none.
    });

    res.status(200);
    res.json({
      status: "success",
      message: "User Logged In!",
      data: {
        user: {
          email,
          fullName,
        },
      },
    });
  } catch (err) {
    console.log("Error In login: ", err.message);
    res.status(500);
    res.json({
      status: "fail",
      msg: "Internal Server error",
    });
  }
});

//middleware to authorize the user.
app.use(cookieParser()); //reads the cookies and adds them to req object
app.use((req, res, next) => {
  try {
    //validate the token
    const { authorization } = req.cookies;
    if (!authorization) {
      res.status(401);
      res.json({
        status: "fail",
        msg: "Authorization failed!",
      });
      return;
    }
    jwt.verify(authorization, process.env.JWT_SECRET_KEY, (error, data) => {
      if (error) {
        //that means token is invalid (hacking attempt)
        res.status(401);
        res,
          json({
            status: "fail",
            msg: "Authorization failed!",
          });
      } else {
        req.currUser = data;
        next();
      }
    });
  } catch (err) {
    console.log("Error in validation middleware", err.message);
    res.status(500);
    res.json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
});

//CREATE TASKS:
app.post("/tasks", async (req, res) => {
  try {
    // 1. get the data from request
    const { assignor, ...taskInfo } = req.body;
    const { email } = req.currUser;
    taskInfo.assignor = email;

    // 2. validate the data :: now mongoose does that
    // 3. save the data in db :: MongoDB (online --> ATLAS) (offline is pain to setup :: in deployment we will mostly prefer online)
    const newTask = await Task.create(taskInfo);

    res.status(201); //created
    res.json({
      status: "success",
      data: {
        task: newTask,
      },
    });
  } catch (err) {
    console.log("Error in POST /tasks", err.message);
    if (err.name === "ValidationError") {
      res.status(400).json({ status: "fail", message: err.message });
    } else if (err.code === 11000) {
      res.status(400).json({ status: "fail", message: err.message });
    } else {
      res
        .status(500)
        .json({ status: "fail", message: "Internal Server Error" });
    }
  }
});

app.get("/users/me", (req, res) => {
  try {
    const { email, fullName } = req.currUser;
    res.status(200);
    res.json({
      status: "success",
      data: {
        user: {
          email,
          fullName,
        },
      },
    });
  } catch (err) {
    console.log("error is GET /users/me", err.message);
    res.status(500);
    res.json({
      status: "fail",
      message: "INTERNAL SERVER ERROR",
    });
  }
});

app.get("/users/logout", (req, res) => {
  res.clearCookie("authorization");
  res.json({
    status: "success",
    msg: "User is logged out!",
  });
});

app.get("/tasks", async (req, res) => {
  try {
    const taskList = await Task.find().or([
      { assignor: req.currUser.email },
      { assignee: req.currUser.email },
    ]);
    res.status(200);
    res.json({
      status: "success",
      data: {
        tasks: taskList,
      }, //the same port one
    });
  } catch (err) {
    console.log("error is GET /users/me", err.message);
    res.status(500);
    res.json({
      status: "fail",
      message: "INTERNAL SERVER ERROR",
    });
  }
});

// const testing = async () => {
//   console.time("salt1");
//   const newSalt = await bcrypt.genSalt(10); // rounds-x == iterations pow(2,x)
//   const newHash = await bcrypt.hash("password1", newSalt);
//   console.log("salt= ", newSalt);
//   console.log("hash= ", newHash);
//   console.timeEnd("salt1");
//   console.log(newSalt);
// };

// testing();

//------------------------------------------------------
//SERVER:
app.listen(PORT, () => {
  console.log("Server Started on port: ", PORT);
});
