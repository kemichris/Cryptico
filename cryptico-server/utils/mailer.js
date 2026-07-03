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

// Send email verification code
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

// Send email to users
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

// send password reset mail 
const sendPasswordResetMail = async (email, name, code) => {
  try {
    await resend.emails.send({
      from: "Cryptico <onboarding@resend.dev>",
      to: email,
      subject: "Account Reset",
      html: `
        <div style="font-family: Arial;">
          <h2>Hello ${name}</h2>

          <p>Your Account reset code is:</p>

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

// send Investment topUp mail 
const sendProfitTopupEmail = async (
  email,
  fullName,
  investment,
  profit
) => {
  const subject = "Profit Top up";

  const html = `
    <p>Hi ${fullName},</p>

    <p>A profit of <strong>$${profit.toFixed(2)}</strong> has just been credited to your investment.</p>

    <p><strong>Investment Plan:</strong> ${investment.plan.name}</p>

    <p>You can log in to your Cryptico dashboard to monitor your investment performance.</p>

    <p>Thank you for choosing <strong>Cryptico</strong>.</p>

    <hr>

    <small>
      This is an automated email. Please do not reply to this message.
    </small>
  `;

  await sendMail({
    to: email,
    subject,
    html,
  });
};

// send complete investment mail 
const sendInvestmentCompletedEmail = async (
  email,
  fullName,
  investment
) => {
  const subject = "Investment Completed";

  const html = `
    <p>Hi ${fullName},</p>

    <p>Your investment has been completed successfully.</p>

    <p><strong>Investment:</strong> ${investment.plan.name}</p>

    <p>You can now review your investment details and returns from your Cryptico dashboard.</p>

    <p>Thank you for investing with <strong>Cryptico</strong>.</p>

    <hr>

    <small>
      This is an automated email. Please do not reply to this message.
    </small>
  `;

  await sendMail({
    to: email,
    subject,
    html,
  });
};


module.exports = { sendVerificationEmail, sendMail, sendPasswordResetMail, sendProfitTopupEmail, sendInvestmentCompletedEmail };