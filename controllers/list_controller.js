const mongoose = require("mongoose");
const Board = require("../models/Board");
const List = require("../models/List");
const Task = require("../models/Task");
const Comment = require("../models/Comment");

module.exports.create_list = async (req, res) => {
  let { id } = req.params;
  let { list_name } = req.body;
  try {
    let existing_list = await List.findOne({ list_name });

    if (existing_list) {
      return res.status(400).json({ message: "this listing is already exist" });
    }

    if (!id) {
      return res.status(400).json({ message: "Board not found for listing" });
    }

    let new_list = new List({
      board_id: id,
      list_name,
    });

    await new_list.save();

    const new_save_list = await List.findOne({ list_name });
    const updated_board = await Board.findByIdAndUpdate(
      id,
      { $push: { list_order: new_save_list._id } },
      { new: true }
    );

    res.status(200).json({ message: "list created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.update_list = async (req, res) => {
  let { id } = req.params;
  let { list_name } = req.body;
  try {
    let updated_list = await List.findByIdAndUpdate(
      id,
      { $set: { list_name: list_name } },
      { new: true }
    );

    if (!updated_list) {
      return res.status(400).json({ message: "Updation failure" });
    }

    res
      .status(200)
      .json({ message: "list updated successfully", updated_list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.delete_list = async (req, res) => {
  let { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let list = await List.findById(id).session(session);

    if (!list) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "list not found" });
    }

    let tasks = await Task.find({ list_id: list._id }).session(session);
    const taskIds = tasks.map((t) => t._id);

    if (taskIds.length > 0) {
      await Comment.deleteMany({ task_id: { $in: taskIds } }, { session });
    }

    await Task.deleteMany({ list_id: list._id }, { session });

    let delete_list = await List.findByIdAndDelete(list._id, { session });

    if (!delete_list) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "deletion failure" });
    }
    let updated_board_list_order = await Board.findByIdAndUpdate(
      list.board_id,
      { $pull: { list_order: list._id } },
      {session}
    );

    if (!updated_board_list_order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "list order updation failure" });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "List deleted successfully", delete_list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.reorder_list = async (req, res) => {
  const {id} = req.params;
  const {reorder_list} = req.body;
  try {
    const list = await List.findById(id);
    const board = await Board.findById(list.board_id);
    let newarray = board.list_order;
    // let spreed_board = {...board.toObject()};

    // console.log(spreed_board);

    let start_idx = newarray.indexOf(id);
    let element = newarray[start_idx];
    
    newarray.splice(start_idx, 1);
    
    newarray.splice(reorder_list-1, 0, element);

   let updatedBoard = await Board.findOneAndUpdate(
    list.board_id,
    {list_order: newarray},
    {new:true}
   )

    res.status(200).json({message:"reorder successfull", updatedBoard});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
