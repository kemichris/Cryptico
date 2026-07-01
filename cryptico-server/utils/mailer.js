const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

(async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP server is ready");
  } catch (error) {
    console.error("❌ SMTP verification failed:", error);
  }
})();
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

const sendVerificationEmail = async (email, name, code) => {
  await transporter.sendMail({
    from: `"Cryptico" <${process.env.EMAIL_USER}>`,
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

const sendMail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });
};


module.exports = { sendVerificationEmail, sendMail };