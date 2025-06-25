import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route
app.post('/anfrage', async (req, res) => {
  const {
    anfrageart,
    anrede,
    vorname,
    nachname,
    email,
    telefon,
    adresse,
    nachricht
  } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_USER,
    subject: `Neue Anfrage von ${vorname} ${nachname}`,
    text: `
Neue Kontaktanfrage:

Anrede: ${anrede}
Name: ${vorname} ${nachname}
E-Mail: ${email}
Telefon: ${telefon}
Anfrageart: ${anfrageart}
Adresse: ${adresse}

Nachricht:
${nachricht}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'E-Mail erfolgreich gesendet ✅' });
  } catch (error) {
    console.error('Fehler beim Senden:', error);
    res.status(500).json({ error: 'Fehler beim E-Mail-Versand' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
});
