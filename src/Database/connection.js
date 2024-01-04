const mongoose = require('mongoose');
require('dotenv').config();

// const client = new MongoClient(process.env.DB_URI, {useUnifiedTopology: true});

mongoose.connect(process.env.DB_URI,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Database connection successful');
}).catch(err => {
    console.error('Database connection error');
});

module.exports = mongoose;