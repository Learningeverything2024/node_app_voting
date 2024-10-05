const mongoose = require('mongoose');
require('dotenv').config();

//define the MongoDb connection url
const mongoURL = process.env.MONGODB_URL_LOCAL;

//set up MongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//get the default connection
// mongoose maintain a default connection object representing the mongoDB connection
const db = mongoose.connection;

// define event listners for DB connections
db.on ('connected',()=>{
    console.log('connected to mongoDB server');

});

db.on('error', (err) => {
    console.log('MongoDB connection error',err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Export the database connection
module.exports = db;
