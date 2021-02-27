const nodemailer = require("nodemailer");
const notifier = require('./notifier')
const path = require('path')
const { log } = require('./log')

module.exports = async function ({
    sender_email,
    smtp_password,
    smtp_server,
    smtp_port,
    receiver_email,
    filepath,
    subject = ""
}) {

      try {
        const filename = path.basename(filepath)
        smtp_port = parseInt(smtp_port)
        secure = (smtp_port == 465) ? true : false
        log(secure, "secure")
        log(smtp_port, "secure")
        const transporter = await nodemailer.createTransport({
            host: smtp_server,
            port: smtp_port,
            secure: secure, // true for 465, false for other ports
            auth: {
              user: sender_email, // generated ethereal user
              pass: smtp_password, // generated ethereal password
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
              }
          });

        const info = await transporter.sendMail({
            from: sender_email, // sender address
            to: receiver_email, // list of receivers
            subject, // Subject line
            text: "Kindle ebook", // plain text body
            attachments: [
                {
                    filename,
                    path: filepath
                }
            ]
          });
          log("Successfully sent email to kindle")
          return true
      } catch (error) {
        log(error.toString(), "error")
        return false
      }

      
    
}