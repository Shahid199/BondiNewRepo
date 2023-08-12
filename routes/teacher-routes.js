const { getStudentData } = require("../controller/teacher-controller");

router.get(
  "/getstudentdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getStudentData
);
