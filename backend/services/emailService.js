import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'thanushan1022@gmail.com',
    pass: 'ycqprrfbgohlijeg'
  }
});

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body of the email
 * @returns {Promise} - Resolves when sent
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: '"WorkForge" <thanushan1022@gmail.com>',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Nodemailer: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error occurred while sending email via Nodemailer:', error.message);
    throw error;
  }
};
