const Board = require("../models/Board");
const List = require("../models/List");

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
    let {id} = req.params;
  try {
    let list = await List.findById(id);

    if(!list){
        return res.status(400).json({message: "list not found"});
    }

    let delete_list = await List.findByIdAndDelete(list._id);
    
    if(!delete_list){
        return res.status(400).json({message: "deletion failure"});
    }
    let updated_board_list_order = await Board.findByIdAndUpdate(
        list.board_id,
        {$pull : {list_order: list._id}}
    );

    if(!updated_board_list_order){
        return res.status(400).json({message: "list order updation failure"});
    }

    res.status(200).json({message: "List deleted successfully", delete_list});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.reorder_list = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
