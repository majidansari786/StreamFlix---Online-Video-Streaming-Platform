const User = require('../model/user')
const checkRole = (allowedRoles)=>{
    return async (req,res,next)=>{
        const refreshToken = req.cookies.refreshToken;
        const user = await User.findOne({refreshToken: refreshToken});
        const role = user.role;
        if(!allowedRoles.includes(role)){
            return res.status(403).json({error:"Not authorized"});
        }
        next();
    }
}

module.exports = checkRole