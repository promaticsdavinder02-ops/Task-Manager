const jwt = require("jsonwebtoken");

module.exports.auth = (req, res, next) =>{
    const token = req.header('Authorization').split(" ")[1];
    if(!token){
        return res.status(401).json({message: "Access denied"});
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    }catch(err){
        res.status(400).json({message: "invalid token", error: err.message})
    }
}