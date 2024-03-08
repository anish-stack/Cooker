const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
     // Remove the 'message' parameter as it's not needed
  try {
        //making a transporter for mail

    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
          //authentication

      auth: {
        user:process.env.SMPT_MAIL,
        pass:process.env.SMPT_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: options.email, // Use 'options.email' as the recipient
      subject: options.subject,
      html: options.message, // Use 'options.message' to define the email message
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;