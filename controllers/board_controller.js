const mongoose = require("mongoose");
const Board = require("../models/Board");
const List = require("../models/List");
const Task = require("../models/Task");
const Comment = require("../models/Comment");

module.exports.get_all_boards = async (req, res) => {
  try {
    const boards = await Board.aggregate([
      {
        $lookup: {
          from: "lists",
          localField: "_id",
          foreignField: "board_id",
          as: "lists",
          pipeline: [
            {
              $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "list_id",
                as: "tasks",
                pipeline: [
                  {
                    $lookup: {
                      from: "comments",
                      localField: "_id",
                      foreignField: "task_id",
                      as: "comments",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ]);

    res.json(boards);
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

module.exports.get_board = async (req, res) => {
  const {id} = req.params;
  try{
    const boards = await Board.aggregate([
      {
        $match:{_id: new mongoose.Types.ObjectId(id)},
      },
      {
        $lookup: {
          from: "lists",
          localField: "_id",
          foreignField: "board_id",
          as: "lists",
          pipeline: [
            {
              $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "list_id",
                as: "tasks",
                pipeline: [
                  {
                    $lookup: {
                      from: "comments",
                      localField: "_id",
                      foreignField: "task_id",
                      as: "comments",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json(boards);
  }catch(err){
    res.status(500).json({error: err.message})
  }
};

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

    res.status(400).json({ message: "Updation failure" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.delete_board = async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let board = await Board.findById(id).session(session);

    if(!board){
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({message: "board not found"});
    }

    let lists = await List.find({board_id: board._id}).session(session);
    const list_ids = lists.map((l)=> l._id);

    let tasks = await Task.find({list_id:{$in: list_ids}}).session(session);
    const task_ids = tasks.map((t) => t._id);

    if(task_ids.length > 0){
      await Comment.deleteMany({task_id: {$in: task_ids}}, {session});
    }

    if(list_ids.length > 0){
      await Task.deleteMany({list_id: {$in: list_ids}}, {session});
    }

    if(list_ids.length > 0){
      await List.deleteMany({board_id: board._id}, {session});
    }

    const deleted_board = await Board.findByIdAndDelete(board._id, {session});

    if(!deleted_board){
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({message: "board deletion failure"});
    }

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Board deleted successfully", deleted_board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
