const nodemailer = require("nodemailer");
const mssql = require("../function/mssql.js");

let serverMail = nodemailer.createTransport({
  host: "172.20.10.69",
  port: 25,
  secure: false, // true for 465, false for other ports
  /*      auth: {
    user: "arsa@thaiparker.co.th", // generated ethereal user
    pass: "P@ssW0rd0", // generated ethereal password
  },   */
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

exports.MKTSendCompleteReport = async (ReqNo, Incharge, Subject, Text) => {
  console.log("send");
  console.log(ReqNo);
  console.log(Incharge);
  console.log(Subject);
  console.log(Text);
  try {
    var query = `select email from [Master_User]  where Name = '${Incharge}'`;
    var data = await mssql.qurey(query);
    //console.log(data);
    data = data.recordset;

    await serverMail.sendMail({
      from: "SAR-SYSTEM@thaiparker.co.th", // sender address
      to: data[0].email, // list of receivers
      subject: Subject, // Subject line
      html: ` <p>${Text}</p>
      <a href="http://127.0.0.1:1880" target="_blank">SAR PROGRAM</a>`, // html body
      attachments: [
        // File Stream attachment
        {
          filename: ReqNo + ".pdf",
          path: `C://AutomationProject//SAR//asset_ts//Report//KAC//${ReqNo}.pdf`,
          //cid: "nyan@example.com", // should be as unique as possible
        },
      ],
    });
    console.log("ok");
    return "OK";
  } catch (e) {
    console.log(e);
    return e;
  }
};

exports.MKTSendRejectReport = async (MailTo, Subject, Text) => {
  console.log("MKTSendRejectReport");
  console.log(MailTo);
  try {
    var query = `select email from [Master_User]  where Name in (${MailTo});`;
    var data = await mssql.qurey(query);
    data = data.recordset;

    var emailSend = [];

    for (var i = 0; i < data.length; i++) {
      emailSend.push(data[i].email);
    }


    await serverMail.sendMail({
      from: "SAR-SYSTEM@thaiparker.co.th", // sender address
      to: emailSend, // list of receivers
      subject: Subject, // Subject line
      html: ` <p>${Text}</p>
      <a href="http://127.0.0.1:1880" target="_blank">SAR PROGRAM</a>`, // html body
    });

    console.log("ok");
    return "OK";
  } catch (e) {
    console.log(e);
    return e;
  }
};

exports.test_send = async () => {
  console.log("send");
  try {
    await serverMail.sendMail({
      /* 
    sender: "SAR@thaiparker.co.th",
    to: "arsa@thaiparker.co.th",
    subject: "Attachment!",
    body: "mail content...",
    attachments: [{ filename: "attachment.txt", content: data }], */

      from: "SAR-SYSTEM@thaiparker.co.th", // sender address
      to: "arsa@thaiparker.co.th", // list of receivers
      subject: "Hello", // Subject line
      text: "Hello world?", // plain text body
      html: `<a href="http://127.0.0.1:5500" target="_blank">SAR PROGRAM</a>`, // html body
      attachments: [
        // String attachment
        {
          filename: "notes.txt",
          content: "Some notes about this e-mail",
          contentType: "text/plain", // optional, would be detected from the filename
        },

        // Binary Buffer attachment
        {
          filename: "image.png",
          content: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/" +
            "//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U" +
            "g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC",
            "base64"
          ),

          cid: "note@example.com", // should be as unique as possible
        },

        // File Stream attachment
        {
          filename: "nyan cat ✔.pdf",
          path: "C://AutomationProject//SAR//asset_ts//Report//KAC//RTR-MKT-22-0359.pdf",
          cid: "nyan@example.com", // should be as unique as possible
        },
      ],
    });
  } catch (e) {
    console.log(e);
  }
};
