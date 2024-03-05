const OtpSchema = require("../Database/MobileOtp")
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);


const otpGenration = async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    await OtpSchema.findOneAndUpdate({ phone: phone }, { otp: otp }, { upsert: true })

    client.messages
        .create({
            body: `Your otp is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91`+phone
        })
        .then(message => console.log(message.sid));
    res.send("Otp successfully sent to your mobile number");
}

const otpVerification = async (req, res) => {
    const { otp , phone} = req.body;
    const data = await OtpSchema.findOne({ phone: phone, otp: otp })
        if (data) {
            await OtpSchema.findOneAndDelete({ phone: phone, otp: otp }).then((data) => {
                console.log(data);
            })
            res.send("Otp verified successfully");
        }
        else {
            res.status(400).send("Otp verification failed");
        }
     
}

module.exports = { otpVerification, otpGenration}