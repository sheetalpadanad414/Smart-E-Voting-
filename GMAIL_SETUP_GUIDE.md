# Gmail Setup Guide for OTP Emails

## Quick Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the prompts to enable it (you'll need your phone)

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other" as the device and name it "Smart E-Voting"
4. Click "Generate"
5. Copy the 16-digit password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File

Open `backend/.env` and update these lines:

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Smart E-Voting System <your-email@gmail.com>
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with the 16-digit app password (remove spaces)

### Step 4: Restart Server

```cmd
cd backend
node serverSimple.js
```

### Step 5: Test

```cmd
cd backend
node testEmail.js
```

You should receive a real email in your Gmail inbox!

## Troubleshooting

### "Invalid login" error
- Make sure you're using the App Password, not your regular Gmail password
- Remove any spaces from the app password
- Verify 2FA is enabled

### "Less secure app access" error
- This is outdated - use App Passwords instead
- App Passwords work even with "Less secure app access" disabled

### Emails going to spam
- Add your own email to contacts
- Mark the first email as "Not Spam"
- Consider using a custom domain with SPF/DKIM records

## Alternative: Use Your Own Domain Email

If you have a custom domain (like yourdomain.com), you can use:
- Google Workspace (paid)
- Outlook/Microsoft 365 (paid)
- Free services: Zoho Mail, ProtonMail

## Free Email Services for Production

1. **SendGrid** - 100 emails/day free
2. **Mailgun** - 5000 emails/month free
3. **Brevo** - 300 emails/day free
4. **Amazon SES** - 62,000 emails/month free (if hosted on AWS)

See `backend/.env.email-options` for configuration examples.
