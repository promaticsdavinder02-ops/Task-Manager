const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comment_schema = new Schema({
    task_id:{
        type:Schema.Types.ObjectId,
        ref: 'Task',
    },
    comment:{
        type:String,
        required:true,
    }
}, {timestamps:true});

const Comment = mongoose.model("Comment", comment_schema);

module.exports = Comment;