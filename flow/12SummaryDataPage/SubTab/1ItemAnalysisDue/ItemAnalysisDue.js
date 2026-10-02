const express = require("express");
const router = express.Router();
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");

// งาน OVS : ReqNo ขึ้นต้นด้วย OVS (เช่น OVS-MKT-26-0001)
// ลูกค้า OVS ใน Routine_MasterPatternLab ตั้ง Branch = BANGPOO ไว้
// ถ้ากรองแค่ Branch งาน OVS จะไปปนอยู่ในกราฟ BANGPOO
//   - Branch = OVS              -> เอาเฉพาะงาน OVS (ทุก branch)
//   - Branch = BANGPOO / RAYONG -> เอาเฉพาะงานระบบเดิม (ตัด OVS ออก)
function buildWhere(branch) {
  if (branch == "OVS") {
    return `ReqNo like 'OVS%'`;
  }
  if (branch == "BANGPOO" || branch == "RAYONG") {
    return `Branch = '${branch}' and ISNULL(ReqNo, '') not like 'OVS%'`;
  }
  return null;
}

exports.fetchItemAnalysisDueGrpah = async (dataIn) => {
  console.log("in fetchItemAnalysisDueGrpah");
  try {
    console.log(dataIn.Branch);
    var where = buildWhere(dataIn.Branch);
    if (where == null) {
      return [];
    }
    var query = `select AnalysisDuedate,
      '${dataIn.Branch}' as branch,
      count(case when ItemStatus in ('RECEIVE SAMPLE') then 1 else null end) as CountReceive,
      count(case when ItemStatus in ('LIST NORMAL') then 1 else null end) as CountWaitAnalysis,
      count(case when ItemStatus in ('RECEHCK','LIST RECHECK') then 1 else null end) as CountWaitRecheck,
      count(case when ItemStatus in ('RECONFIRM','LIST RECONFIRM') then 1 else null end) as CountWaitReconfirm,
      count(case when ItemStatus in ('FINISH NORMAL','FINISH RECHECK','FINISH RECONFIRM','REQUEST RECONFIRM') then 1 else null end) as CountWaitApprove,
      count(case when ItemStatus in ('APPROVE','COMPLETE') then 1 else null end) as CountApprove
      from Routine_RequestLab where ${where} and
      AnalysisDuedate BETWEEN DATEADD(day,-45, CONVERT(date, GETDATE())) AND DATEADD(day, 30, CONVERT(date, GETDATE()))
      group by AnalysisDuedate order by AnalysisDuedate asc`;
    console.log(query);
    var buffData = await mssql.qurey(query);
    dataOut = buffData.recordset;
    return dataOut;
  } catch (error) {
    console.log(error);
    //res.json(error);
    return "ERROR";
  }
};
