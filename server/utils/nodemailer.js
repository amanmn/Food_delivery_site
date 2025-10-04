const nodemailer = require("nodemailer");
// const dotenv = require("dotenv")
const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const sendOtpMail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Reset Your Password",
        // text: "Hello world?", // plain‑text body
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`, // HTML body
    });

    console.log("Message sent:", info.messageId);
};

module.exports = sendOtpMail ;