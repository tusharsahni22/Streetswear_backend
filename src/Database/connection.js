const mongoose = require('mongoose');
require('dotenv').config();

// const client = new MongoClient(process.env.DB_URI, {useUnifiedTopology: true});
// ,{ useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(process.env.DB_URI).then(() => {
    console.log('Database connection successful');
}).catch(err => {
    console.error('Database connection error',err);
});

module.exports = mongoose;