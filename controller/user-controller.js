const User = require("../model/User");
const bcrypt = require("bcryptjs");
//Create Users
const createOfficeUser = async (req, res, next) => {
  const { name, userName, mobileNo, password, role } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ userName: userName });
  } catch (err) {
    console.log(err);
  }
  if (existingUser) {
    return res.status(400).json({ message: "user already exist" });
  }
  const hashedPassword = bcrypt.hashSync(password);
  const user = new User({
    name: name,
    userName: userName,
    mobileNo: mobileNo,
    password: hashedPassword,
    role: role,
  });
  try {
    const doc = await user.save();
  } catch (err) {
    console.log(err);
  }
  return res.status(201).json({ message: user });
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
    user = await User.find({ role: role });
  } catch (err) {
    return new Error(err);
  }
  if (!user) {
    return res.status(404).json({ message: "user Not Found" });
  }
  return res.status(200).json(user);
};

exports.createOfficeUser = createOfficeUser;
exports.createStudentUser = createStudentUser;
exports.getUserByRole = getUserByRole;
