const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/user_controller");
const {auth} = require("../middleware");


router.post("/register", user_controller.user_register);
router.post("/login", user_controller.user_login);
router.get("/:id", auth, user_controller.user_profile);



module.exports = router;