const mongoose = require('mongoose');
require('dotenv').config();



mongoose.connect(process.env.DB_URI).then(() => {
    console.log('Database connection successful');
}).catch(err => {
    console.error('Database connection error');
});

module.exports = mongoose;