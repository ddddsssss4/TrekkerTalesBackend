// emailService.js
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: "saraswatdevesh98@gmail.com", // Your email
    pass: "1911@devSs", // Your email password or app password
  },
});

const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: "saraswatdevesh98@gmail.com",
    to: email,
    subject: 'Welcome to TrekkerTales!',
    text: `Hi ${name},\n\nThank you for registering on Trekkerll! We're excited to have you on board.\n\nBest regards,\nYour Trekkerll Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendWelcomeEmail;
