const express = require("express");
const router = express.Router();
const {auth} = require("../middleware");
const comment_controller = require("../controllers/comment_controller");

router.post("/tasks/:id", auth, comment_controller.add_comment);
router.get("/tasks/:id", auth, comment_controller.get_comment);
router.delete("/:id", auth, comment_controller.delete_comment);

module.exports = router;