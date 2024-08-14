import nodemailer from "nodemailer";
import config from './config.js';

class Email {
  constructor(recipientEmail) {
    this.to = recipientEmail;
    this.from = `Pinger by freely.digital <${config.MAIL_USER}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      secure: config.MAIL_SECURE,
      auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: config.MAIL_REJECT_UNAUTHORIZED
      }
    });
  }

  async send(subject, html) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: html
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendMonitorIsDown(monitor) {
    const body = `
      <h3>Monitor status change notification</h3>
      Hello <b>${this.to}</b>,<br>
      the Pinger system noticed that the monitor <b>${monitor.name}</b> is <b>not reachable</b>. Check its status.<br><br>
      
      For more information, please see the Pinger application panel.<br><br>
      
      <i>This notification was sent from the Pinger app, property of the freely.digital. Do not reply to this email.</i>
    `;

    await this.send(`Monitor ${monitor.name} is down - Pinger App`, body);
  }

  async sendMonitorIsUp(monitor) {
    const body = `
      <h3>Monitor status change notification</h3>
      Hello <b>${this.to}</b>,<br>
      the Pinger system noticed that the monitor <b>${monitor.name}</b> is <b>back online</b>.<br><br>
      
      For more information, please see the Pinger application panel.<br><br>
      
      <i>This notification was sent from the Pinger app, property of the freely.digital. Do not reply to this email.</i>
    `;

    await this.send(`Monitor ${monitor.name} is back online - Pinger App`, body);
  }
}

export default Email;