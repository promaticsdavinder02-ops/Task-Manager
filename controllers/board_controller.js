const Board = require("../models/Board");

module.exports.get_all_boards = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.create_board = async (req, res) => {
  try {
    let user_id = req.user;
    let { board_name } = req.body;

    let existing_board = await Board.findOne({ board_name });
    if (existing_board) {
      return res.status(400).json("this board is already exit");
    }

    if (!user_id) {
      return res.status(400).json("this user id is not exist");
    }

    let new_board = new Board({
      user_id,
      board_name,
    });

    await new_board.save();

    res.status(200).json({ message: "Board Created Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.get_board = async (req, res) => {};

module.exports.update_board = async (req, res) => {
  const { id } = req.params;
  const { board_name } = req.body;
  try {
    const updated_board = await Board.findByIdAndUpdate(
      id,
      {
        $set: {
          board_name: board_name,
        },
      },
      {
        new: true,
      }
    );

    if (updated_board) {
      return res
        .status(200)
        .json({ message: "Board updated Successfully", updated_board });
    }

    res.status(400).json({ message: "Updation failure"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.delete_board = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ message: "Board not found" });
    }

    const deleted_board = await Board.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Board deleted successfully", deleted_board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
