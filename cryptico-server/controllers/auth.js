const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetMail } = require("../utils/mailer");
const generateCode = require("./generateCode");

// ─── REGISTER  USER ────────────────────────────────
const register = async (req, res) => {
  try {
    const {
      fullName,
      userName,
      email,
      password,
      phoneNumber,
      country,
      referredBy,
    } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Check if username already exists
    const userNameExists = await User.findOne({ userName });

    if (userNameExists) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit verification code
    const verificationCode = generateCode();

    // Create the user
    const user = await User.create({
      fullName,
      userName,
      email,
      password: hashedPassword,
      phoneNumber,
      country,
      referredBy,

      // Email verification fields
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      emailVerificationLastSent: new Date() // track when code was sent
    });


    // ------------------------------------------------------------------
    // SEND EMAIL HERE
    // await sendVerificationEmail(user.email, user.fullName, verificationCode);
    sendVerificationEmail(user.email, user.fullName, verificationCode).catch(err => {
      console.error("Email failed:", err);
    });


    // Send response back to frontend
    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      email: user.email,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// ─── REGISTER  ADMIN ────────────────────────────────
const registerAdmin = async (req, res) => {
  try {
    const {
      fullName,
      userName,
      email,
      password,
      phoneNumber,
      role,
    } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Check if username already exists
    const userNameExists = await User.findOne({ userName });

    if (userNameExists) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await User.create({
      fullName,
      userName,
      email,
      password: hashedPassword,
      phoneNumber,
      country: 'none',
      role,
      emailVerified: true,
    });

    // Send response back to frontend
    return res.status(201).json({
      message: "Registration successful"
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// ─── LOGIN ───────────────────────────────────
const login = async (req, res) => {
  try {
    // 1. Normalize input
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in"
      });
    }

    // 6. Update last login (NEW)
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        role: user.role,
        balance: user.balance,
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── VERIFY EMAIL ────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and verification code are required"
      });
    }

    // 1. Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 2. Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email already verified"
      });
    }

    // 3. Check expiry
    if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        message: "Verification code has expired"
      });
    }

    // 4. Check code match
    if (user.emailVerificationCode !== code) {
      return res.status(400).json({
        message: "Invalid verification code"
      });
    }

    // 5. Activate user
    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully"
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ─── RESEND EMAIL VERIFICATION CODE ────────────────────────────
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    // Prevent spam requests
    if (user.emailVerificationLastSent) {
      const secondsSinceLastRequest =
        (Date.now() - user.emailVerificationLastSent.getTime()) / 1000;

      if (secondsSinceLastRequest < 60) {
        const remaining = Math.ceil(
          60 - secondsSinceLastRequest
        );

        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting another code`
        });
      }
    }

    // Generate new 6-digit code
    const verificationCode = generateCode();

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires =
      Date.now() + 10 * 60 * 1000; // 10 mins

    user.emailVerificationLastSent = new Date();

    await user.save();

    await sendVerificationEmail(
      user.email,
      user.fullName,
      verificationCode
    );

    return res.status(200).json({
      message: "Verification code resent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// ─── RESET PASSWORD ────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Don't reveal whether the email exists
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a reset code has been sent.",
      });
    }

    // Generate 6-digit code
    const resetCode = generateCode()

    // Save code and expiry
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send email
    await sendPasswordResetMail(
      user.email,
      user.fullName,
      resetCode
    );

    return res.status(200).json({
      message: "Password reset code sent successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and verification code are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
      });
    }

    // Clear the code immediately
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Create temporary reset token
    const resetToken = jwt.sign(
      {
        id: user._id,
        purpose: "password-reset",
      },
      process.env.RESET_PASSWORD_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      message: "Verification successful.",
      resetToken,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

const passwordReset = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Reset token is missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Reset session has expired or is invalid.",
      });
    }

    // Extra security check
    if (decoded.purpose !== "password-reset") {
      return res.status(401).json({
        message: "Invalid reset token.",
      });
    }

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear any old reset code
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. You can now log in.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

module.exports = { register, login, verifyEmail, registerAdmin, resendVerificationCode,forgotPassword, passwordReset, verifyResetCode }