const Comment = require("../models/Comment");
const Task = require("../models/Task");
const mongoose = require("mongoose");

module.exports.add_comment = async (req, res) => {
  let { id } = req.params;
  let { comment } = req.body;
  try {
    let task = await Task.findById(id);
    if (!task) {
      return res.status(400).json({ message: "invalid task id" });
    }

    let new_comment = new Comment({
      task_id: id,
      comment: comment,
    });

    await new_comment.save();

    res.status(400).json({ message: "Comment added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.get_comment = async (req, res) => {
  let { id } = req.params;
  try {
    let comments = await Comment.aggregate([
      {
        $match: { task_id: new mongoose.Types.ObjectId(id) },
      },
    ]);

    console.log(comments);

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.delete_comment = async (req, res) => {
  let { id } = req.params;
  try {
    let deleted_comment = await Comment.findByIdAndDelete(id);

    if (!deleted_comment) {
      return res.status(400).json({ message: "comment not found" });
    }

    res
      .status(200)
      .json({ message: "comment deleted successfully", deleted_comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
