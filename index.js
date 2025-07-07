require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

// 🔐 Firebase Admin Setup using ENV
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  }),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// 📧 Nodemailer setup with Gmail app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔢 Generate 6-digit OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// ✅ Send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const otp = generateOtp();
  const safeEmailKey = email.replace(/[.#$[\]]/g, '_');
  const otpData = { otp, createdAt: Date.now() };

  try {
    await db.ref(`otps/${safeEmailKey}`).set(otpData);

    const mailOptions = {
      from: `"EPIC E-SPORT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}\nThis code will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
  }
});

// ✅ Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

  const safeEmailKey = email.replace(/[.#$[\]]/g, '_');
  const otpRef = db.ref(`otps/${safeEmailKey}`);

  try {
    const snapshot = await otpRef.once('value');
    const data = snapshot.val();

    if (!data) return res.status(400).json({ success: false, message: 'OTP not found. Request a new one.' });

    const isExpired = Date.now() - data.createdAt > 5 * 60 * 1000;
    if (isExpired) {
      await otpRef.remove();
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    if (data.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    await otpRef.remove();
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: err.message });
  }
});

// 🌐 Health check route
app.get('/', (req, res) => {
  res.send('✅ OTP Server is Live!');
});

// 🔥 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
