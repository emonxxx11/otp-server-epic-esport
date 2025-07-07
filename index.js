const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

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


// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://epic-e-sport-default-rtdb.firebaseio.com"
});

const db = admin.database();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Helper: Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint: Send OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = generateOtp();
  const otpData = {
    otp,
    createdAt: Date.now()
  };

  try {
    // Save OTP under users/{email}/otp (replace '.' in email with ',')
    const safeEmail = email.replace(/\./g, ",");
    await db.ref(`users/${safeEmail}`).set(otpData);

    // Here you would send the OTP via email (using nodemailer or other service)
    // For now, we simulate by logging
    console.log(`Sending OTP ${otp} to email: ${email}`);

    return res.json({ message: "OTP sent successfully", otp }); // Remove otp in production for security
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint: Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const safeEmail = email.replace(/\./g, ",");
    const snapshot = await db.ref(`users/${safeEmail}`).once("value");
    const data = snapshot.val();

    if (data && data.otp === otp) {
      return res.json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Server status endpoint
app.get("/status", (req, res) => {
  res.json({ status: "Server is running" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
