const express = require('express');
const multer = require('multer');
const { signup, login } = require('./Controller/auth');
const authMiddleware = require('./Middleware/middleware');
const { updateUserProfile, getUserProfile } = require('./Controller/UserProfile');
const { addProduct, viewProduct,addProductImage ,addFavorite,removeFavorite,getFavorite } = require('./Controller/product');
const { addOrder, getOrder, getOrderById } = require('./Controller/order');

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
router.route('/viewProduct').get(viewProduct);
// router.route('/uploadnewproduct').post(upload.fields([{"pic"},{"altpicture",2}]),addProductImage,addProduct);
router.route('/uploadnewproduct').post(upload.fields([{ name: 'pic', maxCount: 1 }, { name: 'altpicture', maxCount: 3 }]), addProductImage, addProduct);
//protected routes for profile page
router.route('/updateProfile').post(authMiddleware,updateUserProfile);
router.route('/getProfile').get(authMiddleware,getUserProfile);
// route for order page
router.route('/orders').post(authMiddleware,addOrder);
router.route('/orders').get(authMiddleware,getOrder);
router.route('/orders/:id').get(authMiddleware,getOrderById);
// router.route('/orders/:id').put(authMiddleware,updateOrder);
// router.route('/orders/:id').delete(authMiddleware,deleteOrder);

// favorite page
router.route('/favorites').post(authMiddleware,addFavorite);
router.route('/favorites').get(authMiddleware,getFavorite);
router.route('/favorites').delete(authMiddleware,removeFavorite);


module.exports = router;
