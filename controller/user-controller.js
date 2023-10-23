const { ObjectId } = require("mongodb");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const pagination = require("../utilities/pagination");
const { default: mongoose } = require("mongoose");
//const session = require("express-session");
const Limit = 10;

const validateToken = async (req, res) => {
  return res.json(req.user);
};
//Create Users
//get user by role
const getUserByRole = async (req, res, next) => {
  const role = Number(req.query.role);
  if (role == null) return res.status(404).json("Role not found.");
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await User.find({ role: role, status: true }).count();
  } catch (err) {
    return res.status(404).json("Something went wrong.");
  }
  if (count == 0) return res.status(404).json("No data found");
  let paginaeData = pagination(count, page);
  //console.log(role);
  let user;
  try {
    user = await User.find({ role: role, status: true }, "-password")
      .populate("courseId subjectId")
      .skip(paginaeData.skippedIndex)
      .limit(paginaeData.perPage);
  } catch (err) {
    return res.status(404).json("Something went wrong.");
  }
  if (!user) {
    return res.status(404).json({ message: "user Not Found" });
  }
  return res.status(200).json({ user, paginaeData });
};
// const getUserByCourse = async (req, res, next) => {
//   const role = Number(req.query.role);
//   let courseId = req.query.courseId;
//   if (role == null || !ObjectId.isValid(courseId))
//     return res.status(404).json("Role not found.");
//   courseId = new mongoose.Types.ObjectId(courseId);
//   //console.log(role);
//   let user;
//   try {
//     user = await User.find(
//       { role: role, status: true, courseId: courseId },
//       "-password"
//     ).populate("courseId subjectId");
//   } catch (err) {
//     return res.status(404).json("Something went wrong.");
//   }
//   if (!user) {
//     return res.status(404).json({ message: "user Not Found" });
//   }
//   return res.status(200).json({ user });
// };
const getTeacher = async (req, res, next) => {
  let teacher;
  try {
    teacher = await User.find({ role: 3, status: true }).select(
      "name userName"
    );
  } catch (err) {
    return res.status(404).json("Something went wrong.");
  }
  if (!teacher) {
    return res.status(404).json({ message: "Teacher Not Found" });
  }
  return res.status(200).json(teacher);
};
const getUserById = async (req, res, next) => {
  const id = req.query.id;
  if (id == null) return res.status(404).json("id not found.");
  let page = req.query.page;
  let user;
  try {
    user = await User.find({ _id: id, status: true });
  } catch (err) {
    return new Error(err);
  }
  if (!user) {
    return res.status(404).json({ message: "user Not Found" });
  }
  return res.status(200).json(user);
};
const teacherListByCourse = async (req, res, next) => {
  let courseId = req.query.courseId;
  if (!ObjectId.isValid(courseId))
    return res.status.json("course Id is not valid.");
  courseId = new mongoose.Types.ObjectId(courseId);
  let user = null;
  try {
    user = await User.find({
      $and: [{ role: 3 }, { status: true }, { courseId: courseId }],
    });
  } catch (err) {
    return res.status(404).json("Something went wrong.");
  }
  if (user == null)
    return res.status(404).json("No teacher found in this course.");
  let data = [];
  for (let i = 0; i < user.length; i++) {
    let obj = {};
    obj["label"] = user[i].name;
    obj["value"] = user[i]._id;
    data.push(obj);
  }
  return res.status(200).json(data);
};
//get user role
const getUserRole = async (req, res, next) => {
  const userName = req.query.userName;
  //console.log(userName);
  let userInfo;
  try {
    userRole = await User.find({ userName: userName }).select("role");
  } catch (err) {
    return res.status(404).json("Something went wrong.");
  }
  if (!userRole) {
    return res.status(404).json({ message: "user Not Found" });
  }
  return res.status(200).json(userRole);
};
//New work:User Start
const createOfficeUser = async (req, res, next) => {
  const {
    name,
    userName,
    mobileNo,
    password,
    address,
    role,
    courseId,
    subjectId,
  } = req.body;
  if (Number(role) == 3) {
    if (!ObjectId.isValid(courseId) || !ObjectId.isValid(subjectId)) {
      return res.status(404).json("course Id or subject Id is not valid.");
    }
    let courseIdObj = new mongoose.Types.ObjectId(courseId);
    let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
    if (name == "")
      return res.status(400).json({ message: "name is required" });
    else if (userName == "")
      return res.status(400).json({ message: "username is required" });
    else if (mobileNo == "")
      return res.status(400).json({ message: "mobileNo is required" });
    let existingUser;
    try {
      existingUser = await User.findOne({ userName: userName });
    } catch (err) {
      //console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    if (existingUser) {
      return res.status(400).json({ message: "user already exist" });
    }
    if (!password)
      return res.status(400).json({ message: "password is required" });
    const hashedPassword = bcrypt.hashSync(password);
    const user = new User({
      name: name,
      userName: userName,
      mobileNo: mobileNo,
      address: address,
      password: hashedPassword,
      status: true,
      role: role,
      courseId: courseIdObj,
      subjectId: subjectIdObj,
    });
    try {
      const doc = await user.save();
    } catch (err) {
      //console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    return res.status(201).json({ message: "New User created successfully." });
  } else {
    if (name == "")
      return res.status(400).json({ message: "name is required" });
    else if (userName == "")
      return res.status(400).json({ message: "username is required" });
    else if (mobileNo == "")
      return res.status(400).json({ message: "mobileNo is required" });
    let existingUser;
    try {
      existingUser = await User.findOne({ userName: userName });
    } catch (err) {
      //console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    if (existingUser) {
      return res.status(400).json({ message: "user already exist" });
    }
    if (!password)
      return res.status(400).json({ message: "password is required" });
    const hashedPassword = bcrypt.hashSync(password);
    const user = new User({
      name: name,
      userName: userName,
      mobileNo: mobileNo,
      address: address,
      password: hashedPassword,
      status: true,
      role: role,
    });
    try {
      const doc = await user.save();
    } catch (err) {
      //console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    return res.status(201).json({ message: "New User created successfully." });
  }
};
const updateOfficeUser = async (req, res, next) => {
  const { userId, name, userName, mobileNo, address } = req.body;
  if (!ObjectId.isValid(userId) || !name || !userName || !mobileNo || !address)
    return res.status(404).json("Data missing.");
  let userUpdate = {
    name: name,
    userName: userName,
    mobileNo: mobileNo,
    address: address,
  };
  let upd = null;
  try {
    upd = await User.findByIdAndUpdate(userId, userUpdate);
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (upd == null) return res.status(404).json("Update not done.");
  return res.status(201).json("Updated user Info");
};
const deactivateUser = async (req, res, next) => {
  const userId = req.body;
  //console.log(userId);
  if (!ObjectId.isValid(userId._id))
    return res.status(404).json("Invalid user Id.");
  let upd = null;
  try {
    upd = await User.findByIdAndUpdate(
      { _id: new ObjectId(userId._id) },
      { status: false }
    );
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  return res.status(201).json("User deactivated successfully.");
};

const updatePassword = async (req, res, next) => {
  const { oldPassowrd, newPassword } = req.body;
  const userId = req.user._id;
  if (!ObjectId.isValid(userId))
    return res.status(404).json("Invalid user Id.");
  let userInfo = null;
  try {
    userInfo = await User.findById(userId).select("password");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  const hashedOldPassword = bcrypt.hashSync(oldPassowrd);
  if (hashedOldPassword != userInfo.password)
    return res.status(404).json("Old password did not match.");
  const hashedNewPassword = bcrypt.hashSync(newPassword);
  let upd = null;
  try {
    upd = await User.findByIdAndUpdate(userId, { password });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (upd == null) return res.status(404).json("Password Mot Updated.");
  return res.status(201).json("Password Updated.");
};
//New Work:User End
/**
 * User auth
 */
const loginSuperAdmin = async (req, res) => {
  if (req.isAuthenticated() === false) {
    try {
      const { userName, password } = req.body;
      // Find the user associated with the email provided by the user
      const user = await User.findOne({ userName });
      // If the user isn't found in the database, return a message
      if (!user) {
        return res.status(404).json("User not found");
      }

      // if user found verify the password

      await user.loginUser(user, password, (err, token) => {
        if (err) {
          //console.log(err);
          return res.status(500).json("Something went wrong!");
        }
        if (!token) {
          return res.status(401).json("Email/Password mismatched");
        }
        const { name, userName, _id, mobileNo, role, address } = user;
        res.cookie("token", token, {
          expires: new Date(Date.now() + 24 * 3600 * 1000),
          httpOnly: true,
          secure: true,
          sameSite: "None",
        });
        return res
          .status(200)
          .json({ name, userName, _id, mobileNo, role, address, token });
      });
    } catch (error) {
      //console.log(error);
      return res.status(500).json("Something went wrong!");
    }
  } else {
    return res.status(301).redirect("/dashboard");
  }
};
//create superAdmin use only once
exports.createSuperAdmin = async (req, res) => {
  const hashedPassword = bcrypt.hashSync("qwerty");
  const user = new User({
    name: "Super Admin Test",
    userName: "superadmintest",
    mobileNo: "01677732635",
    address: "Dhaka",
    password: hashedPassword,
    role: 1,
  });
  try {
    const doc = await user.save();
  } catch (err) {
    //console.log(err);
  }
  return res.status(201).json("OK");
};

//exports.getUserByCourse = getUserByCourse;
exports.createOfficeUser = createOfficeUser;
exports.getUserByRole = getUserByRole;
exports.getUserRole = getUserRole;
exports.loginSuperAdmin = loginSuperAdmin;
exports.validateToken = validateToken;
exports.updateOfficeUser = updateOfficeUser;
exports.deactivateUser = deactivateUser;
exports.updatePassword = updatePassword;
exports.getUserById = getUserById;
exports.getTeacher = getTeacher;
exports.teacherListByCourse = teacherListByCourse;
