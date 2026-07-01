// const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);


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
  try {
    await resend.emails.send({
      from: "Cryptico <onboarding@resend.dev>",
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

    console.log("✅ Verification email sent");
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error;
  }
};

const sendMail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Cryptico <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
};



module.exports = { sendVerificationEmail, sendMail };