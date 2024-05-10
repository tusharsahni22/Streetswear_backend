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
    priceAfterDiscount: {
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
    specification:[{
        type: String,
        required: true,
    }],
    stock:[
        {
            type: Map,
            of: Number,
            required: true,
        }
    ],
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
    color:[{
        type: String,
        required: true,
    }],
    limitedEdition:[{
        type: Boolean,
        default: false,
    }],
    createdAt:{
        type: Date,
        default: Date.now,
    },
    colorToIndexMap:[{
        type: Map,
        of: Number,
        required: true,
    }],
    });

module.exports = mongoose.model('Product', productSchema);