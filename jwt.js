const jwt = require('jsonwebtoken');
const jwtAuthMiddleware = (req,res,next) => {
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({errors: 'Token not found'});
    //checking token has authorization or not

    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({ errors: 'unauthorized' });
    // extract jwt token

    try{
        // verify jwt token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach user information to the request object
        req.user = decoded
        next();
    }catch(err){
        console.error(err);
        res.status(401).json({error:'invalid token'});
    }
}

// Funtion to generate JWT token 

const generateToken = (userData) => {
    // generate a new JWT token using user data 
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn:30000})

}
module.exports = {jwtAuthMiddleware, generateToken};