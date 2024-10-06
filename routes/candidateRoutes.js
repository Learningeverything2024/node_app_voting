const express = require('express')
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const Candidate = require('./../models/candidate');

const checkAdminRole = async (userId) =>{
try {
    const user = await User.findById(userId);
    if( user.role === 'admin'){
        return true;
    }
}
catch(err){
    return false;
}
}

//POST method to add a candidate
router.post('/',jwtAuthMiddleware,async(req,res) => {
    try{
        if (!(await checkAdminRole(req.user.id))){
            return res.status(404).json({message: 'user does not has admin role'});

        }
            // assuming req body has some candidate data
        const data = req.body; 
            // save the new user to the db 
        const newCandidate = new Candidate(data);

        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});

       }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateId',jwtAuthMiddleware,async(req,res) => {
    try{
        if (!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user does not has admin role'});

        }
    
        const candidateId = req.params.candidateId; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(403).json({ error: 'Candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateId = req.params.candidateId; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
//voting 
router.get('/vote/:candidateId', jwtAuthMiddleware,async (req,res)=>{
// no admin can vote
// user can only vote once

    candidateId = req.params.candidateId;
    userId = req.user.id;

    try{
        // find candidate document with specified candidateId
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message:"candidate not found"});
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"user not found"});
        }
        if(user.isVoted){
            res.status(400).json({message:'you have already voted'});
        }
        
        if(user.role == 'admin'){
            res.status(403).json({message:'admin is not allowed'})
        }

        //update the candidate to record the vote
        candidate.votes.push({user:userId})
        candidate.voteCount++;
        await candidate.save();

        //update user 
        user.isVoted = true;
        await user.save();
        res.status(200).json({message:'vote recorded successfully'});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
        }
});

//vote count

router.get('/vote/count',async (req,res)=>{
    try {
        const candidate = await Candidate.find().sort({voteCount : 'desc'});
        const voterecord = candidate.map((data) => { 
            return {
                party: data.party,
                count: data.voteCount
            }
        });
        return res.status(200).json(voterecord)

    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});      
    }
});
    // Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
