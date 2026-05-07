const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"StreamSync" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendAccountDeletedEmail = async (name, email, reason) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #a855f7; font-size: 28px; margin: 0;">StreamSync</h1>
      </div>
      <h2 style="color: #ffffff; font-size: 20px;">Your account has been removed</h2>
      <p style="color: #9ca3af; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #9ca3af; line-height: 1.6;">
        Your StreamSync account associated with <strong style="color: #fff;">${email}</strong> has been removed by an administrator.
      </p>
      <div style="background: #1f1f1f; border-left: 4px solid #a855f7; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;"><strong style="color: #fff;">Reason:</strong> ${reason || 'Violation of Terms of Service'}</p>
      </div>
      <p style="color: #9ca3af; line-height: 1.6;">
        If you believe this was a mistake, please contact our support team.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #374151; padding-top: 20px;">
        © 2026 StreamSync — This is an automated message, please do not reply.
      </p>
    </div>
  `;
  await sendEmail(email, 'Your StreamSync account has been removed', html);
};

module.exports = { sendEmail, sendAccountDeletedEmail };