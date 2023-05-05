const Student = require("../model/Student");
//Create Students
const addStudent = async (req, res, next) => {
  const { regNo, name, mobileNo } = req.body;
  let existingStudent;
  try {
    existingStudent = await Student.findOne({ regNo: regNo });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (existingStudent) {
    return res.status(400).json({ message: "student already exist" });
  }
  const stud = new Student({
    regNo: regNo,
    name: name,
    mobileNo: mobileNo,
  });
  try {
    const doc = await stud.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json({ message: "Student Created Succesfully." });
};
//update student
const updateStudent = async (req, res, next) => {
  const regNo = req.query.regno;
  let existingStudent;
  try {
    existingStudent = await Student.findOne({ regNo: regNo });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (!existingStudent) {
    return res.status(400).json({ message: "student not exists." });
  } else {
    if (req.body.sscStatus) {
      let flag = false;
      const { name, institution, mobileNo, sscRoll, sscReg } = req.body;
      const stud = new Student({
        name: name,
        mobileNo: mobileNo,
        sscRoll: sscRoll,
        sscReg: sscReg,
        institution: institution,
      });
      try {
        const id = await Student.findOne({ regNo: regNo }).select("_id");
        const doc = await Student.findOneAndUpdate({ id: id }, stud);
        flag = true;
      } catch (err) {
        console.log(err);
        return res.status(500).json("Something went wrong!");
      }
      if (flag) {
        return res
          .status(201)
          .json({ message: "Succesfully updated student information." });
      }
    } else if (req.body.hscStatus) {
      let flag = false;
      const { name, institution, mobileNo, hscRoll, hscReg } = req.body;
      const stud = new Student({
        name: name,
        mobileNo: mobileNo,
        hscRoll: hscRoll,
        hscReg: hscReg,
        institution: institution,
      });
      try {
        const id = await Student.findOne({ regNo: regNo }).select("_id");
        const doc = await Student.findOneAndUpdate({ id: id }, stud);
        flag = true;
      } catch (err) {
        console.log(err);
        return res.status(500).json("Something went wrong!");
      }
      if (flag) {
        return res
          .status(201)
          .json({ message: "Succesfully updated student information." });
      }
    } else {
      let flag = false;
      const { name, institution, mobileNo } = req.body;
      const stud = new Student({
        name: name,
        mobileNo: mobileNo,
        institution: institution,
      });
      try {
        const id = await Student.findOne({ regNo: regNo }).select("_id");
        const doc = await Student.findOneAndUpdate({ id: id }, stud);
        flag = true;
      } catch (err) {
        console.log(err);
        return res.status(500).json("Something went wrong!");
      }
      if (flag) {
        return res
          .status(201)
          .json({ message: "Succesfully updated student information." });
      }
    }
  }
};
//get student ID
const getStudentId = async (req, res, next) => {
  const regNo = req.query.regno;
  let studentId;
  try {
    studentId = await Student.findOne({ regNo: regNo }).select("_id");
    studentId = studentId._id;
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (!studentId)
    return res.status(401).json({ message: "Student Not Found." });
  else {
    return res.status(201).json({ studentId });
  }
};
const getAllStudent = async (req, res, next) => {
  let students;
  try {
    students = await Student.find({});
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json(students);
};
exports.addStudent = addStudent;
exports.updateStudent = updateStudent;
exports.getStudentId = getStudentId;
exports.getAllStudent = getAllStudent;
