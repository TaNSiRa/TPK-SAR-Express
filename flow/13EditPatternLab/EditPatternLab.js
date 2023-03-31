const express = require("express");
const router = express.Router();
const mssql = require("../../function/mssql.js");
const dtget = require("../../function/dateTime.js");
const fs = require("fs");

router.post("/EditPatternLabPage_searchPatternData", async (req, res) => {
  console.log("in EditPatternLab_SearchPatternData");
  console.log(req.body.custFull);
  try {
    var custFull = req.body.custFull;
    var query = `select * from [Routine_MasterPatternLab]  where CustFull = '${custFull}' order by id asc`;

    /* var query = `
  Delete from [Routine_KACReport] where reqNo = '${data[0].ReqNo}';`;
    var queryInsert = `
  Insert into Routine_KACReport (
        [ReqNo]

        ,[CustFull]
        ,[PatternReport]
        ,[ReportOrder]
        ,[SampleNo]
        ,[GroupNameTS]
        ,[SampleGroup]
        ,[SampleType]
        ,[SampleTank]
        ,[SampleName]
        ,[ProcessReportName]
        ,[SamplingDate]
        ,[CreateReportDate]
        ,[ItemNo]
        ,[ItemName]
        ,[ItemReportName]
        ,[StdFactor]
        ,[StdMax]
        ,[StdSymbol]
        ,[StdMin]
        ,[ControlRange]
        ,[ResultIn]
        ,[ResultReport]
        ,[Evaluation]
        ,[Incharge]
        ,[SubLeader]
        ,[GL]
        ,[JP]
        ,[DGM]
        ,[NextApprover]
        ,[Comment1]
        ,[Comment2]
        ,[Comment3]
        ,[Comment4]
        ,[Comment5]
        ,[Comment6]
        ,[Comment7]
        ,[Comment8]
        ,[Comment9]
        ,[Comment10]
  ) values `;

    for (i = 0; i < data.length; i++) {
      queryInsert =
        queryInsert +
        `( '${data[i].ReqNo}'
      ,'${data[i].CustFull}'
      ,'${data[i].PatternReport}'
      ,'${data[i].ReportOrder}'
      ,'${data[i].SampleNo}'
      ,'${data[i].GroupNameTS}'
      ,'${data[i].SampleGroup}'
      ,'${data[i].SampleType}'
      ,'${data[i].SampleTank}'
      ,'${data[i].SampleName}'
      ,'${data[i].ProcessReportName}'
      ,'${data[i].SamplingDate}'
      ,'${data[i].CreateReportDate}'
      ,'${data[i].ItemNo}'
      ,'${data[i].ItemName}'
      ,'${data[i].ItemReportName}'
      ,'${data[i].StdFactor}'
      ,'${data[i].StdMax}'
      ,'${data[i].StdSymbol}'
      ,'${data[i].StdMin}'
      ,'${data[i].ControlRange}'
      ,'${data[i].ResultIn}'
      ,'${data[i].ResultReport}'
      ,'${data[i].Evaluation}'
      ,'${data[i].Incharge}'
      ,'${data[i].SubLeader}'
      ,'${data[i].GL}'
      ,'${data[i].JP}'
      ,'${data[i].DGM}'
      ,'${data[i].NextApprover}'
      ,'${data[i].Comment1}'
      ,'${data[i].Comment2}'
      ,'${data[i].Comment3}'
      ,'${data[i].Comment4}'
      ,'${data[i].Comment5}'
      ,'${data[i].Comment6}'
      ,'${data[i].Comment7}'
      ,'${data[i].Comment8}'
      ,'${data[i].Comment9}'
      ,'${data[i].Comment10}'
      )`;
      if (i !== data.length - 1) {
        queryInsert = queryInsert + ",";
      }
    }
    query = query + queryInsert + ";"; */
    var data = await mssql.qurey(query);
    console.log(data);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.json("ERROR");
  }
});

module.exports = router;
