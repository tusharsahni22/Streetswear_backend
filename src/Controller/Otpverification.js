const OtpSchema = require("../Database/MobileOtp")
const http = require('http');


const otpGenration = async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    await OtpSchema.findOneAndUpdate({ phone: phone }, { otp: otp }, { upsert: true })

    const options = {
        "method": "POST",
        "hostname": "control.msg91.com",
        "port": null,
        "path": `/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${`91`+phone}&authkey=${process.env.MSG91_AUTH_KEY}&otp=${otp}&invisible=&otp_length=6`,
        "headers": {
          "Content-Type": "application/JSON"
        }
      };

const httpReq = http.request(options, function (httpRes) {
  const chunks = [];

  httpRes.on("data", function (chunk) {
    chunks.push(chunk);
  });

  httpRes.on("end", function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
    if (httpRes.statusCode === 200) {
        res.send(body.toString()); // send the response to the client only if the status code is 200
      } else {
        res.status(httpRes.statusCode).send('Error occurred while sending OTP');
      }
  });
});

httpReq.write("{\n  \"Param1\": \"value1\",\n  \"Param2\": \"value2\",\n  \"Param3\": \"value3\"\n}");
httpReq.end();
}

const otpVerification = async (req, res) => {
    const { otp , phone} = req.body;
    const data = await OtpSchema.findOne({ phone: phone, otp: otp })
        if (data) {
            await OtpSchema.findOneAndDelete({ phone: phone, otp: otp }).then((data) => {
            })
            res.send("Otp verified successfully");
        }
        else {
            res.status(400).send("Otp verification failed");
        }
     
}

module.exports = { otpVerification, otpGenration}