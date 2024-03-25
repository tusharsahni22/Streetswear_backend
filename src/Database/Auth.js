const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    mobilenumber: {
        type: String
    },
    gender:{
        type: String
    },
    address: [{
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        landmark: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        landmark: {
            type: String
        },
        default: {
            type: Boolean,
            default: false
        }

    }],
    dob: {
        type: Date
    },

    phoneNo: {
        type: String,
        required: true
    }
});

const Auth = mongoose.model('Auth', authSchema);

module.exports = Auth;
