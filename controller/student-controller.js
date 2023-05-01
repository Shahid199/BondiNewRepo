const Student = require("../model/Student");
//Create Students
const createStudent = async (req, res, next) => {
  const { regNo, name, mobileNo } = req.body;
  let existingStudent;
  try {
    existingStudent = await Student.findOne({ regNo: regNo });
  } catch (err) {
    console.log(err);
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
  }
  return res.status(201).json({ message: "Student Created Succesfully." });
};
exports.createStudent = createStudent;
