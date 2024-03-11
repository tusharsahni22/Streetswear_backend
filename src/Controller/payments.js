const uuid = require("uuid");
const axios = require("axios");
const crypto = require("crypto");
const PendingOrders = require("../Database/PendingOrders");
const productSchema = require('../Database/productSchema');
require("dotenv").config();

const prepareOrder = async (userId,orderDetails) => {
  const order = new PendingOrders();
  order.address = orderDetails.address;
  order.total = orderDetails.total;
  order.paymentMode = orderDetails.paymentMode;
  order.orderId =orderDetails.orderId; 
  order.user = userId;
    // Fetch the product from the database
    for (let item of orderDetails.products) {
        const product = await productSchema.findById(item.productId);
        // Check if the product exists
        if (!product) {
          return res.status(404).send({ error: 'Product not found', productId: item.productId });
        }
        // Add the product to the order
        order.items.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          color: item.color,
          size: item.size
        });
      }
    // Save the order
    try {
      await order.save();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

const payments = async (req, res) => {
    const { amount, name,orderDetails } = req.body; 
    if (!amount || !name || !orderDetails) {
      return res.status(400).send({
      message: "Missing required fields",
      success: false,
      });
    }
    const userId = req.user._id;
    if (await prepareOrder(userId,orderDetails)==true) {
     try {
    const merchantTransactionId = orderDetails.orderId;
    const data = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.userId,
      name: name,
      amount: amount * 100,
      redirectUrl: `http://localhost:3000/api/status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + process.env.SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;
    const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    axios
      .request(options)
      .then( (response)=> {
        return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url);
      })
      .catch((error)=> {
        console.error(error);
      });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
}
else {
  res.status(500).send({
    message: "Error while preparing order",
    success: false,
  });
}
};

const paymentStatus = (req, res) => {
  const merchantTransactionId = req.params.id;
  const merchantId = process.env.MERCHANT_ID;
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;
  
  const options = {
    method: 'GET',
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': `${merchantId}`
    }
    };
  axios.request(options).then(async(response) => {
    if (response.data.success === true) {
        const url = "http://localhost:5173/order/Processing-order/"+`${merchantTransactionId}`
        return res.redirect(url)
    } else {
        const url = `http://localhost:3000/failure`
        return res.redirect(url)
    }
})
.catch((error) => {
    console.error(error);
});
};
module.exports = { payments, paymentStatus };
