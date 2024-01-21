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
        cb(null, Date.now() + file.originalname );
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
// router.route('/addProduct').post(addProduct);
router.route('/viewProduct').put(viewProduct);
// router.route('/uploadnewproduct').post(upload.fields([{"pic"},{"altpicture",2}]),addProductImage,addProduct);
router.route('/uploadnewproduct').post(upload.fields([{ name: 'pic', maxCount: 1 }, { name: 'altpicture', maxCount: 3 }]), addProductImage, addProduct);
//protected routes for profile page
router.route('/updateUser').post(authMiddleware,updateUserProfile);
router.route('/getUser').get(authMiddleware,getUserProfile);

module.exports = router;
