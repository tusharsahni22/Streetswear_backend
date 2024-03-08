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
    console.log(response.data);
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
};

module.exports = { payments, paymentStatus };
