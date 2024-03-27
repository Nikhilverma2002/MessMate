const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authmobile = require("../middleware/authMobile");
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

// mobile
router.get("/app/", controller.Appindex);
router.post("/app/cardAlloatment", controller.AppregisterPost);
router.post("/app/login", controller.ApploginPost);
router.get("/app/profile", authmobile, controller.AppprofileGet);
router.post("/app/profile", authmobile, controller.AppprofilePost);
// router.get("/app/admin", controller.Appadminpost);
router.get("/app/cardAlloatment", controller.AppcardAllotment);
// router.get("/app/login", controller.Appuserlogin);
// router.get("/app/editprofile", controller.Appeditprofile);
// router.get("/app/recharge", controller.Apprecharge);
router.get("/app/testing", controller.Apptesting);

module.exports = router;
