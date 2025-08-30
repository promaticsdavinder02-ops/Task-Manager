const express = require("express");
const router = express.Router();
const board_controller = require("../controllers/board_controller");
const { auth } = require("../middleware");


router.get("/", auth, board_controller.get_all_boards);
router.post("/", auth, board_controller.create_board);
router.get("/:id", auth, board_controller.get_board);
router.patch("/:id", auth, board_controller.update_board);
router.delete("/:id", auth, board_controller.delete_board);




module.exports = router;