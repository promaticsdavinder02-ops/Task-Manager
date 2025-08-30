const express = require("express");
const router = express.Router();
const list_controller = require("../controllers/list_controller");
const {auth} = require("../middleware");

router.post("/boards/:id", auth, list_controller.create_list);
router.patch("/:id", auth, list_controller.update_list);
router.delete("/:id", auth, list_controller.delete_list);
router.patch("/:id/reorder", auth, list_controller.reorder_list);



module.exports = router;