const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const board_schema = new Schema({
    user_id : {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    board_name: {
        type:String,
        required: true,
    },
    list_order:[
        {
            type:Schema.Types.ObjectId,
            ref:"List"
        }
    ]
}, {timestamps:true});

const Board = mongoose.model("Board", board_schema);

module.exports = Board;