const uuid = require("uuid");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();


const payments = (req, res) => {
    const {amount,name} = req.body;
  try {
    const merchantTransactionId = uuid.v4();
    const data = {
      // merchantId: process.env.MERCHANT_ID,
      merchantId: "PGTESTPAYUAT",
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.userId,
      name: name,
      amount: amount * 100,
      redirectUrl: `https://www.backend.streetswear.in/api/status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    // const string = payloadMain + "/pg/v1/pay" + process.env.SALT_KEY;
    const string = payloadMain + "/pg/v1/pay" + "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
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
      .then(function (response) {
        return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url);
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
  const merchantTransactionId = req.params.id;
  const merchantId = "PGTESTPAYUAT";
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
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
        const url = `http://localhost:3000/success`
        return res.redirect(url)
    } else {
        const url = `http://localhost:3000/failure`
        return res.redirect(url)
    }
})
.catch((error) => {
    console.error(error);
});
  res.send("Payment Status");
};

module.exports = { payments, paymentStatus };
