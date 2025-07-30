import nodemailer from "nodemailer";
import {COMPANY_INFO} from "./constantCompany.js";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"${COMPANY_INFO.LEGAL_NAME}" <${process.env.SMTP_MAIL}>`,
    to: options.to,
    subject: options.subject,
    text:
      options.text ||
      `Reset your password using the following link: ${options.resetUrl}`,
    html: `
<div style="max-width:600px;margin:auto;font-family:'Segoe UI',Roboto,sans-serif;color:#333;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#ffffff,#f3f4f6);padding:30px;text-align:center;border-bottom:1px solid #e5e7eb;">
    <div style="background-color:#fff;padding:10px;border-radius:12px;display:inline-block;">
      <img src="${COMPANY_INFO.LOGO_URL}" alt="${COMPANY_INFO.LEGAL_NAME}" style="height:65px;margin-bottom:10px;border-radius:50%;" />
    </div>
    <h1 style="margin:10px 0 0;color:#111;font-size:24px;">${COMPANY_INFO.LEGAL_NAME}</h1>
    <p style="font-size:14px;color:#666;margin-top:4px;">${COMPANY_INFO.TAGLINE}</p>
  </div>

  <!-- Body -->
  <div style="padding:30px;">
    <h2 style="color:#333;margin-top:0;">Hi ${options.name || "there"},</h2>
    <p style="font-size:15px;line-height:1.6;">
      ${options.text || "You requested a password reset. Click the button below to reset your password."}
    </p>

    <div style="text-align:center;margin:30px 0;">
      <a href="${options.resetUrl}" 
         style="background:#6c5ce7;color:#fff;padding:12px 24px;border-radius:6px;
         font-size:16px;text-decoration:none;display:inline-block;font-weight:bold;">
         ${options.btnName || "Reset Password"}
      </a>
    </div>

    <p style="font-size:14px;color:#555;">
      If the button doesn't work, copy and paste this URL into your browser:
    </p>
    <p style="font-size:14px;word-break:break-all;color:#6c5ce7;">
      <a href="${options.resetUrl}" style="color:#6c5ce7;text-decoration:none;">${options.resetUrl}</a>
    </p>

    <p style="font-size:14px;margin-top:20px;">
      This link will expire in <strong>${options.expireTime || "2 days"}</strong>.
    </p>

    <p style="font-size:14px;color:#555;margin-top:30px;">
      Didn't request a password reset? Just ignore this email — your password will remain unchanged
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

    <p style="font-size:14px;text-align:center;">
      Need help? <a href="mailto:${COMPANY_INFO.CONTACT.EMAIL}" style="color:#6c5ce7;text-decoration:none;">Contact support</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#999;">
    <p style="margin:0;">Stay connected</p>
    <div style="margin:10px 0;">
      <a href="${COMPANY_INFO.SOCIALS.FACEBOOK || "#"}" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="20" alt="Facebook" />
      </a>
      <a href="${COMPANY_INFO.SOCIALS.INSTAGRAM}" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" alt="Instagram" />
      </a>
      <a href="${COMPANY_INFO.SOCIALS.TWITTER}" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="20" alt="Twitter" />
      </a>
      <a href="${COMPANY_INFO.SOCIALS.LINKEDIN}" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="20" alt="LinkedIn" />
      </a>
    </div>
    <p style="margin:10px 0 0;">${COMPANY_INFO.COPYRIGHT}</p>
    <p style="margin:2px 0;">${COMPANY_INFO.HEADQUARTERS.CITY}, ${COMPANY_INFO.HEADQUARTERS.COUNTRY}</p>
    <p style="margin:2px 0;">${COMPANY_INFO.CONTACT.PHONE} | <a href="mailto:${COMPANY_INFO.CONTACT.EMAIL}" style="color:#6c5ce7;text-decoration:none;">${COMPANY_INFO.CONTACT.EMAIL}</a></p>
    <p style="margin:2px 0;"><a href="${COMPANY_INFO.CONTACT.WEBSITE}" style="color:#6c5ce7;text-decoration:none;">${COMPANY_INFO.CONTACT.WEBSITE}</a></p>
  </div>
</div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export { sendEmail };
