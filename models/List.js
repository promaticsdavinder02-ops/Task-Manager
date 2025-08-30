const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const list_schema = new Schema(
  {
    board_id: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    list_name: {
      type: String,
      required: true,
    },
    list_stage: {
      type: String,
      default: "To do",
      enum: ["To do", "In progress", "Done"],
    },
  },
  { timestamps: true }
);

const List = mongoose.model("List", list_schema);

module.exports = List;
