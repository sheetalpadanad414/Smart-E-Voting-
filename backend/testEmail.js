require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n' + '='.repeat(60));
console.log('EMAIL CONFIGURATION TEST');
console.log('='.repeat(60));
console.log('EMAIL_ENABLED:', process.env.EMAIL_ENABLED);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
console.log('='.repeat(60) + '\n');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function testEmail() {
  try {
    console.log('Testing email connection...\n');
    
    // Verify connection
    await transporter.verify();
    console.log('✓ SMTP connection verified successfully!\n');
    
    // Send test email
    console.log('Sending test OTP email...\n');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test OTP - Smart E-Voting System',
      text: 'Your OTP code is: 123456\nThis is a test email.',
      html: '<p>Your <strong>OTP</strong> code is:</p><h2>123456</h2><p>This is a test email.</p>'
    });
    
    console.log('✓ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('\nOpen this URL in your browser to see the email!\n');
    
  } catch (error) {
    console.error('✗ Email test failed:', error.message);
    console.error('\nFull error:', error);
  }
}

testEmail();
