const nodemailer = require("nodemailer");
const db = require('../data/knex-db');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(sendTo, subject, body, _attachments, type) {
  // get setting
  let host = await db.table('System_Parameter')
    .where('Key', 'EMAIL_HOST').select('Value').first();
  let port = await db.table('System_Parameter')
    .where('Key', 'EMAIL_PORT').select('Value').first();
  let secure = await db.table('System_Parameter')
    .where('Key', 'EMAIL_SECURE').select('BoolValue').first();
  let account = await db.table('System_Parameter')
    .where('Key', 'EMAIL_ACCOUNT').select('Value').first();
  let pass = await db.table('System_Parameter')
    .where('Key', 'EMAIL_PASS').select('Value').first();
  let receipt_default = await db.table('System_Parameter')
    .where('Key', 'EMAIL_RECEIPT_DEFAUT').select('BoolValue').first();
  let email_receipt_account = await db.table('System_Parameter')
    .where('Key', 'EMAIL_RECEIPT_ACCOUNT').select('Value').first();

  if (!host || !port || !secure || !account || !pass || !receipt_default || !email_receipt_account)
    throw new Error("setting email not found");

  let accessToken = '';
  // @ts-ignore
  accessToken = await oAuth2Client.getAccessToken();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: host.Value,
    port: Number.parseInt(port.Value),
    secure: secure.BoolValue, // true for 465, false for other ports
    auth: {
      type: "OAuth2",
      user: account.Value,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  let attachments = _attachments.map((item) => {
    return Object.assign({}, item);
  });

  /*
    type = stream/base64
  */
  if (type == 'stream' && attachments.length > 0) {
    attachments.forEach(item => {
      item.content = fs.createReadStream(path.join(__dirname, `../upload/${item.content}`))
    });
  }

  //Nếu sử dụng email nhận mặc định (để test)
  if (receipt_default.BoolValue) {
    let info = await transporter.sendMail({
      from: account.Value, // sender address
      to: email_receipt_account.Value,
      subject: subject, // Subject line
      text: '<p>Send to: ' + sendTo + '</p>' + '</br>' + body, // plain text body
      html: '<p>Send to: ' + sendTo + '</p>' + '</br>' + body, // html body
      attachments: attachments
    });
  }
  //Nếu gửi trực tiếp đến email
  else {
    let info = await transporter.sendMail({
      from: account.Value, // sender address
      to: sendTo, //"abc@gmail.com, javIdol@gmail.com"
      subject: subject, // Subject line
      text: body, // plain text body
      html: body, // html body
      attachments: attachments
    });
  }
}

module.exports.sendEmail = sendEmail;