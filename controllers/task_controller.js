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

    
    const statusCheck = await Task.aggregate([
      { $match: { list_id: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$list_id",
          statuses: { $addToSet: "$status" },
        },
      },
    ]);

    let allDoneBefore =
      statusCheck.length > 0 &&
      statusCheck[0].statuses.length === 1 &&
      statusCheck[0].statuses[0] === "Done";

    let new_task = new Task({
      ...req.body,
      list_id: id,
    });

    await new_task.save();

    // If all tasks were "Done" before adding → reset list_stage to "Todo"
    if (allDoneBefore) {
      await List.findByIdAndUpdate(id, { $set: { list_stage: "Todo" } });
    }
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

    if (req.body.status === "Done") {
      const check = await Task.aggregate([
        { $match: { list_id: updated_task.list_id } },
        {
          $group: {
            _id: "$list_id",
            allDone: { $min: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } },
          },
        },
      ]);

      if (check.length > 0 && check[0].allDone === 1) {
        await List.findByIdAndUpdate(updated_task.list_id, {
          $set: {
            list_stage: "Done",
          },
        });
      }
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

module.exports.assign_user = async (req, res) => {
  let { id } = req.params;
  let { user_name } = req.body;
  try {
    const task = await Task.findById(id);
    const user = await User.findOne({ user_name });
    const list = await List.findById(task.list_id);

    const update_list_stage = await List.findByIdAndUpdate(list._id, {
      $set: { list_stage: "In progress" },
    });

    const update_task = await Task.findByIdAndUpdate(
      task._id,
      {
        $push: { assigned_user: user._id },
        $set: { status: "In progress" },
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "user assigned successfully", update_task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
