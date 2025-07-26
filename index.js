const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firebase service account (hardcoded)
const serviceAccount = {
  "type": "service_account",
  "project_id": "epic-e-sport",
  "private_key_id": "63f9a5bfa56a260cce653e65cfa144e6961d0b34",
  "private_key": `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDRpWmC0bM7l3sD
M/Jaw7a4yYsRG2xVvSdg70aNdsvb/p4BO9TSD78KUx9xBabzf8/wkm8ofiKq4Hj9
vwTBWtUBwMxYxUdUJTKYYYmucWvMAQspVvy5FoccvdOVOGB1FKu4DV4xbZucK1GT
b1nkbdnoutKbSUroSUVdxhwIjWuGO9C6JxvgGR4r75C9zSkyLYjLd/j4p2fs0KW2
9/xbF85sAW/tQQEZxfIL//11XWOgq565wZFM4Jiz5QrQjwXaX9gDrb4xPGgZi8/q
xmE8pMqqMTb/MXHjHBH1tUuTFYxl1hoXTsGztryZGsrGOxZaQSjkd08PlH9U+ho1
WQ/r9k1JAgMBAAECggEATGirUgC4AIovTXWLaUVXvXXHd86053LvfUb4QesAVggw
8mYqJP2UNWEiXoEe3jTBRv84AFwoqnrx3hnW09oVNHRehiQw4RxFmoBCPBAep9Xh
iYmoxpTNXc5Z5VMM5N9JzuUgZYd7ZansK340FytqdoZQ6EQIRy0dWRYxdXSFsgBG
LcdbE8G/ss/n/mM2Qy0wGvJTNtohIlVQk+38Acii5ug7kT7fcvxj3NfWmnsaiMzw
c1I40Se/gH91uh8q2OfXI2FzimfsuENcAP2K+IidMLT2uHQfOAZwCDGI7f4xep4d
tNEPI4b9BkOjTaupAnnoz0kmvencGz7DCPQxCQ8ruQKBgQDn1D/uPMF1FjcYydiZ
gyqyEQWExQsv7IVDCmMWpJJmc4qKkrPbG/dH2rVk+n2QalnG1/5PoWZwtAhK6MAm
t7ecqm6yTE4twSSzdvmW8IcPP8tqJB7otXefK7WeuaHi0Kc0rCr0nMhzQV6G9IuV
GuIQdDHs6u263zKDEO9QoahuKwKBgQDngRO7l1RzeDKpZpPcPu69hOXAeggfml2S
+cN6APrdCGZoPgmzW5Z5ZJbCuak4BdFOAhnlWvXv7CcxBfUv8fL5yW54+rFngdYJ
AcUS8LMd2mUI4WMBxVe1vuZkIAEY4wTATeTjsob2kXQC/DPcERrEkkn9264DJWN2
vD8c4ldsWwKBgCoR7WwZYG4UEvmPn5v0HqpjxmGatHYE8QYCe4rfYKXw78JH7xWj
FJPYj7R8dI7hjds01TS0MHfhY+PcKwqbqllm4GHA0SsicruSqqaGjavpwstHNMi8
LbIX54SfYU5c2QsI916emQ25XiMVe8MaNs4PmAPLekrAOFVqnFNAkuUzAoGBANJM
kS5iBBd44xy70CnNCXckGMnGkUaUJdj0Brz30uujS9P6Nzm1Q3Y3CDUQD0aTElW4
1ulgvfUbI2cHMHpDYiPC9hX0Nd//M/2um+XevfeqgwmUJSpgqJKzPftKj3SaFaDT
oc+uR6gI7cggbsPEzfovogN34hV9i2M7EmIcwqntAoGBAMpX6OLJcN49PUCBwPRt
6WtNGGBdcXiYIfYnrfHaf8/lhXfKdHp3ENLuO8dFwssNI7jC2yBY0yUDhsvf+RXl
1m6x4qLb/S4PFt4TZp+lmsahf8gkqmQOblPV+Jw9hIZIGSXXj/miUneaM9JyCaxW
UodORU7RBePeGmZVkvCkTs1D
-----END PRIVATE KEY-----
`,
  "client_email": "firebase-adminsdk-fbsvc@epic-e-sport.iam.gserviceaccount.com",
  "client_id": "105289591999658971800",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40epic-e-sport.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://epic-e-sport-default-rtdb.firebaseio.com"
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'epicesporthelp@gmail.com',
    pass: 'urrvgqqownuofpvg'
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Server is live!');
});

// Generate OTP helper
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP route
app.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = generateOtp();

    // Store OTP in Firebase RTDB (replace '.' in email with ',')
    const emailKey = email.replace(/\./g, ',');
    await admin.database().ref(`otps/${emailKey}`).set({
      otp,
      createdAt: Date.now()
    });

    // Send OTP email
    await transporter.sendMail({
      from: 'epicesporthelp@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP route
app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const emailKey = email.replace(/\./g, ',');
    const snap = await admin.database().ref(`otps/${emailKey}`).once('value');

    if (!snap.exists()) return res.status(400).json({ error: 'OTP not found or expired' });

    const data = snap.val();

    // Optionally: check OTP expiry (e.g., 5 mins)
    const isExpired = (Date.now() - data.createdAt) > 5 * 60 * 1000; 
    if (isExpired) {
      await admin.database().ref(`otps/${emailKey}`).remove();
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (data.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP verified, remove it
    await admin.database().ref(`otps/${emailKey}`).remove();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
