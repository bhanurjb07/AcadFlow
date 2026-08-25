import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Create test account for local development
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('📧 Mock SMTP Transporter initialized:', testAccount.user);
  return transporter;
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: '"AcadFlow System" <no-reply@acadflow.edu>',
      to,
      subject,
      html,
    });
    console.log(`✉️ Email sent to ${to}: Message ID = ${info.messageId}`);
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: err };
  }
};
