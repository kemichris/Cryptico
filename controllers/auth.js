const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require("../utils/mailer");

// ─── REGISTER ────────────────────────────────
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
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

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



module.exports = { register, login, verifyEmail }