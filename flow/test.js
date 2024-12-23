const express = require("express");
const router = express.Router();
const pic = require("../function/picture64");
const axios = require("../function/axios");
const ssrs = require("../function/ssrs");
const ssrs2 = require("../function/ssrs_createReport");
const pdf = require("../function/createpdf.js");
const mssql = require("../function/mssql.js");
const nodemailer = require("../function/nodemailer.js");

router.post("/testpdf", async (req, res) => {
  console.log("in testpdf");
  try {
    //ssrs.loginServer();
    /* ssrs.downloadPDF(
      "http://172.23.10.51/ReportServer?%2fReport+Project1%2fSAR_KAC&rs:Format=PDF&rs:ClearSession=true&rs:Command=Render&ReqNo=RTB-MKT-22-002",
      "c:/temp/somePDF.pdf"
    ); */
    //console.log(axios.get("http://172.23.10.51/ReportServer?%2fReport+Project1%2fSAR_KAC&rs:Format=PDF&rs:ClearSession=true&rs:Command=Render&ReqNo=RTB-MKT-22-002"));

    //let pic64 = pic.getpic(`C:\\AutomationProject\\SAR\\asset\\${picname}`);
    //ssrs2.request();
    var dataReport = await mssql.qurey(
      `select * from Routine_KACReport where reqno = 'RTB-MKT-22-002' and reportorder != 0 order by reportorder asc`
    );
    console.log(dataReport);
    pdf.SavePDF();
    res.send("pic64");
  } catch (error) {
    //res.json(error);
  }
});

router.post("/testmail", async (req, res) => {
  console.log("test mail");
  try {
    await nodemailer.MKTSendCompleteReport("RTR-MKT-22-030", "ARSA CHUMNANDECHAKUL", "REPORT CUST xx COMPLETE", "REPORT CUST xx COMPLETE DATE");
    res.send("pic64");
  } catch (error) {
    //res.json(error);
  }
});

module.exports = router;
