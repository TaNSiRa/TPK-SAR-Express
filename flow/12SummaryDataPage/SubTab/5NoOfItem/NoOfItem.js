const express = require("express");
const router = express.Router();
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");

exports.fetchNoOfItemGraph = async (dataIn) => {
  console.log("in fetchNoOfItemGraph");
  try {
    var buffData = await mssql.qurey(
      `select
      count(case when SampleStatus not in ('CANCEL SAMPLE') and custshort like '%TAW%' then 1 else null end) as TAW,
      count(case when SampleStatus not in ('CANCEL SAMPLE') and custfull like '%HONDA%' then 1 else null end) as HONDA,
      count(case when SampleStatus not in ('CANCEL SAMPLE') and custshort like '%IMCT%' then 1 else null end) as IMCT,
      count(case when SampleStatus not in ('CANCEL SAMPLE') and custshort like '%BCM%' then 1 else null end) as BCM,
      count(case when SampleStatus not in ('CANCEL SAMPLE') and (custshort not like '%TAW%' or  custfull not like '%HONDA%' 
      or custshort not like '%IMCT%' or custshort not like '%BCM%') then 1 else null end) as OTHER 
      from Routine_RequestLab where
      AnalysisDuedate BETWEEN DATEADD(day,-45, CONVERT(date, GETDATE())) AND DATEADD(day, 30, CONVERT(date, GETDATE()))`
    );

    //console.log(dataReport);
    //var dataReport = new ReportData_Structure();
    dataOut = buffData.recordset;    
    return dataOut;
  } catch (error) {
    console.log(error);
    //res.json(error);
    return "ERROR";
  }
};
