const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOTPEmail = async (email, otp, purpose = 'registration') => {
  const purposes = {
    registration: 'Email Verification',
    login: 'Login Verification',
    vote: 'Vote Verification',
    password_reset: 'Password Reset'
  };

  const subject = purposes[purpose] || 'Verification Code';
  const expires = process.env.OTP_EXPIRE || '5';

  const text = `Your ${subject} code is: ${otp}\nIt expires in ${expires} minutes.`;
  const html = `<p>Your <strong>${subject}</strong> code is:</p><h2>${otp}</h2><p>It expires in ${expires} minutes.</p>`;

  // If EMAIL_ENABLED is explicitly set to 'true' and transporter is configured, attempt to send
  const emailEnabled = String(process.env.EMAIL_ENABLED || 'false').toLowerCase() === 'true';

  if (emailEnabled && transporter) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      text,
      html
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✓ OTP email sent to ${email}`);
      return true;
    } catch (err) {
      console.error('✗ Failed to send OTP email:', err.message);
      // fallthrough to console output so OTP is still available
    }
  }

  // Fallback: log OTP to server console
  console.log('\n' + '='.repeat(60));
  console.log('📧 OTP CODE (EMAIL SENDING DISABLED OR FAILED)');
  console.log('='.repeat(60));
  console.log(`Email: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Expires in: ${expires} minutes`);
  console.log('='.repeat(60) + '\n');
  return true;
};

const sendResultsEmail = async (email, electionTitle, resultsUrl) => {
  // Email sending disabled - results notification shown in console only
  console.log('\n' + '='.repeat(60));
  console.log('📧 ELECTION RESULTS NOTIFICATION (EMAIL SENDING DISABLED)');
  console.log('='.repeat(60));
  console.log(`Email: ${email}`);
  console.log(`Election: ${electionTitle}`);
  console.log(`Results URL: ${resultsUrl}`);
  console.log('='.repeat(60) + '\n');
  return true;
};

module.exports = {
  sendOTPEmail,
  sendResultsEmail,
  transporter
};
