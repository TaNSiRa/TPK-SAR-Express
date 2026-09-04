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

// ดึงข้อความ error ที่อ่านรู้เรื่องออกมาจาก error object / ค่าอะไรก็ตาม
function errText(value) {
  if (value === null || value === undefined) return "no result";
  if (value instanceof Error) return value.message || String(value);
  if (typeof value === "object" && value.message) return String(value.message);
  return String(value);
}

function reportOrderValue(value) {
  const num = parseFloat(safe(value));
  return isNaN(num) ? null : num;
}

// Routine_KACReport เก็บ ReportOrder / SampleNo / ItemNo เป็น int
// pattern บางตัวเทียบด้วย === (เช่น ReportOrder === 101, 105, 106 ของบล็อครูป)
// ถ้าส่งเป็น string จะไม่ match แล้วแถวนั้นจะหายไปจาก report
function numValue(value, fallback) {
  const num = parseFloat(safe(value));
  return isNaN(num) ? fallback : num;
}

const EMPTY_COMMENTS = {
  Comment1: "", Comment2: "", Comment3: "", Comment4: "", Comment5: "",
  Comment6: "", Comment7: "", Comment8: "", Comment9: "", Comment10: "",
};

// comment ไม่ได้อยู่ใน master (คนกรอกตอนสร้าง report จริง)
// preview จึงหยิบ comment ของ report ล่าสุดของลูกค้ารายนั้นมาแสดง
// เพื่อให้หน้าตา report ตัวอย่างเหมือนของจริง
async function loadLatestComments(custFull) {
  if (safe(custFull) === "") return EMPTY_COMMENTS;
  try {
    const db = await mssql.qurey(
      `select top 1 Comment1, Comment2, Comment3, Comment4, Comment5,
              Comment6, Comment7, Comment8, Comment9, Comment10
       from [SAR].[dbo].[Routine_KACReport]
       where CustFull = N'${sqlEscape(custFull)}'
       order by CreateReportDate desc;`
    );
    if (!db || !db.recordset || db.recordset.length === 0) return EMPTY_COMMENTS;
    const found = db.recordset[0];
    const out = {};
    Object.keys(EMPTY_COMMENTS).forEach((key) => {
      out[key] = safe(found[key]);
    });
    return out;
  } catch (err) {
    console.log("PreviewMasterReport : โหลด comment ล่าสุดไม่สำเร็จ", err);
    return EMPTY_COMMENTS;
  }
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
    ReportOrder: numValue(row.ReportOrder, 0),
    SampleNo: numValue(row.SampleNo, 0),
    GroupNameTS: safe(row.GroupNameTS),
    SampleGroup: safe(row.SampleGroup),
    SampleType: safe(row.SampleType),
    SampleTank: safe(row.SampleTank),
    SampleName: safe(row.SampleName),
    ProcessReportName: safe(row.ProcessReportName),
    SamplingDate: header.SamplingDate,
    CreateReportDate: header.CreateReportDate,
    ItemNo: numValue(row.ItemNo, 0),
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
    SubLeaderTime: null,
    GL: header.GL,
    GLTime: null,
    JP: header.JP,
    JPTime: null,
    DGM: header.DGM,
    DGMTime: null,
    InchargeTime: null,
    ReportCompleteDate: null,
    NextApprover: "",
    ...header.comments,
    ReviseNo: 0,
    SourceTable: source,
  };
}

// สร้างชุดข้อมูล report จำลองจาก master pattern (แยกออกมาเพื่อให้เทสได้)
async function buildPreviewData(custShortIn, custFullIn2) {
  const custShort = safe(custShortIn);
  const custFullIn = safe(custFullIn2);

  if (custShort === "" && custFullIn === "") {
    return { error: "ไม่ได้ระบุลูกค้า" };
  }

  const whereCust =
      custShort !== ""
        ? `CustShort = N'${sqlEscape(custShort)}'`
        : `CustFull = N'${sqlEscape(custFullIn)}'`;

    const dbTS = await mssql.qurey(
      `select * from [SAR].[dbo].[Routine_MasterPatternTS] where ${whereCust} order by ReportOrder asc;`
    );
    // ถ้า query พัง mssql.qurey จะคืน error object (ไม่มี recordset)
    // ต้องแยกให้ออกจากกรณี "ไม่มีข้อมูล" ไม่งั้นจะเข้าใจผิดว่าลูกค้าไม่มีข้อมูล
    if (!dbTS || !dbTS.recordset) {
      return { error: "อ่าน Routine_MasterPatternTS ไม่สำเร็จ : " + errText(dbTS) };
    }
    const dbLab = await mssql.qurey(
      `select * from [SAR].[dbo].[Routine_MasterPatternLab] where ${whereCust} order by ReportOrder asc;`
    );
    if (!dbLab || !dbLab.recordset) {
      return { error: "อ่าน Routine_MasterPatternLab ไม่สำเร็จ : " + errText(dbLab) };
    }

    const rowsTS = (dbTS.recordset || []).filter(isReportRow);
    const rowsLab = (dbLab.recordset || []).filter(isReportRow);

    if (rowsTS.length === 0 && rowsLab.length === 0) {
      console.log("PreviewMasterReport : no report row (ReportOrder != 0)");
      return { noData: true };
    }

    const allMasterTS = dbTS.recordset || [];
    const allMasterLab = dbLab.recordset || [];

    // Routine_KACReport เก็บวันที่เป็น datetime (อ่านออกมาเป็น Date object)
    // และ report อ่านค่าด้วย getUTC* จึงใช้เที่ยงคืน UTC ของวันนี้
    const today = new Date();
    const now = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );

    const custFullFound =
      firstFilled(allMasterTS, "CustFull") ||
      firstFilled(allMasterLab, "CustFull") ||
      custFullIn;

    const header = {
      comments: await loadLatestComments(custFullFound),
      // ReqNo ปลอมสำหรับ preview เท่านั้น (กันไปทับไฟล์ report ของจริง)
      ReqNo:
        "PREVIEW-" +
        (custShort !== "" ? custShort : custFullIn).replace(/[^A-Za-z0-9_-]/g, "_"),
      CustFull: custFullFound,
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

  return { dataReport: dataReport, reqNo: header.ReqNo, custFull: header.CustFull };
}

// pattern บางแบบ (รายงานรายปี / มีกราฟย้อนหลัง เช่น Y2TM, BCM, MMTHNEW)
// ไม่ได้สร้างตารางจาก dataReport ที่ส่งเข้าไป แต่ไป query ประวัติจาก Routine_KACReport เอง
// ถ้าลูกค้ายังไม่มีประวัติของปีปัจจุบัน pattern พวกนี้จะพังเพราะ array ว่าง
// ใช้ตรวจเพื่อบอกสาเหตุให้ผู้ใช้เข้าใจ แทนที่จะขึ้น error ดิบ ๆ
async function countHistoryThisYear(custFull) {
  try {
    const db = await mssql.qurey(
      `select count(*) as c from [SAR].[dbo].[Routine_KACReport]
       where CustFull = N'${sqlEscape(custFull)}' and YEAR(SamplingDate) = YEAR(GETDATE());`
    );
    if (!db || !db.recordset || db.recordset.length === 0) return -1;
    return db.recordset[0].c;
  } catch (err) {
    return -1;
  }
}

router.post("/KACReportData_PreviewMasterReport", async (req, res) => {
  console.log("in _PreviewMasterReport");
  try {
    const built = await buildPreviewData(req.body.CustShort, req.body.CustFull);
    if (built.noData) return res.send("NODATA");
    if (built.error) {
      console.log("PreviewMasterReport : " + built.error);
      return res.send("ERROR: " + built.error);
    }

    const pattern = built.dataReport[0].PatternReport || "K1 (default)";
    console.log(
      `PreviewMasterReport : ${built.reqNo} | pattern = ${pattern} | rows = ${built.dataReport.length}`
    );

    masterDoc.setReqNo(built.reqNo);
    masterDocYearly.setReqNo(built.reqNo);

    let pdf;
    try {
      pdf = await createpdf.SelectPattern(built.dataReport);
    } catch (err) {
      // ตอนนี้ pattern จะ throw แทนที่จะคืน Error object
      // รับไว้ตรงนี้เพื่อให้สรุปสาเหตุพร้อม hint ด้านล่างทำงานเหมือนเดิม
      pdf = err;
    }
    if (typeof pdf !== "string") {
      console.log("PreviewMasterReport : create pdf failed");
      console.log(pdf);
      const history = await countHistoryThisYear(built.custFull);
      const hint =
        history === 0
          ? `\npattern '${pattern}' สร้าง report จากประวัติใน Routine_KACReport ของปีปัจจุบัน` +
            `\nแต่ลูกค้ารายนี้ยังไม่มีข้อมูลของปีนี้ จึงยัง preview ไม่ได้`
          : "";
      return res.send(`ERROR: สร้าง PDF pattern '${pattern}' ไม่สำเร็จ${hint}\n${errText(pdf)}`);
    }
    return res.send(pdf);
  } catch (error) {
    console.log(error);
    return res.send("ERROR: " + errText(error));
  }
});

module.exports = router;
module.exports.buildPreviewData = buildPreviewData;
