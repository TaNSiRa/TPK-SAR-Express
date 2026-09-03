const express = require("express");
const router = express.Router();
const mssql = require("../../../function/mssql.js");
const createpdf = require("./Form_Report/Pattern_0Select.js");
const createReport = require("../function/createReport.js");
const masterDoc = require("./Form_Report/PatternComponent/Pattern_5MasterDoc.js");
const masterDocYearly = require("./Form_Report/PatternComponent/Pattern_1MainHeadSetYear.js");

// -------------------------------------------------------------------------
// PREVIEW REPORT จาก MASTER PATTERN (ไม่มีค่า Result จริง)
//
// ใช้สำหรับหน้า Master detail ของโปรเจ็ค MASTER-SAR : หลังแก้ไข master แล้ว
// อยากเห็นว่า report จะออกมาหน้าตาแบบไหน โดยไม่ต้องรอ request จริง
//
// หลักการ : report = Routine_MasterPatternTS + Routine_MasterPatternLab
//           เฉพาะแถวที่ ReportOrder != 0 , เรียงตาม ReportOrder
//           ถ้า ReportOrder ซ้ำกันถือเป็นรายการเดียวกัน (ของจริงเอาผลมาเฉลี่ย)
//           ค่าผลวิเคราะห์ปล่อยว่างไว้ทั้งหมด
// -------------------------------------------------------------------------

function safe(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function sqlEscape(value) {
  return safe(value).replace(/'/g, "''");
}

function reportOrderValue(value) {
  const num = parseFloat(safe(value));
  return isNaN(num) ? null : num;
}

function isReportRow(row) {
  const order = reportOrderValue(row.ReportOrder);
  return order !== null && order !== 0;
}

// เลือกค่าแรกที่ไม่ว่างจากรายการแถว
function firstFilled(rows, field) {
  for (let i = 0; i < rows.length; i++) {
    const value = safe(rows[i][field]);
    if (value !== "" && value !== "-") return value;
  }
  return "";
}

function buildPreviewRow(row, source, header) {
  return {
    ID: "",
    ReqNo: header.ReqNo,
    CustFull: header.CustFull,
    PatternReport: header.PatternReport,
    ReportOrder: safe(row.ReportOrder),
    SampleNo: safe(row.SampleNo),
    GroupNameTS: safe(row.GroupNameTS),
    SampleGroup: safe(row.SampleGroup),
    SampleType: safe(row.SampleType),
    SampleTank: safe(row.SampleTank),
    SampleName: safe(row.SampleName),
    ProcessReportName: safe(row.ProcessReportName),
    SamplingDate: header.SamplingDate,
    CreateReportDate: header.CreateReportDate,
    ItemNo: safe(row.ItemNo),
    ItemName: safe(row.ItemName),
    ItemReportName: safe(row.ItemReportName),
    StdFactor: safe(row.StdFactor),
    StdMin: safe(row.StdMin),
    StdSymbol: safe(row.StdSymbol),
    StdMax: safe(row.StdMax),
    ControlRange: safe(row.ControlRange),
    // preview : ไม่ใส่ค่าผลวิเคราะห์
    ResultIn: "",
    ResultReport: "",
    Evaluation: "-",
    Incharge: header.Incharge,
    SubLeader: header.SubLeader,
    SubLeaderTime: "",
    GL: header.GL,
    GLTime: "",
    JP: header.JP,
    JPTime: "",
    DGM: header.DGM,
    DGMTime: "",
    ReportCompleteDate: "",
    NextApprover: "",
    Comment1: "",
    Comment2: "",
    Comment3: "",
    Comment4: "",
    Comment5: "",
    Comment6: "",
    Comment7: "",
    Comment8: "",
    Comment9: "",
    Comment10: "",
    ReviseNo: 0,
    SourceTable: source,
  };
}

router.post("/KACReportData_PreviewMasterReport", async (req, res) => {
  console.log("in _PreviewMasterReport");
  try {
    const custShort = safe(req.body.CustShort);
    const custFullIn = safe(req.body.CustFull);

    if (custShort === "" && custFullIn === "") {
      return res.send("ERROR");
    }

    const whereCust =
      custShort !== ""
        ? `CustShort = N'${sqlEscape(custShort)}'`
        : `CustFull = N'${sqlEscape(custFullIn)}'`;

    const dbTS = await mssql.qurey(
      `select * from [SAR].[dbo].[Routine_MasterPatternTS] where ${whereCust} order by ReportOrder asc;`
    );
    const dbLab = await mssql.qurey(
      `select * from [SAR].[dbo].[Routine_MasterPatternLab] where ${whereCust} order by ReportOrder asc;`
    );

    const rowsTS = (dbTS.recordset || []).filter(isReportRow);
    const rowsLab = (dbLab.recordset || []).filter(isReportRow);

    if (rowsTS.length === 0 && rowsLab.length === 0) {
      console.log("PreviewMasterReport : no report row (ReportOrder != 0)");
      return res.send("NODATA");
    }

    const allMasterTS = dbTS.recordset || [];
    const allMasterLab = dbLab.recordset || [];

    // report ใช้ getUTC* ในการอ่านวันที่ จึงส่งเป็นเที่ยงคืน UTC ของวันนี้
    // เพื่อให้แสดงวันที่ตรงกับวันปัจจุบัน
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const now =
      `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}` +
      "T00:00:00.000Z";

    const header = {
      // ReqNo ปลอมสำหรับ preview เท่านั้น (กันไปทับไฟล์ report ของจริง)
      ReqNo:
        "PREVIEW-" +
        (custShort !== "" ? custShort : custFullIn).replace(/[^A-Za-z0-9_-]/g, "_"),
      CustFull:
        firstFilled(allMasterTS, "CustFull") ||
        firstFilled(allMasterLab, "CustFull") ||
        custFullIn,
      PatternReport: firstFilled(allMasterTS, "PatternReport"),
      SamplingDate: now,
      CreateReportDate: now,
      Incharge:
        firstFilled(allMasterTS, "Incharge") || firstFilled(allMasterLab, "Incharge"),
      SubLeader: firstFilled(allMasterTS, "SubLeader"),
      GL: firstFilled(allMasterTS, "GL"),
      JP: firstFilled(allMasterTS, "JP"),
      DGM: firstFilled(allMasterTS, "DGM"),
    };

    // รวม TS (เทียบเท่า Routine_ManualDataInput) + Lab (เทียบเท่า Routine_RequestLab)
    let dataReport = [];
    rowsTS.forEach((row) => dataReport.push(buildPreviewRow(row, "TS", header)));
    rowsLab.forEach((row) => dataReport.push(buildPreviewRow(row, "LAB", header)));

    // เรียงตาม ReportOrder
    dataReport.sort((a, b) => {
      const orderA = reportOrderValue(a.ReportOrder);
      const orderB = reportOrderValue(b.ReportOrder);
      if (orderA === orderB) {
        // ของจริง manual input มาก่อน lab (UNION ... order by ReportOrder)
        if (a.SourceTable === b.SourceTable) return 0;
        return a.SourceTable === "TS" ? -1 : 1;
      }
      return orderA - orderB;
    });

    // ReportOrder ซ้ำกัน = รายการเดียวกัน (ของจริงเอาผลมาเฉลี่ยเหลือแถวเดียว)
    const merged = [];
    const seenOrder = new Set();
    dataReport.forEach((row) => {
      const key = reportOrderValue(row.ReportOrder);
      if (seenOrder.has(key)) return;
      seenOrder.add(key);
      merged.push(row);
    });
    dataReport = merged;

    dataReport = await createReport.ReplaceItemName(dataReport);

    masterDoc.setReqNo(header.ReqNo);
    masterDocYearly.setReqNo(header.ReqNo);

    const pdf = await createpdf.SelectPattern(dataReport);
    if (typeof pdf !== "string") {
      console.log("PreviewMasterReport : create pdf failed");
      console.log(pdf);
      return res.send("ERROR");
    }
    return res.send(pdf);
  } catch (error) {
    console.log(error);
    return res.send("ERROR");
  }
});

module.exports = router;
