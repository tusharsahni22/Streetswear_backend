const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    flatDiscount: {
        type: Number,
        default: 0
    },
    percentDiscount: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date,
        required: true
    }
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = PromoCode;