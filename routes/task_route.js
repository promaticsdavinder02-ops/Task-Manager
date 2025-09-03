const express = require("express");
const router = express.Router();
const task_controller = require("../controllers/task_controller");
const {auth} = require("../middleware");

router.post("/lists/:id", auth, task_controller.add_task);
router.get("/:id", auth, task_controller.get_task);
router.patch("/:id", auth, task_controller.update_task);
router.delete("/:id", auth, task_controller.delete_task);
router.patch("/:id/assign", auth, task_controller.assign_user);


module.exports = router;
