const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const task_schema = new Schema({
  list_id: {
    type: Schema.Types.ObjectId,
    ref: "List",
  },
  task_name:{
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    default: "Low",
    enum: ["Low", "Medium", "High"],
  },
  status: {
    type: String,
    default: "To do",   
    enum: ["To do", "In progress", "Done"],
  },
  dead_line: {
    type: Date,
    required: true,
  },
  assigned_user: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Task = mongoose.model("Task", task_schema);

module.exports = Task;
