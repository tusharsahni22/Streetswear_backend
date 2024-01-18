const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    mainPicture:{
        type: String,
        required: true,
    },
    size:[{
        type: String,
        required: true,
    }],
    description:{
        type: String,
        required: true,
    },
    specification:{
        type: String,
        required: true,
    },
    stock:{
        type: Number,
        required: true,
    },
    altPictures: [
        {
            type: String,
            required: true,
        }
    ],
    category:{
        type: String,
        required: true,
    },
    });

module.exports = mongoose.model('Product', productSchema);