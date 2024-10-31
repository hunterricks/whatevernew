import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || 'test',
    pass: process.env.SMTP_PASS || 'test'
  }
});

export async function sendVerificationEmail(email: string, code: string) {
  if (process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer') {
    console.log('Verification code for testing:', code);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@whatever.com',
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify your email address</h1>
        <p>Your verification code is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${code}</strong>
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this verification code, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}