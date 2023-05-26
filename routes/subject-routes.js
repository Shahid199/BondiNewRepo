const router = require("express").Router();
const passport = require("passport");
const {
  createSubject,
  getSubjectByCourse,
  updateSubject,
  getSubjectById,
  getAllSubject,
} = require("../controller/subject-controller");
const { upload } = require("../utilities/multer");

router.post("/createsubject", [passport.authenticate("jwt", { session: false }),upload.single("iLink")], createSubject);
router.put("/updatesubject", updateSubject);
router.get("/getsubjectbyid", getSubjectById);
router.get("/getsubjectbycourse", getSubjectByCourse);
router.get("/getallsubject", getAllSubject);

module.exports = router;
