import Bull from "bull";
import {sendEmail} from "./sendEmail.js";


export const welcomeEmailQueue = new Bull("welcome-email-queue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

export const rejectionEmailQueue = new Bull("rejection-email-queue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});


// 👇 Processor defined only once, here
welcomeEmailQueue.process(async (job) => {
  const { email, fullName, password } = job.data;
  const resetURL = `${process.env.CORS_ORIGIN}/forgot-password`;
  const btnName = "Forget Password";

  const plainTextMessage = `
    <p>🎉 <strong>Welcome to Our Company!</strong></p>
    <p>Your account has been successfully created. Here are your login details:</p>
    <ul>
      <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
      <li><strong>Temporary Password:</strong> ${password}</li>
    </ul>
    <p>Please log in and change your password as soon as possible.</p>
    <p>- HR Team</p>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "🎉 Welcome Aboard!",
      name: fullName,
      text: plainTextMessage,
      resetUrl: resetURL,
      btnName,
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send welcome email:", err);
  }
});


  // 🎯 Add delayed Reject email to queue (1 days = 518400 sec)
  rejectionEmailQueue.process(async (job) => {
    const { email, fullName, reason } = job.data;

    const message = `
Dear ${fullName},

Thank you for taking the time to apply and interview with us.

After careful consideration, we regret to inform you that you have not been selected for the role.

Reason (if shared): ${reason || "Not specified"}

We appreciate your interest and encourage you to apply again in the future.

Best regards,  
HR Team
`;

    try {
      await sendEmail({
        to: email,
        subject: "Application Update - Thank You",
        name: fullName,
        text: message,
      });

      console.log(`📨 Rejection email sent to ${email}`);
    } catch (err) {
      console.error("❌ Failed to send rejection email to", email, err);
    }
  });