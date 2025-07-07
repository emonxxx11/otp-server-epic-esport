const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

// Firebase service account details (hardcoded)
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

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://epic-e-sport-default-rtdb.firebaseio.com"
});

// Setup nodemailer with your Gmail account
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'epicesporthelp@gmail.com',
    pass: 'yhgrxiljtgnbptdk' // Your Gmail app password or actual password
  }
});

// Example route to send OTP email
app.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  const mailOptions = {
    from: 'epicesporthelp@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).send({ error: 'Failed to send OTP' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
