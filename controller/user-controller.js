const User = require("../model/User");
const bcrypt = require("bcryptjs");
//Create Users
const createOfficeUser = async (req, res, next) => {
  const { name, userName, mobileNo, password, address } = req.body;
  if (name == "") return res.status(400).json({ message: "name is required" });
  else if (userName == "")
    return res.status(400).json({ message: "username is required" });
  else if (mobileNo == "")
    return res.status(400).json({ message: "mobileNo is required" });
  let existingUser;
  try {
    existingUser = await User.findOne({ userName: userName });
  } catch (err) {
    console.log(err);
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
    role: role,
  });
  try {
    const doc = await user.save();
  } catch (err) {
    console.log(err);
  }
  return res.status(201).json({ message: "New User created successfully." });
};
//Create Users
const createStudentUser = async (req, res, next) => {
  const { name, userName, mobileNo, role } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ userName: userName });
  } catch (err) {
    console.log(err);
  }
  if (existingUser) {
    return res.status(400).json({ message: "student already exist" });
  }
  const user = new User({
    name: name,
    userName: userName,
    mobileNo: mobileNo,
    role: role,
  });
  try {
    const doc = await user.save();
  } catch (err) {
    console.log(err);
  }
  return res.status(201).json({ message: user });
};
//get user by role
const getUserByRole = async (req, res, next) => {
  const role = req.query.role;
  console.log(role);
  let user;
  try {
    user = await User.findOne({ role: role }).select("-password");
  } catch (err) {
    return new Error(err);
  }
  if (!user) {
    return res.status(404).json({ message: "user Not Found" });
  }
  return res.status(200).send(user);
};
//get user role
const getUserRole = async (req, res, next) => {
  const userName = req.query.username;
  console.log(userName);
  let userInfo;
  try {
    userRole = await User.find({ userName: userName }).select("role");
  } catch (err) {
    return new Error(err);
  }
  if (!userRole) {
    return res.status(404).json({ message: "user Not Found" });
  }
  return res.status(200).json(userRole);
};
exports.createOfficeUser = createOfficeUser;
exports.createStudentUser = createStudentUser;
exports.getUserByRole = getUserByRole;
exports.getUserRole = getUserRole;
