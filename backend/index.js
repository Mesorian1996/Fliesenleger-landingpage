import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { createEvent } from 'ics';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Datei-Upload (max. 5 MB)
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// 📩 Route 1: Anfrageformular
app.post('/anfrage', upload.single('datei'), async (req, res) => {
  const {
    anrede, vorname, nachname, email, phone,
    adresse, anfrageart, projektart, qm, beschreibung
  } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Fliesenleger Limani" <kontakt@limani-fliesenleger.de>`,
      to: process.env.MAIL_USER,
      replyTo: email,
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
        ? [{ filename: req.file.originalname, content: req.file.buffer }]
        : []
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'E-Mail erfolgreich gesendet ✅' });
  } catch (error) {
    console.error('Fehler beim Senden:', error);
    res.status(500).json({ message: 'Fehler beim E-Mail-Versand ❌' });
  }
});

// 📅 Route 2: ICS-Datei generieren + E-Mail senden
app.post('/generate-ics', (req, res) => {
  const { title, description, start, name, phone } = req.body;
  const startDate = new Date(start);

  const event = {
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes()
    ],
    duration: { hours: 1 },
    title: title || 'Beratungstermin',
    description: description || 'Unverbindliche Beratung mit Limani Fliesenleger',
    location: 'Vor Ort / Telefonisch',
    status: 'CONFIRMED'
  };

  createEvent(event, async (error, value) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Fehler beim Generieren');
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

      const mailOptions = {
        from: `"Limani Website" <kontakt@limani-fliesenleger.de>`,
        to: process.env.MAIL_USER,
        subject: `📅 Neuer Terminvorschlag von ${name || 'Unbekannt'}`,
        text: `
Neuer Terminvorschlag über die Website:

👤 Name: ${name || 'nicht angegeben'}
📞 Telefon: ${phone || 'nicht angegeben'}
📅 Terminwunsch: ${startDate.toLocaleString('de-DE')}

Beschreibung:
${description || 'Keine weiteren Angaben'}
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('❌ Fehler beim E-Mail-Versand:', mailError);
    }

    res.setHeader('Content-Disposition', 'attachment; filename=limani-termin.ics');
    res.setHeader('Content-Type', 'text/calendar');
    res.send(value);
  });
});

// ✅ Server starten
app.listen(port, () => {
  console.log(`🚀 Server läuft auf Port ${port}`);
});
