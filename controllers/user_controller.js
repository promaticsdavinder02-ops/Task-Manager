const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


module.exports.user_register = async (req, res) => {
    console.log(req.body);
    let {user_name, password} = req.body;
    try{
        let existing_user = await User.findOne({user_name});
        if(existing_user){
            return res.status(400).json({message: "User is already existed"});
        }

        const hashed_password = await bcrypt.hash(password, 10);
        const new_user = new User({
            ...req.body,
            password: hashed_password,
        });

        await new_user.save();

        res.status(201).json({message: "User created successfully"});

    }catch(err){
        res.status(500).json({error: err.message});
    }
}

module.exports.user_login = async (req, res) => {
    let {user_name, password} = req.body;
    try{
        const user = await User.findOne({user_name});
        if(!user){
            return res.status(400).json({message: "invalid user_name"});
        }

        const is_match = await bcrypt.compare(password, user.password);
        if(!is_match){
            return res.status(400).json({message: "invalid password"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '5d'});
        res.status(200).json({
            token,
            message:"login successfully"
        })


    }catch(err){
        res.status(500).json({error: err.message});
    }

}

module.exports.user_profile = async (req, res) => {

    try{
        const { id } = req.params;

        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        res.status(200).json({
            user_name: user.user_name,
            email: user.email
        })
    }catch(err){
        res.status(500).json({error:err.message});
    }

}