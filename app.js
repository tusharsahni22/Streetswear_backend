const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
require('./src/Database/connection');

const port = process.env.PORT || 3001;

// Import routes
const routes = require('./src/routes');

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// Use routes
app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});