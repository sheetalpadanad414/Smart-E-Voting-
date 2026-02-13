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
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background: #f5f5f5; margin-top: 20px; border-radius: 5px; }
          .otp-box { background: white; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #667eea; border-radius: 5px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Smart E-Voting System</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your ${subject} code is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This code will expire in ${process.env.OTP_EXPIRE} minutes.</p>
            <p>Please do not share this code with anyone.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br />Smart E-Voting System Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Smart E-Voting System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      html: htmlContent
    });
    console.log('OTP Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

const sendResultsEmail = async (email, electionTitle, resultsUrl) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background: #f5f5f5; margin-top: 20px; border-radius: 5px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Election Results Available</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>The results for <strong>${electionTitle}</strong> are now available.</p>
            <p>
              <a href="${resultsUrl}" class="button">View Results</a>
            </p>
            <p>Best regards,<br />Smart E-Voting System Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Results: ${electionTitle}`,
      html: htmlContent
    });
    return true;
  } catch (error) {
    console.error('Error sending results email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendResultsEmail,
  transporter
};
