const express = require("express");
const router = express.Router();
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");

exports.fetchItemAnalysisDueGrpah = async (dataIn) => {
  console.log("in fetchItemAnalysisDueGrpah");
  try {
    console.log(dataIn.Branch);
    var buffData = await mssql.qurey(
      `select AnalysisDuedate,
      '${dataIn.Branch}' as branch,
      count(case when ItemStatus in ('RECEIVE SAMPLE') then 1 else null end) as CountReceive,
      count(case when ItemStatus in ('LIST NORMAL') then 1 else null end) as CountWaitAnalysis,
      count(case when ItemStatus in ('RECEHCK','LIST RECHECK') then 1 else null end) as CountWaitRecheck,
      count(case when ItemStatus in ('RECONFIRM','LIST RECONFIRM') then 1 else null end) as CountWaitReconfirm,
      count(case when ItemStatus in ('FINISH NORMAL','FINISH RECHECK','FINISH RECONFIRM','REQUEST RECONFIRM') then 1 else null end) as CountWaitApprove,
      count(case when ItemStatus in ('APPROVE','COMPLETE') then 1 else null end) as CountApprove
      from Routine_RequestLab where Branch = '${dataIn.Branch}' and 
      AnalysisDuedate BETWEEN DATEADD(day,-45, CONVERT(date, GETDATE())) AND DATEADD(day, 30, CONVERT(date, GETDATE()))
      group by AnalysisDuedate order by AnalysisDuedate asc`
    );
    console.log(`select AnalysisDuedate,
    '${dataIn.Branch}' as branch,
    count(case when ItemStatus in ('RECEIVE SAMPLE') then 1 else null end) as CountReceive,
    count(case when ItemStatus in ('LIST NORMAL') then 1 else null end) as CountWaitAnalysis,
    count(case when ItemStatus in ('RECEHCK','LIST RECHECK') then 1 else null end) as CountWaitRecheck,
    count(case when ItemStatus in ('RECONFIRM','LIST RECONFIRM') then 1 else null end) as CountWaitReconfirm,
    count(case when ItemStatus in ('FINISH NORMAL','FINISH RECHECK','FINISH RECONFIRM','REQUEST RECONFIRM') then 1 else null end) as CountWaitApprove,
    count(case when ItemStatus in ('APPROVE','COMPLETE') then 1 else null end) as CountApprove
    from Routine_RequestLab where Branch = '${dataIn.Branch}' and 
    AnalysisDuedate BETWEEN DATEADD(day,-45, CONVERT(date, GETDATE())) AND DATEADD(day, 30, CONVERT(date, GETDATE()))
    group by AnalysisDuedate order by AnalysisDuedate asc`);
    dataOut = buffData.recordset;
    return dataOut;
  } catch (error) {
    console.log(error);
    //res.json(error);
    return "ERROR";
  }
};
