const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const user_schema = new Schema({
    user_name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
}, {timestamps: true});

const User = mongoose.model("user", user_schema);

module.exports = User;