const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, name, code) => {
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification Code",
    html: `
      <div style="font-family: Arial;">
        <h2>Hello ${name}</h2>
        <p>Your verification code is:</p>
        <h1 style="color:#1e88e5">${code}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };