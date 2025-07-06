import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Add God Pvt Ltd" <${process.env.SMTP_MAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text || `Reset your password using the following link: ${options.resetUrl}`,
    html: `
<div style="max-width:600px;margin:auto;font-family:'Segoe UI',Roboto,sans-serif;color:#333;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#ffffff,#f3f4f6);padding:30px;text-align:center;border-bottom:1px solid #e5e7eb;">
    <div style="background-color:#fff;padding:10px;border-radius:12px;display:inline-block;">
      <img src="https://pbs.twimg.com/profile_images/1867133184410083328/kv4VZoAB_400x400.jpg" alt="Add God Pvt Ltd" style="height:65px;margin-bottom:10px;border-radius:50%;" />
    </div>
    <h1 style="margin:10px 0 0;color:#111;font-size:24px;">Add God Pvt Ltd</h1>
    <p style="font-size:14px;color:#666;margin-top:4px;">Drive Traffic, Generate Leads, Achieve Success</p>
  </div>

  <!-- Body -->
  <div style="padding:30px;">
    <h2 style="color:#333;margin-top:0;">Hi ${options.name || "there"},</h2>
    <p style="font-size:15px;line-height:1.6;">
      We received a request to reset your password. If this was you, click the button below to create a new one.
    </p>

    <div style="text-align:center;margin:30px 0;">
      <a href="${options.resetUrl}" 
         style="background:#6c5ce7;color:#fff;padding:12px 24px;border-radius:6px;
         font-size:16px;text-decoration:none;display:inline-block;font-weight:bold;">
        Reset Password
      </a>
    </div>

    <p style="font-size:14px;color:#555;">
      If the button doesn't work, copy and paste this URL into your browser:
    </p>
    <p style="font-size:14px;word-break:break-all;color:#6c5ce7;">
      <a href="${options.resetUrl}" style="color:#6c5ce7;text-decoration:none;">${options.resetUrl}</a>
    </p>

    <p style="font-size:14px;margin-top:20px;">
      This link will expire in <strong>${options.expireTime || "5 minutes"}</strong>.
    </p>

    <p style="font-size:14px;color:#555;margin-top:30px;">
      Didn’t request a password reset? Just ignore this email — your password will remain unchanged.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

    <p style="font-size:14px;text-align:center;">
      Need help? <a href="mailto:contact@addgod.in" style="color:#6c5ce7;text-decoration:none;">Contact support</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#999;">
    <p style="margin:0;">Stay connected</p>
    <div style="margin:10px 0;">
      <a href="https://facebook.com" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="20" alt="Facebook" />
      </a>
      <a href="https://instagram.com" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" alt="Instagram" />
      </a>
      <a href="https://twitter.com" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="20" alt="Twitter" />
      </a>
      <a href="https://linkedin.com" style="margin:0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="20" alt="LinkedIn" />
      </a>
    </div>
    <p style="margin:10px 0 0;">&copy; ${new Date().getFullYear()} Add God Pvt Ltd. All rights reserved.</p>
    <p style="margin:2px 0;">Plot No. 289, Chaitanya Vihar Phase-2, Vrindavan, 281121</p>
    <p style="margin:2px 0;">+91 9557323701 | <a href="mailto:contact@addgod.in" style="color:#6c5ce7;text-decoration:none;">contact@addgod.in</a></p>
    <p style="margin:2px 0;"><a href="https://addgod.in" style="color:#6c5ce7;text-decoration:none;">addgod.in</a></p>
  </div>
</div>
`,
  };

  await transporter.sendMail(mailOptions);
};

export { sendEmail };
