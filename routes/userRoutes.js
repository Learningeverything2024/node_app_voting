const express = require('express')
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

//post route to add a User
router.post('/signup', async (req,res) => {
    try {
        //assuming the request body have some data 
        const data = req.body 

        //create new User using user moongose model
        const newUser = new User(data);

        // save new User in db 
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
           // username: response.username
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// login route
router.post('/login',async(req,res) => {
    try{
        //extract aadharCardNumber and password from request body
        const {aadharCardNumber,password} = req.body;

        //find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // if user does not exist or password does not match, return error
        if(!user || !(await user.comparedPassword(paswword))){
            return res.status(401).json({error: 'Invalid Id or Password'})
        }

        //generate token 
        const payload = {
            id: response.id,
           // username: response.username
        }
        const token = generateToken(payload);

        // return token as response 
        res.json({token})

    }
    catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});

    }
})

//Get method to get the user
router.get('/',jwtAuthMiddleware,async(req,res) => {
    try{
        const data = await user.find();
        console.lof('data fetched');
        res.status(200).json(data);

    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/profile/password',jwtAuthMiddleware, async(req,res) => {
    try{
        const userId = req.user; // Extract the Id from the token
        const {currentPassword, newPassword} = req.body // extract current and new password

        // Find the user by userId
        const user = await User.findById(UserId);

        // if Password does not match, return error
        if(!await user.comparedPassword(currentPassword)){

        
            return res.status(401).json({error: 'Invalid Username or Password'});
        }

        //Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: "Password updated"});

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

module.exports = router;