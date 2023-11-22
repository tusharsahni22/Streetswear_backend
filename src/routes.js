const express = require('express');
const { signup, login } = require('./Controller/auth');
const authMiddleware = require('./Middleware/middleware');
const { updateUserProfile, getUserProfile } = require('./Controller/UserProfile');
const { addProduct, viewProduct } = require('./Controller/product');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.send('Hello World!');
});

//auth routes
router.route('/signup').post(signup);
router.route('/login').post(login);

// Routes for Product Page
router.route('/addProduct').post(addProduct);
router.route('/viewProduct').post(viewProduct);

//protected routes for profile page
router.route('/updateUser').post(authMiddleware,updateUserProfile);
router.route('/getUser').get(authMiddleware,getUserProfile);

module.exports = router;
