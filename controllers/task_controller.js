const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const List = require("../models/List");
const Comment = require("../models/Comment");

module.exports.add_task = async (req, res) => {
  let { id } = req.params;
  let { task_name } = req.body;
  try {
    let existing_task = await Task.findOne({ task_name });
    if (existing_task) {
      return res.status(400).json({ message: "task already exist" });
    }

    if (!id) {
      return res.status(400).json({ message: "id not found" });
    }

    let new_task = new Task({
      ...req.body,
      list_id: id,
    });

    await new_task.save();

    res.status(200).json({ message: "Task added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.get_task = async (req, res) => {
  let { id } = req.params;
  try {
    let taskWithComments = await Task.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "task_id",
          as: "comments",
        },
      },
    ]);

    res.status(200).json(taskWithComments[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.update_task = async (req, res) => {
  let { id } = req.params;

  try {
    let updated_task = await Task.findByIdAndUpdate(
      id,
      { $set: { ...req.body } },
      { new: true }
    );

    if (!updated_task) {
      return res.status(400).json({ message: "updation failure" });
    }

    res
      .status(200)
      .json({ message: "task updated successfully", updated_task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.delete_task = async (req, res) => {
  let { id } = req.params;

  try {
    const deleted_task = await Task.findByIdAndDelete(id);

    if (!deleted_task) {
      return res.status(400).json({ message: "deletion failure" });
    }

    await Comment.deleteMany({ task_id: deleted_task._id });

    res
      .status(200)
      .json({ message: "task deleted successfully", deleted_task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.assign_user = async (req, res) => {};
