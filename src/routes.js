const express = require('express');
const multer = require('multer');
const { signup,login,changePassword } = require('./Controller/auth');
const authMiddleware = require('./Middleware/middleware');
const { updateUserProfile, getUserProfile,removeAddress,addAddress } = require('./Controller/UserProfile');
const { addProduct, viewProduct,viewProductById,addProductImage ,addFavorite,removeFavorite,getFavorite } = require('./Controller/product');
const { addOrder, getOrder, getOrderById ,pendingorders,transferOrder } = require('./Controller/order');
const {payments, paymentStatus}  = require("./Controller/payments")
const {otpVerification,otpGenration} = require("./Controller/Otpverification")

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
router.route("/changePassword").post(authMiddleware,changePassword);

// Routes for Product Page
router.route('/viewProduct').get(viewProduct);
router.route('/viewProduct/:id').get(viewProductById);
router.route('/uploadnewproduct').post(upload.fields([{ name: 'pic', maxCount: 1 }, { name: 'altpicture', maxCount: 3 }]), addProductImage, addProduct);

//protected routes for profile page with authMiddleware
router.route('/updateProfile').post(authMiddleware,updateUserProfile);
router.route('/getProfile').get(authMiddleware,getUserProfile);
router.route("/removeAddress").post(authMiddleware,removeAddress);
router.route("/addAddress").post(authMiddleware,addAddress);

// route for order page
router.route('/orders').post(authMiddleware,addOrder);
router.route('/orders').get(authMiddleware,getOrder);
router.route('/orders/:id').get(authMiddleware,getOrderById);
router.route('/pendingorders/:id').get(authMiddleware,pendingorders);
router.route('/transferorder/:id').get(authMiddleware,transferOrder);

// router.route('/orders/:id').put(authMiddleware,updateOrder);
// router.route('/orders/:id').delete(authMiddleware,deleteOrder);

// route for payment page
router.route('/payments').post(authMiddleware,payments);
router.route('/status/:id').post(paymentStatus);

// route for otp verification
router.route('/otp').post(otpGenration);
router.route('/otpverification').post(otpVerification);

// favorite page
router.route('/favorites').post(authMiddleware,addFavorite);
router.route('/favorites').get(authMiddleware,getFavorite);
router.route('/favorites').delete(authMiddleware,removeFavorite);


module.exports = router;
