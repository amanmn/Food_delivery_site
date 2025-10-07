const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const sendOtpNodeMailer = async (to, otp) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject: "Reset Your Password",
            // text: "Hello world?", // plain‑text body
            html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`, // HTML body
        });

        console.log("Message sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error("Failed to send OTP email");
    }
};

module.exports = sendOtpNodeMailer;