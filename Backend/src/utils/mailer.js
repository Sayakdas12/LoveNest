const nodemailer = require("nodemailer");

let _transporter = null;

function getTransporter() {
    if (_transporter) return _transporter;
    _transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    return _transporter;
}

/**
 * Send an email.
 * @param {object} opts - { to, subject, html, text }
 */
async function sendMail({ to, subject, html, text }) {
    const transporter = getTransporter();
    return transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text,
    });
}

/**
 * Send an OTP email for password reset.
 * @param {string} email
 * @param {string} otp
 */
async function sendOtpEmail(email, otp) {
    return sendMail({
        to: email,
        subject: "LoveNest — Password Reset OTP",
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#e11d48">LoveNest 💕</h2>
        <p>Your password reset OTP is:</p>
        <h1 style="letter-spacing:0.4em;color:#e11d48;font-size:2.5rem">${otp}</h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#6b7280;font-size:0.875rem">If you did not request this, please ignore this email.</p>
      </div>
    `,
        text: `Your LoveNest password reset OTP is: ${otp}. It expires in 10 minutes.`,
    });
}

module.exports = { sendMail, sendOtpEmail };
