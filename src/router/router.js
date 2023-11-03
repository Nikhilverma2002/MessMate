const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controller/controller");

router.get("/", controller.index);
router.post("/cardAlloatment", controller.registerPost);
router.post("/login", controller.loginPost);
router.get("/profile", auth, controller.profileGet);
router.post("/profile", auth, controller.profilePost);
router.get("/admin", controller.adminpost);
router.get("/cardAlloatment", controller.cardAllotment);
router.get("/login", controller.userlogin);
router.get("/editprofile", controller.editprofile);
router.get("/recharge", controller.recharge);
router.get("/testing", controller.testing);

module.exports = router;
