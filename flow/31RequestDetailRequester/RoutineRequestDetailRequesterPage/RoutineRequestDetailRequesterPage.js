const express = require("express");
const router = express.Router();
const mssql = require("../../../function/mssql.js");
const dtget = require("../../../function/dateTime.js");
const nodemailer = require("../../../function/nodemailer.js");
const createReport = require("../function/createReport.js");
const fs = require("fs");

router.post(
  "/RoutineRequestDetailRequesterPage_saveApproveReport",
  async (req, res) => {
    console.log("in saveApproveReport");
    try {
      var dataIn = JSON.parse(req.body.apprvoeReportData);
      var user = req.body.user;
      var dt = dtget.DateTimeNow();
      var query = `update [Routine_KACReport] set ReportRemark = '${dataIn[0].ReportRemark}',`;
      var checkComplete = false;

      //update time show on report by user login
      if (user == dataIn[0].SubLeader) {
        query =
          query +
          `SubLeaderTime = '${dt}',SubLeaderTime_${dataIn[0].ReviseNo} = '${dt}'`;
      } else if (user == dataIn[0].GL) {
        query =
          query + `GLTime = '${dt}',GLTime_${dataIn[0].ReviseNo} = '${dt}'`;
      } else if (user == dataIn[0].JP) {
        query =
          query + `JPTime = '${dt}',JPTime_${dataIn[0].ReviseNo} = '${dt}'`;
      } else if (user == dataIn[0].DGM) {
        query =
          query + `DGMTime = '${dt}',DGMTime_${dataIn[0].ReviseNo} = '${dt}'`;
      }

      query = query + `,NextApprover = `;

      if (user == dataIn[0].SubLeader) {
        if (dataIn[0].GL != "-") {
          query = query + `'${dataIn[0].GL}'`;
        } else if (dataIn[0].DGM != "-") {
          query = query + `'${dataIn[0].DGM}'`;
        } else if (dataIn[0].JP != "-") {
          query = query + `'${dataIn[0].JP}'`;
        } else {
          checkComplete = true;
          query =
            query +
            `'COMPLETE',ReportCompleteDate = '${dt}'
          ,ReportRejectRemark = ''
          ,SubLeaderRejectRemark_${dataIn[0].ReviseNo} = 'COMPLETE'`;
        }
      } else if (user == dataIn[0].GL) {
        if (dataIn[0].DGM != "-") {
          query = query + `'${dataIn[0].DGM}'`;
        } else if (dataIn[0].JP != "-") {
          query = query + `'${dataIn[0].JP}'`;
        } else {
          checkComplete = true;
          query =
            query +
            `'COMPLETE',ReportCompleteDate = '${dt}'
          ,ReportRejectRemark = ''
          ,GLRejectRemark_${dataIn[0].ReviseNo} = 'COMPLETE'`;
        }
      } else if (user == dataIn[0].DGM) {
        if (dataIn[0].JP != "-") {
          query = query + `'${dataIn[0].JP}'`;
        } else {
          checkComplete = true;
          query =
            query +
            `'COMPLETE',ReportCompleteDate = '${dt}'
          ,ReportRejectRemark = ''
          ,DGMRejectRemark_${dataIn[0].ReviseNo} = 'COMPLETE'`;
        }
      } else if (user == dataIn[0].JP) {
        checkComplete = true;
        query =
          query +
          `'COMPLETE',ReportCompleteDate = '${dt}'
        ,ReportRejectRemark = ''
        ,JPRejectRemark_${dataIn[0].ReviseNo} = 'COMPLETE'`;
      }
      query = query + `where reqNo = '${dataIn[0].ReqNo}';`;

      console.log(query);
      await mssql.qurey(query);
      //var report = await CreateReport(dataIn[0].ReqNo);

      if (checkComplete) {
        console.log("create report");
        // ตั้งใจไม่ให้ report ที่สร้างไม่ผ่านมาบล็อกการปิดงาน
        // (สร้างใหม่ได้จากหน้า detail) แต่ต้อง log ให้เห็นว่าพังเพราะอะไร
        try {
          for (let i = 0; i < 3; i++) {
            var report = await createReport.CreateReport(dataIn[0].ReqNo);
            const stringLength = report.length;
            const sizeInBytes = stringLength * (3 / 4) - 2;
            const sizeInKb = sizeInBytes / 1000;
            console.log(sizeInKb);
            if (sizeInKb < 2000) {
              break;
            }
          }
        } catch (err) {
          console.error(
            "[RequesterPage] สร้าง report ของ " +
              dataIn[0].ReqNo +
              " ไม่สำเร็จ : " +
              (err instanceof Error ? err.message : String(err))
          );
        }
        await nodemailer.MKTSendCompleteReport(
          dataIn[0].ReqNo,
          dataIn[0].Incharge,
          "REPORT " + dataIn[0].CustFull + " COMPLETE",
          "REPORT " + dataIn[0].CustFull + " COMPLETE   @ " + dt
        );
      }

      res.send("OK");
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json("ERROR");
    }
  }
);

router.post(
  "/RoutineRequestDetailRequesterPage_sentReportToCustomer",
  async (req, res) => {
    console.log("in sentReportToCustomer");
    try {
      var dataIn = JSON.parse(req.body.sentReportData);
      var dt = dtget.DateTimeNow();
      var query = `update [Routine_RequestLab] set SentRep = '${dt}', SentRepStatus = 'SENT COMPLETE'
      where reqNo = '${dataIn[0].ReqNo}';`;

      console.log(query);
      await mssql.qurey(query);



      res.send("OK");
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json("ERROR");
    }
  }
);

router.post(
  "/RoutineRequestDetailRequesterPage_cancelsentReportToCustomer",
  async (req, res) => {
    console.log("in cancelsentReportToCustomer");
    try {
      var dataIn = JSON.parse(req.body.cancelReportData);
      var dt = dtget.DateTimeNow();
      var query = `update [Routine_RequestLab] set SentRep = '', SentRepStatus = ''
      where reqNo = '${dataIn[0].ReqNo}';`;

      console.log(query);
      await mssql.qurey(query);



      res.send("OK");
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json("ERROR");
    }
  }
);

router.post(
  "/RoutineRequestDetailRequesterPage_saveRejectReport",
  async (req, res) => {
    console.log("in ssaveRejectReport");
    try {
      var dataIn = JSON.parse(req.body.rejectReportData);
      var user = req.body.user;
      var dt = dtget.DateTimeNow();

      var query = "update [Routine_KACReport] set ";

      //remove all time stamp
      query =
        query +
        `Inchargetime = null,SubLeaderTime = null,GLTime=null,DGMTime=null,JPTime=null,
        ReportRejectRemark ='${user} : ${dtget.DateNow()} : ${dataIn[0].ReportRejectRemark
        }'`;

      //update time show on report by user login
      if (user == dataIn[0].SubLeader) {
        query =
          query +
          `,SubLeaderTime_${dataIn[0].ReviseNo} = '${dt}'
          ,SubLeaderRejectRemark_${dataIn[0].ReviseNo} = '${dataIn[0].ReportRejectRemark}'`;
      } else if (user == dataIn[0].GL) {
        query =
          query +
          `,GLTime_${dataIn[0].ReviseNo} = '${dt}'
          ,GLRejectRemark_${dataIn[0].ReviseNo} = '${dataIn[0].ReportRejectRemark}'`;
      } else if (user == dataIn[0].JP) {
        query =
          query +
          `,JPTime_${dataIn[0].ReviseNo} = '${dt}'
          ,JPRejectRemark_${dataIn[0].ReviseNo} = '${dataIn[0].ReportRejectRemark}'`;
      } else if (user == dataIn[0].DGM) {
        query =
          query +
          `,DGMTime_${dataIn[0].ReviseNo} = '${dt}'
          ,DGMRejectRemark_${dataIn[0].ReviseNo} = '${dataIn[0].ReportRejectRemark}'`;
      }
      //update revise
      var buffrev = dataIn[0].ReviseNo;
      if (dataIn[0].ReviseNo != 3) {
        buffrev = dataIn[0].ReviseNo + 1;
      }

      query = query + `,NextApprover = '',ReviseNo =${buffrev} `;

      query = query + `where reqNo = '${dataIn[0].ReqNo}';`;
      var buff = await mssql.qurey(query);

      //send mail
      var buffName = `'${dataIn[0].Incharge}'`;
      if (dataIn[0].SubLeaderTime != "") {
        buffName = buffName + `,'${dataIn[0].SubLeader}'`;
      }
      if (dataIn[0].GLTime != "") {
        buffName = buffName + `,'${dataIn[0].GL}'`;
      }
      if (dataIn[0].DGMTime != "") {
        buffName = buffName + `,'${dataIn[0].DGM}'`;
      }
      if (dataIn[0].JPTime != "") {
        buffName = buffName + `,'${dataIn[0].JP}'`;
      }

      await nodemailer.MKTSendRejectReport(
        buffName,
        "REPORT " + dataIn[0].CustFull + "  REJECT",
        "REPORT " +
        dataIn[0].CustFull +
        " REJECT   @ " +
        dt +
        "\n" +
        dataIn[0].ReportRejectRemark
      );

      res.send("ok");
    } catch (error) {
      console.log(error);
      res.send("ERROR");
    }
  }
);

router.post(
  "/RoutineRequestDetailRequesterPage_searchHistoryApproveReport",
  async (req, res) => {
    console.log("in ssaveRejectReport");
    try {
      var reqNo = req.body.reqNo;
      var dt = dtget.DateTimeNow();

      var query = `select top 1 * from [Routine_KACReport] where reqno = '${reqNo}'`;

      var buff = await mssql.qurey(query);
      res.send(buff.recordset);
    } catch (error) {
      console.log(error);
      res.send("ERROR");
    }
  }
);

router.post('/ApproverForEditSendReport', async (req, res) => {
  console.log("--ApproverForEditSendReport--");

  let query = `
    SELECT Name 
    FROM [SAR].[dbo].[Master_User] 
    WHERE Branch = '${req.body.branch}'
    AND Permission = 'Approver'
  `;

  let db = await mssql.qurey(query);

  if (db.recordset.length > 0) {
    return res.status(200).json(db.recordset); // 👈 ส่ง list กลับ
  } else {
    return res.status(400).json({ message: 'Approver not found' });
  }
});

router.post(
  "/EditSentReportDate",
  async (req, res) => {
    console.log("in EditSentReportDate");
    try {
      var ReqNo = req.body.ReqNo;
      var ReportDate = req.body.ReportDate;
      var User = req.body.User;
      var dt = dtget.DateTimeNow();
      var query = `update [Routine_RequestLab] set SentRep =  '${ReportDate}', UserEditSentRep = '${User}', UserEditSentRep_Date = '${dt}'
      where reqNo = '${ReqNo}';`;

      console.log(query);
      await mssql.qurey(query);



      res.send("OK");
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json("ERROR");
    }
  }
);

module.exports = router;
