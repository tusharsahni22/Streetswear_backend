const express = require('express');
const { signup, login } = require('./Controller/auth');
const authMiddleware = require('./Middleware/middleware');
const { updateUserProfile } = require('./Controller/UserProfile');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.send('Hello World!');
});

//auth routes
router.route('/signup').post(signup);
router.route('/login').post(login);

//protected routes for profile page
router.route('/loginn').post(authMiddleware,updateUserProfile);
module.exports = router;
