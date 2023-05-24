const router = require("express").Router();
const passport = require("passport");
const {
  createSubject,
  getSubjectByCourse,
  updateSubject,
  getSubjectById,
} = require("../controller/subject-controller");
const { upload } = require("../utilities/multer");

router.post("/createsubject", [upload.single("iLink")], createSubject);
router.put("/updatesubject", [upload.single("iLink")], updateSubject);
router.get("/getsubjectbyid", getSubjectById);
router.get("/getsubjectbycourse", getSubjectByCourse);

module.exports = router;
