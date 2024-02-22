const uuid = require("uuid");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();


const payments = (req, res) => {
    const {amount,name} = req.body;
  try {
    const merchantTransactionId = uuid.v4();
    const data = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.userId,
    //   name: name,
      amount: amount * 100,
      redirectUrl: `http://localhost:3000/api/status/${merchantTransactionId}`,
      redirectMode: "POST",
    //   mobileNumber: req.body.number,
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

    // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
    const prod_URL = "https://api-preprod.phonepe.com/apis/hermes";
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
      .then(function (response) {
        console.log(response.data);
        return res.redirect(
          response.data.data.instrumentResponse.redirectInfo.url
        );
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

const paymentStatus = (req, res) => {
  res.send("Hello from paymentStatus");
};

module.exports = { payments, paymentStatus };
