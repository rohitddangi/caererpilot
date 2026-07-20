import nodemailer from 'nodemailer';

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  const isProd = process.env.NODE_ENV === 'production';

  // Production: use configured SMTP
  if (isProd && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Development: auto-generate an Ethereal test account (prints preview URL to console)
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fully auto-generated Ethereal account for zero-config local dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Email] Using Ethereal test account:', testAccount.user);
  }

  return transporter;
}

const FROM_ADDRESS = `"${process.env.EMAIL_FROM_NAME || 'CareerPilot AI'}" <${process.env.SMTP_USER || 'noreply@careerpilot.ai'}>`;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Send verification email to newly registered user.
 * @param {{ name: string, email: string }} user
 * @param {string} token - Raw verification token
 */
export async function sendVerificationEmail(user, token) {
  const link = `${CLIENT_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 600px; margin: 40px auto; background: #111; border: 1px solid rgba(214,168,58,0.2); border-radius: 24px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #d6a83a, #f4d37a); padding: 40px 40px 32px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 900; color: #000; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 14px; color: rgba(0,0,0,0.7); }
        .body { padding: 40px; }
        .body h2 { color: #fff; font-size: 20px; margin: 0 0 12px; }
        .body p { color: #999; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #d6a83a, #f4d37a); color: #000 !important; font-weight: 800; font-size: 15px; padding: 16px 36px; border-radius: 50px; text-decoration: none; }
        .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer p { color: #555; font-size: 13px; margin: 0; line-height: 1.5; }
        .footer a { color: #d6a83a; text-decoration: none; }
        .info-box { background: rgba(214,168,58,0.06); border: 1px solid rgba(214,168,58,0.15); border-radius: 12px; padding: 16px 20px; margin: 24px 0 0; }
        .info-box p { color: #999; font-size: 13px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CareerPilot AI ✦</h1>
          <p>Career Intelligence Platform</p>
        </div>
        <div class="body">
          <h2>Verify your email, ${user.name.split(' ')[0]} 👋</h2>
          <p>Thanks for signing up! Please click the button below to verify your email address and activate your account.</p>
          <a href="${link}" class="btn">Verify Email Address →</a>
          <div class="info-box">
            <p>⏳ This link expires in <strong style="color:#d6a83a;">24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
        <div class="footer">
          <p>If the button doesn't work, paste this URL into your browser:<br><a href="${link}">${link}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: FROM_ADDRESS,
      to: user.email,
      subject: 'Verify your CareerPilot AI account',
      html,
    });
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('[Email] Verification email preview:', nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error('[Email] Failed to send verification email:', err.message);
    // In dev, fall back to printing the link so you can test
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Email DEV FALLBACK] Verify link for ${user.email}: ${link}`);
    }
  }
}

/**
 * Send password reset email.
 * @param {{ name: string, email: string }} user
 * @param {string} token - Raw reset token
 */
export async function sendPasswordResetEmail(user, token) {
  const link = `${CLIENT_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 600px; margin: 40px auto; background: #111; border: 1px solid rgba(214,168,58,0.2); border-radius: 24px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #d6a83a, #f4d37a); padding: 40px 40px 32px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 900; color: #000; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 14px; color: rgba(0,0,0,0.7); }
        .body { padding: 40px; }
        .body h2 { color: #fff; font-size: 20px; margin: 0 0 12px; }
        .body p { color: #999; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #d6a83a, #f4d37a); color: #000 !important; font-weight: 800; font-size: 15px; padding: 16px 36px; border-radius: 50px; text-decoration: none; }
        .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer p { color: #555; font-size: 13px; margin: 0; line-height: 1.5; }
        .footer a { color: #d6a83a; text-decoration: none; }
        .warning-box { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); border-radius: 12px; padding: 16px 20px; margin: 24px 0 0; }
        .warning-box p { color: #999; font-size: 13px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CareerPilot AI ✦</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="body">
          <h2>Reset your password</h2>
          <p>Hi ${user.name.split(' ')[0]}, we received a request to reset your password for your CareerPilot AI account. Click the button below to proceed.</p>
          <a href="${link}" class="btn">Reset Password →</a>
          <div class="warning-box">
            <p>⚠️ This link expires in <strong style="color:#ef4444;">1 hour</strong>. If you didn't request a password reset, please ignore this email — your account is safe.</p>
          </div>
        </div>
        <div class="footer">
          <p>If the button doesn't work, paste this URL into your browser:<br><a href="${link}">${link}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: FROM_ADDRESS,
      to: user.email,
      subject: 'Reset your CareerPilot AI password',
      html,
    });
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('[Email] Password reset email preview:', nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error('[Email] Failed to send password reset email:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Email DEV FALLBACK] Reset link for ${user.email}: ${link}`);
    }
  }
}
