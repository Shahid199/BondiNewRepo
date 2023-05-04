const router = require("express").Router();
const passport = require('passport');
const {
  createSubject,
  getSubjectByCourse,
} = require("../controller/subject-controller");
const { upload } = require("../utilities/multer");

router.post("/createsubject",[passport.authenticate('jwt', { session: false }), upload.single('iLink')], createSubject);
router.get("/getsubjectbycourse", getSubjectByCourse);

module.exports = router;
