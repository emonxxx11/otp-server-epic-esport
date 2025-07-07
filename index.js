// index.js
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

// Your Firebase service account JSON (paste exactly as given)
const serviceAccount = {
  "type": "service_account",
  "project_id": "epic-e-sport",
  "private_key_id": "8ab81fdd6a61e135b79a2e824266043e6f2214c1",
  "private_key": `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCHJYuTJ+/GdO+L
+0lULMBaEEDqehJa6HPn0SyC/wv++kf0NAJNWu7Ev4EXYYEEPzHCtZqeYHNirtyf
a0soCKRwC9Wi8ChKikNTeDQGQNzIJ3lua4WIRaFW/MRGh9XPHv6Mg72p5D5gj3mO
eqgEJhcLSSh4Jtr7Scke8Hj0nVkSSmElhId5OcpB8o4XhaVxSiEP2nbrnEikvVNZ
DUEvMHJ31tFvw/A7h4XwpyC/baOzXbzwL2MWDg/fFcxTVDq4aDUaOUxZJlX7MUca
HKBKzCyZMNVXhqWzdYMWMhrMQWdWm3TFNxZZeVIwGA8w7TSGv75x0zVMG5t2Oruj
v6yRN4+pAgMBAAECggEABBgTE7DQsVu21gVqwe4JIFwAW29klvRrw8ixEdbVb4f4
HgxlSsqdE8C+vGKWcfZ9dL849otIHjkwiHPLobmBTGj6CSbqpuIWtV9IKYMALTVk
7FS9hX9L1ULFqg1QtibjjIYr0gsOs1t6pzeirLLVXTYoz7BS+ex7oer5qboKig9D
ftivKoQMJ5K/pRJQubR+2z/RURe2v4erDNP0/0zVcT1HJRU+WuzQ85W80WQFlYE1
Hb2U+e0U8gkSTdXpgrhD5NOjLXYCMS9QFTLjaLcpmmZyzx2IdzUGEJ01pMYYg923
sjjFGQ5o3YM6CcS3aUsVp4AEVUojqxUuoogwVdHLcQKBgQC+1Hf1EBmFj/+X4g7M
kaXpzEEWs7Yr8ROMqxLU3lwq4YzzMnU3gvCiXPZeQ6sbuJqhVqEEw+baPvHblFfP
ot/VSfWwofzZ9hwUHA/5mqzoxIJ73xJ4NhsGD3X/RM2LJvhuIqoS52A0rXlolgka
yBFjbbqNf9/RNA/7T40MYNJ0NwKBgQC1TOZRAmoyWQg1rFtzbwsgxkNW0SASe9Gs
p5Kv+qEfFrYiBLF6+jNb39n4aL1VaG+OlUD+nulKBt1oCF8EXKdT+05wa4hu4qzZ
AiLsXqQJsJHTVl45md+Rckhz/Omi2mqwrdaDo9lBG/eYYPCry8UDg/d+teh0IxxC
g80ppNvrHwKBgDhZVPKwRlkCJF8dCXGusGdRQQcLGgfvr+4htfXVkzG2WICXrbUu
nQ/Uk4tSP/x3jnGFuxZFIq3fWFuWejd9yMqahEocCyXxXmkxwCXcXqJ9JGqffDyy
/VfUyOsPzgIBB+q9oarjV602bFtNsnKOEVRi2mteDyEfVnjHDMdS79IRAoGAQ6pr
25hXImtwUPf/OdocASN+RozOt5dW7mWsrdmRARVs7M1roEZ5nLSzma8d2x6bZE/4
bg/JakOdpxJYxDwAh6un3vWDej9H28acWjQIbUVlZ8c4a68ubg6FVCT03j8+yqpX
AdLJZy+U/V5Q9Q2cfm9mk/g4xf/EsF6Y2A4btmkCgYEAl35P5RE+qxTDEyky3LWZ
NWavALSpwS6IRn8R0Jgx3ovWlw0GXf9YOY8f62mSqNu5earYrG0YE13zJIvZiZ+j
Jsk/IexU3BKBfsJvq0fpIJGYsomLclVCCaL6jYI4j+VlR7oP92JhxSoP2h530fGo
yZv6Gfh8qCjh4bhn2wJ/cJM=
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

const db = admin.database();

const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

app.use(cors());
app.use(bodyParser.json());

// Nodemailer transporter (your gmail + app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "epicesporthelp@gmail.com",
    pass: "yhgrxiljtgnbptdk",  // app password or actual password (prefer app password)
  },
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /send-otp : generate OTP, save in Firebase, send email
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const otp = generateOTP();

    // Firebase key can't contain ".", replace with ","
    const key = email.replace(/\./g, ",");

    await db.ref("otps").child(key).set({
      otp,
      createdAt: Date.now(),
    });

    const mailOptions = {
      from: '"Epic E-Sport" <epicesporthelp@gmail.com>',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}\nIt expires in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /verify-otp : check OTP in Firebase
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

  try {
    const key = email.replace(/\./g, ",");
    const snapshot = await db.ref("otps").child(key).get();

    if (!snapshot.exists()) {
      return res.status(400).json({ error: "No OTP found for this email" });
    }

    const data = snapshot.val();

    // Check expiry: 5 minutes
    if (Date.now() - data.createdAt > 5 * 60 * 1000) {
      await db.ref("otps").child(key).remove(); // cleanup expired
      return res.status(400).json({ error: "OTP expired" });
    }

    if (data.otp === otp) {
      await db.ref("otps").child(key).remove(); // OTP used, remove it
      return res.json({ message: "OTP verified" });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Root route - simple live check
app.get("/", (req, res) => {
  res.send("OTP Server is live!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
