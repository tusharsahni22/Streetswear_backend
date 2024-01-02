const express = require('express');
const multer = require('multer');
const { signup, login } = require('./Controller/auth');
const authMiddleware = require('./Middleware/middleware');
const { updateUserProfile, getUserProfile } = require('./Controller/UserProfile');
const { addProduct, viewProduct,addProductImage } = require('./Controller/product');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + Date.now() + file.originalname );
    }
});
const upload = multer({ storage: storage });

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
router.route('/uploadPicture').post(upload.array('pic',5) ,addProductImage);

//protected routes for profile page
router.route('/updateUser').post(authMiddleware,updateUserProfile);
router.route('/getUser').get(authMiddleware,getUserProfile);

module.exports = router;
