import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Datei-Upload (max. 5 MB)
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST-Route fürs Kontaktformular
app.post('/anfrage', upload.single('datei'), async (req, res) => {
  const {
    anrede,
    vorname,
    nachname,
    email,
    phone,
    adresse,
    anfrageart,
    projektart,
    qm,
    beschreibung
  } = req.body;

  try {
    // E-Mail-Versand vorbereiten (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Fliesenleger Limani" <kontakt@limani-fliesenleger.de>`,
      to: process.env.MAIL_USER, // Du bekommst die Mail selbst
      replyTo: email, // ← vom Formular kommt
      subject: `Neue Anfrage von ${vorname} ${nachname}`,
      html: `
        <h3>Neue Anfrage von der Website</h3>
        <p><strong>Anrede:</strong> ${anrede}</p>
        <p><strong>Name:</strong> ${vorname} ${nachname}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Adresse:</strong> ${adresse}</p>
        <p><strong>Anfrageart:</strong> ${anfrageart}</p>
        <p><strong>Projektart:</strong> ${projektart}</p>
        <p><strong>Quadratmeter:</strong> ${qm}</p>
        <p><strong>Beschreibung:</strong><br>${beschreibung}</p>
      `,
      attachments: req.file
        ? [
            {
              filename: req.file.originalname,
              content: req.file.buffer
            }
          ]
        : []
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'E-Mail erfolgreich gesendet ✅' });
  } catch (error) {
    console.error('Fehler beim Senden:', error);
    res.status(500).json({ message: 'Fehler beim E-Mail-Versand ❌' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server läuft auf Port ${port}`);
});
