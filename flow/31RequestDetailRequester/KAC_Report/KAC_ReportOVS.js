const express = require("express");
const router = express.Router();
const mssql = require("../../../function/mssql.js");
const dtget = require("../../../function/dateTime.js");
const createpdf = require("./Form_Report/Pattern_0Select.js");
const createpdfOvs = require("./Form_Report_OVS/Pattern_0Select_OVS.js");
const ovsUtil = require("./Form_Report_OVS/PatternComponent_OVS/Ovs_Util.js");
const createReport = require("../function/createReport.js");
const masterDoc = require("./Form_Report/PatternComponent/Pattern_5MasterDoc.js");
const masterDocYearly = require("./Form_Report/PatternComponent/Pattern_1MainHeadSetYear.js");

// -------------------------------------------------------------------------
// REPORT ของงาน OVS (Overseas)
//
// งานปกติ : report = Routine_ManualDataInput + Routine_RequestLab
//           ผู้ใช้กดดูในหน้า KAC Report -> บันทึกลง Routine_KACReport
//           แล้ว CreateReport ค่อยอ่าน Routine_KACReport ไปทำ PDF
//
// งาน OVS : ไม่มีข้อมูลฝั่ง TS (Routine_ManualDataInput ว่าง) และไม่ต้องทำ
//           ขั้น Routine_KACReport จึงสร้าง report จาก Routine_RequestLab
//           ตรง ๆ ได้เลย โดยไม่เขียนอะไรลง DB
//
// Routine_RequestLab ไม่มีคอลัมน์ PatternReport จึงต้องไปดูของลูกค้ารายนั้นใน
// Routine_MasterPatternTS ก่อน แล้วค่อยเลือกแบบฟอร์ม :
//   - มี pattern ใน Form_Report_OVS -> ใช้แบบฟอร์มของ OVS (แยกจาก SAR เดิม)
//   - ยังไม่มี                      -> ตกไปใช้ Form_Report ของ SAR เหมือนเดิม
// -------------------------------------------------------------------------

function safe(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function sqlEscape(value) {
  return safe(value).replace(/'/g, "''");
}

function errText(value) {
  if (value === null || value === undefined) return "no result";
  if (value instanceof Error) return value.message || String(value);
  if (typeof value === "object" && value.message) return String(value.message);
  return String(value);
}

// Routine_KACReport เก็บ ReportOrder / SampleNo / ItemNo เป็น int
// pattern บางตัวเทียบด้วย === (เช่น ReportOrder === 101, 105, 106 ของบล็อครูป)
// ถ้าส่งเป็น string จะไม่ match แล้วแถวนั้นจะหายไปจาก report
function numValue(value, fallback) {
  const num = parseFloat(safe(value));
  return isNaN(num) ? fallback : num;
}

// คืนค่าเป็นตัวเลขเฉพาะเมื่อแปลงได้ทั้งสตริง (กันพาธรูป / ข้อความหลุดมาเป็นเลข)
function asNumber(value) {
  const text = safe(value);
  if (text === "") return null;
  const num = Number(text);
  return isNaN(num) ? null : num;
}

// ผลที่ไม่ได้เป็นค่าวัดจริง ให้เป็น N/A เหมือนฝั่ง Flutter
const NOT_A_RESULT = [
  "DELIVERY ERROR",
  "INSTRUMENT BREAKDOWN",
  "ANALYSIS ERROR",
  "SAMPLE ERROR",
  "",
  "-",
];

function normalizeResult(value) {
  const text = safe(value);
  if (NOT_A_RESULT.indexOf(text.toUpperCase()) !== -1) return "N/A";
  return text;
}

// คอลัมน์ผลที่ใช้ใน Routine_RequestLab
//   preview (TTC กดดู report ก่อน) : ResultApprove = ผลที่ TTC approve แล้ว
//   create report (requester)      : ResultComplete = ผลที่ requester กด complete
//                                    ซึ่งเป็นคอลัมน์เดียวกับที่ระบบเดิมใช้ใน
//                                    searchKACReportData
const RESULT_FIELD_PREVIEW = "ResultApprove";
const RESULT_FIELD_CREATE = "ResultComplete";

function resultOf(row, resultField) {
  return safe(row[resultField || RESULT_FIELD_PREVIEW]);
}

// ระบบใช้ "มี pic_ อยู่ในค่า" เป็นตัวบอกว่าผลนั้นเป็นรูป (ตรงกับฝั่ง Flutter)
// แต่ถ้ายังไม่ได้ลงผล ค่าจะว่าง จึงต้องดูที่เครื่องมือด้วย ไม่งั้นแถวรูปจะไป
// โผล่เป็นรายการธรรมดาในตาราง
function isPictureRow(row, resultField) {
  if (resultOf(row, resultField).indexOf("pic_") !== -1) return true;
  return safe(row.InstrumentName).toUpperCase().indexOf("SEM") !== -1;
}

// process พวกนี้เป็นข้อความ (ชื่อชิ้นงาน / lot no.) ไม่ต้องตัดเกรดด้วยตัวเลข
const TEXT_PROCESS = [
  "Part name",
  "Part no.",
  "Customer Lot no.",
  "TP Lot no.",
  "Quantity",
];

const EMPTY_COMMENTS = {
  Comment1: "", Comment2: "", Comment3: "", Comment4: "", Comment5: "",
  Comment6: "", Comment7: "", Comment8: "", Comment9: "", Comment10: "",
};

// comment เป็นข้อความที่คนกรอกตอนสร้าง report จริง ไม่มีใน Routine_RequestLab
// หยิบของ report ล่าสุดของลูกค้ารายนั้นมาแสดง ถ้าไม่เคยมีก็ปล่อยว่าง
// (ใช้เฉพาะทางที่ตกไปใช้แบบฟอร์มของ SAR เดิม)
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
    console.log("LoadReportOVS : โหลด comment ล่าสุดไม่สำเร็จ", err);
    return EMPTY_COMMENTS;
  }
}

// pattern / ผู้เซ็น อยู่ใน master ของลูกค้า
// ฝั่ง Flutter อ่านจากแถว ReportOrder 9999 ("No Actual") ก่อน จึงทำแบบเดียวกัน
async function loadHeaderFromMaster(custShort, custFull) {
  const empty = { PatternReport: "", SubLeader: "", GL: "", JP: "", DGM: "" };
  const where =
    safe(custShort) !== ""
      ? `CustShort = N'${sqlEscape(custShort)}'`
      : `CustFull = N'${sqlEscape(custFull)}'`;
  const db = await mssql.qurey(
    `select PatternReport, SubLeader, GL, JP, DGM, ReportOrder
     from [SAR].[dbo].[Routine_MasterPatternTS] where ${where} order by ReportOrder asc;`
  );
  if (!db || !db.recordset || db.recordset.length === 0) return empty;
  const rows = db.recordset;
  const lastRow = rows[rows.length - 1];
  const preferred = numValue(lastRow.ReportOrder, 0) === 9999 ? lastRow : rows[0];
  const pick = (field) => {
    const value = safe(preferred[field]);
    if (value !== "" && value !== "-") return value;
    for (let i = 0; i < rows.length; i++) {
      const other = safe(rows[i][field]);
      if (other !== "" && other !== "-") return other;
    }
    return "";
  };
  // ระบบเดิมเก็บ '-' ใน Routine_ManualDataInput เมื่อไม่มีคนในสายนั้น ไม่ใช่ค่าว่าง
  // และหน้า requester ใช้ SubLeader != "" เป็นเงื่อนไขโชว์แถว REPORT
  // ถ้าคืน "" แถว REPORT จะไม่ขึ้นเลย จึงต้องคง '-' ไว้ให้เหมือนระบบเดิม
  // (รายชื่อผู้เซ็นใน PDF กรอง '-' ออกอยู่แล้ว)
  const pickApprover = (field) => {
    const value = pick(field);
    return value === "" ? "-" : value;
  };

  return {
    PatternReport: pick("PatternReport"),
    SubLeader: pickApprover("SubLeader"),
    GL: pickApprover("GL"),
    JP: pickApprover("JP"),
    DGM: pickApprover("DGM"),
  };
}

// ค่า CoatingAppearance / CrystalSize ไม่ได้อยู่ใน Routine_RequestLab
// แต่อยู่ในตารางของเครื่อง SEM (Ovs) ผูกกันด้วย SampleCode
async function loadSemOvs(reqNo) {
  const map = {};
  const db = await mssql.qurey(
    `select SampleCode, CoatingAppearance_1, CrystalSize_1
     from [SAR].[dbo].[Instrument_SEM_Ovs] where ReqNo = '${sqlEscape(reqNo)}';`
  );
  if (!db || !db.recordset) return map;
  db.recordset.forEach((row) => {
    map[safe(row.SampleCode)] = {
      coatingAppearance: safe(row.CoatingAppearance_1),
      crystalSize: safe(row.CrystalSize_1),
    };
  });
  return map;
}

// ค่าดิบของเครื่อง F-F (RawData_1 / RawData_2) ผูกกับ Routine_RequestLab ด้วย
// RequestSample_ID = Routine_RequestLab.ID
// แถวเดียวกันอาจถูกวัดซ้ำ (recheck) จึงเอาแถวล่าสุด (ID มากสุด) ของแต่ละ RequestSample_ID
async function loadFfRawData(reqNo) {
  const map = {};
  const db = await mssql.qurey(
    `select RequestSample_ID, RawData_1, RawData_2
     from [SAR].[dbo].[Instrument_FF] where ReqNo = '${sqlEscape(reqNo)}'
     order by ID desc;`
  );
  if (!db || !db.recordset) return map;
  db.recordset.forEach((row) => {
    const key = safe(row.RequestSample_ID);
    if (key === "" || map[key]) return;
    map[key] = [safe(row.RawData_1), safe(row.RawData_2)];
  });
  return map;
}

// master เก็บ '-' เมื่อไม่มีคนในสายนั้น ในช่องเซ็นให้แสดงเป็นว่าง
function signerName(value) {
  const text = safe(value);
  return text === "-" ? "" : text;
}

// คนกด create report และเวลาที่แต่ละคน approve อยู่ใน Routine_KACReport
// ตอน preview จากหน้า TTC ยังไม่มีแถว -> คืนค่าว่าง ช่องเซ็นจะว่างไว้
async function loadKacReportSign(reqNo) {
  const empty = { incharge: "", inchargeTime: null, dgmTime: null, jpTime: null };
  const db = await mssql.qurey(
    `select top 1 Incharge, InchargeTime, DGMTime, JPTime
       from [SAR].[dbo].[Routine_KACReport]
      where ReqNo = '${sqlEscape(reqNo)}' order by ReportOrder asc;`
  );
  if (!db || !db.recordset || db.recordset.length === 0) return empty;
  const row = db.recordset[0];
  return {
    incharge: safe(row.Incharge),
    inchargeTime: row.InchargeTime || null,
    dgmTime: row.DGMTime || null,
    jpTime: row.JPTime || null,
  };
}

// ตำแหน่งใต้ชื่อผู้เซ็นในรายงาน OVS ใช้คอลัมน์ Ovs_Position
async function loadOvsPositions(names) {
  const map = {};
  const wanted = names.filter((name) => safe(name) !== "");
  if (wanted.length === 0) return map;
  const list = wanted.map((name) => `N'${sqlEscape(name)}'`).join(",");
  const db = await mssql.qurey(
    `select Name, Ovs_Position from [SAR].[dbo].[Master_User] where Name in (${list});`
  );
  if (!db || !db.recordset) return map;
  db.recordset.forEach((row) => {
    map[safe(row.Name)] = safe(row.Ovs_Position);
  });
  return map;
}

// ปัดทศนิยมของผลตามชนิด item เหมือน KACReportData.dart
function formatResult(row) {
  const num = asNumber(row.ResultIn);
  if (num === null) return safe(row.ResultIn);
  if (safe(row.ItemReportName) === "S.G. (Nox rust)") return num.toFixed(2);
  if (safe(row.CustFull) === "THAI WIRE PRODUCTS PUBLIC COMPANY LIMITED") {
    return num.toFixed(2);
  }
  return num.toFixed(1);
}

// std ที่ว่าง / '-' / '0' แปลว่าไม่ได้คุมด้านนั้น
function stdBound(value, fallback) {
  const text = safe(value);
  if (text === "" || text === "-" || text === "0") return fallback;
  const num = asNumber(text);
  return num === null ? fallback : num;
}

function evaluateRow(row) {
  const result = safe(row.ResultIn);
  if (result === "" || result === "N/A") return "-";
  if (safe(row.ControlRange) === result) return "PASS";
  if (TEXT_PROCESS.indexOf(safe(row.ProcessReportName)) !== -1) return "PASS";
  const num = asNumber(result);
  if (num === null) return "-";
  if (num > stdBound(row.StdMax, 99999)) return "HIGH";
  if (num < stdBound(row.StdMin, -99999)) return "LOW";
  const controlRange = safe(row.ControlRange);
  if (controlRange === "" || controlRange === "-") return "-";
  return "PASS";
}

// ReportOrder ซ้ำกัน = รายการเดียวกัน (item เดียวกันหลาย sample) เอาผลมาเฉลี่ย
// ใช้เฉพาะทางที่ตกไปใช้แบบฟอร์มของ SAR เดิม ซึ่งออกรายงานใบเดียวต่อ request
// แบบฟอร์มของ OVS แยกหน้าตาม tank อยู่แล้ว จึงไม่ต้องรวมแถว
function mergeSameReportOrder(rows) {
  const merged = [];
  let i = 0;
  while (i < rows.length) {
    const group = [rows[i]];
    let j = i + 1;
    while (j < rows.length && rows[j].ReportOrder === rows[i].ReportOrder) {
      group.push(rows[j]);
      j++;
    }
    const head = group[0];
    if (group.length > 1) {
      const numbers = [];
      group.forEach((row) => {
        const num = asNumber(row.ResultIn);
        if (num !== null) numbers.push(num);
      });
      if (numbers.length > 0) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        head.ResultIn = (sum / numbers.length).toFixed(2);
      } else {
        // ไม่มีค่าที่เป็นตัวเลขเลย (เช่นแถวรูป ที่ผลเป็นพาธไฟล์)
        // เอาค่าจริงของ sample ไหนก็ได้ในกลุ่ม ไม่งั้นรูปจะหายถ้าไม่ได้อยู่แถวแรก
        const filled = group.find((row) => safe(row.ResultIn) !== "N/A");
        if (filled) head.ResultIn = filled.ResultIn;
      }
    }
    merged.push(head);
    i = j;
  }
  return merged;
}

// -------------------------------------------------------------------------
// อ่านข้อมูลดิบของ request : 1 แถว = 1 item ของ 1 sample
// -------------------------------------------------------------------------
// includeUnordered = true : เอาแถว ReportOrder = 0 มาด้วย (ใช้กับ pattern ที่ UsesAllItems)
// แถว ReportOrder = 0 (item ที่กดเพิ่ม) เรียงไว้ท้ายของแต่ละ sample เพราะข้อมูลระดับ
// sample (SampleName / ProcessReportName / SampleRemark) หยิบจากแถวแรกที่เจอ
// และแถวที่อยู่ใน pattern เป็นแถวที่เชื่อถือได้กว่า
async function loadRequestRows(reqNo, includeUnordered) {
  const orderFilter = includeUnordered ? "" : " and ReportOrder != 0";
  const db = await mssql.qurey(
    `select [ID]
           ,[CustFull]
           ,[CustShort]
           ,[ReqNo]
           ,[ReportOrder]
           ,[SampleNo]
           ,[SampleCode]
           ,[GroupNameTS]
           ,[SampleGroup]
           ,[SampleType]
           ,[SampleTank]
           ,[SampleName]
           ,[SampleRemark]
           ,[ProcessReportName]
           ,[SamplingDate]
           ,[ReceiveDate]
           ,[ItemNo]
           ,[ItemName]
           ,[ItemReportName]
           ,[InstrumentName]
           ,[StdFactor]
           ,[StdMin]
           ,[StdSymbol]
           ,[StdMax]
           ,[ControlRange]
           ,[ResultApprove]
           ,[ResultComplete]
           ,[ResultApproveDate]
           ,[ResultApproveRemark]
           ,[UserApprove]
           ,[Incharge]
     from [SAR].[dbo].[Routine_RequestLab]
     where ReqNo = '${sqlEscape(reqNo)}'${orderFilter}
     order by SampleNo asc,
              case when ReportOrder = 0 then 1 else 0 end asc,
              ReportOrder asc, ItemNo asc;`
  );
  return db;
}

// -------------------------------------------------------------------------
// ข้อมูลสำหรับแบบฟอร์มของ OVS : จัดกลุ่มตาม line (SampleTank)
// แต่ละ line มีหน้า quality of solution ของน้ำยา และหน้า performance ของชิ้นทดสอบ
// -------------------------------------------------------------------------
async function buildOvsReport(reqNoIn, resultFieldIn) {
  const reqNo = safe(reqNoIn);
  const resultField = resultFieldIn || RESULT_FIELD_PREVIEW;
  if (reqNo === "") return { error: "ไม่ได้ระบุเลขที่ request" };

  // อ่านทุกแถวก่อน เพราะต้องรู้ pattern ของลูกค้าก่อนจึงจะรู้ว่าต้องตัด
  // แถว ReportOrder = 0 ออกหรือไม่ (pattern ส่วนใหญ่ตัด , NPI ใช้ด้วย)
  const db = await loadRequestRows(reqNo, true);
  if (!db || !db.recordset) {
    return { error: "อ่าน Routine_RequestLab ไม่สำเร็จ : " + errText(db) };
  }
  if (db.recordset.length === 0) {
    return { error: "ไม่พบ " + reqNo + " ใน Routine_RequestLab" };
  }

  const custFull = safe(db.recordset[0].CustFull);
  const custShort = safe(db.recordset[0].CustShort);
  const master = await loadHeaderFromMaster(custShort, custFull);

  const rows = createpdfOvs.UsesAllItems(master.PatternReport)
    ? db.recordset
    : db.recordset.filter((row) => numValue(row.ReportOrder, 0) !== 0);
  if (rows.length === 0) {
    return {
      error:
        "ไม่พบรายการที่ต้องออก report ของ " +
        reqNo +
        " ใน Routine_RequestLab (ทุกแถวมี ReportOrder = 0)",
    };
  }

  const semOvs = await loadSemOvs(reqNo);
  const ffRawData = await loadFfRawData(reqNo);

  // วันที่ในหัวรายงาน
  let receiveDate = null;
  let reportingDate = null;
  let userApprove = "";
  rows.forEach((row) => {
    if (row.ReceiveDate && (!receiveDate || row.ReceiveDate < receiveDate)) {
      receiveDate = row.ReceiveDate;
    }
    if (
      row.ResultApproveDate &&
      (!reportingDate || row.ResultApproveDate > reportingDate)
    ) {
      reportingDate = row.ResultApproveDate;
    }
    if (userApprove === "") userApprove = safe(row.UserApprove);
  });

  // ช่องเซ็น 4 ช่องตายตัว เรียงซ้ายไปขวา :
  //   1. UserApprove   - คน approve ผลใน Routine_RequestLab
  //   2. Incharge      - คนกด create new report (เก็บใน Routine_KACReport)
  //   3. DGM , 4. JP   - สายอนุมัติจาก Routine_MasterPatternTS
  // ช่องที่ยังไม่มีชื่อก็ปล่อยกรอบว่างไว้ ไม่ยุบช่อง
  const kacSign = await loadKacReportSign(reqNo);
  const signerRows = [
    { name: signerName(userApprove), signed: safe(userApprove) !== "" },
    { name: signerName(kacSign.incharge), signed: kacSign.inchargeTime !== null },
    { name: signerName(master.DGM), signed: kacSign.dgmTime !== null },
    { name: signerName(master.JP), signed: kacSign.jpTime !== null },
  ];
  const positions = await loadOvsPositions(signerRows.map((s) => s.name));
  const signers = signerRows.map((signer) => ({
    name: signer.name,
    position: positions[signer.name] || "",
    signed: signer.signed && signer.name !== "",
  }));

  // จัดกลุ่ม : tank -> sample -> item
  const tankOrder = [];
  const tankMap = {};
  const sampleMap = {};

  rows.forEach((row) => {
    const tankName = safe(row.SampleTank);
    if (!tankMap[tankName]) {
      // Process & Product Name ของทุกหน้าใน line นี้ ใช้ SampleName ของ
      // sample แรกของ line (ตัวน้ำยา) ไม่ใช่ของชิ้นทดสอบ
      // แถวเรียงตาม SampleNo อยู่แล้ว แถวแรกที่เจอจึงเป็น SampleNo น้อยสุด
      tankMap[tankName] = {
        tankName: tankName,
        productName: safe(row.SampleName),
        solutions: [],
        performances: [],
      };
      tankOrder.push(tankName);
    }

    const sampleKey = tankName + "|" + numValue(row.SampleNo, 0);
    let sample = sampleMap[sampleKey];
    if (!sample) {
      const sampleCode = safe(row.SampleCode);
      const sem = semOvs[sampleCode] || {};
      sample = {
        sampleNo: numValue(row.SampleNo, 0),
        sampleCode: sampleCode,
        sampleName: safe(row.SampleName),
        // pattern NPI ใช้ SampleRemark เป็นช่อง Sampling Date ของแต่ละตัวอย่าง
        sampleRemark: safe(row.SampleRemark),
        // pattern PPI - Toyota ใช้ SamplingDate ของแต่ละตัวอย่าง (ไม่ใช่ของทั้ง request)
        samplingDate: row.SamplingDate || null,
        processReportName: safe(row.ProcessReportName),
        coatingAppearance: sem.coatingAppearance || "",
        crystalSize: sem.crystalSize || "",
        items: [],
        picture: null,
        isPerformance: false,
      };
      sampleMap[sampleKey] = sample;
      // ReportOrder >= 100 คือบล็อกของชิ้นทดสอบ ต่ำกว่านั้นเป็นน้ำยา
      if (numValue(row.ReportOrder, 0) >= 100) {
        sample.isPerformance = true;
        tankMap[tankName].performances.push(sample);
      } else {
        tankMap[tankName].solutions.push(sample);
      }
    }

    const result = resultOf(row, resultField);
    if (isPictureRow(row, resultField)) {
      sample.picture = {
        itemReportName: safe(row.ItemReportName),
        path: result.indexOf("pic_") !== -1 ? result : "",
      };
      return;
    }

    const item = {
      ReportOrder: numValue(row.ReportOrder, 0),
      // pattern NPI หาคอลัมน์ P-ratio / Ni / Mn จาก ItemName ไม่ใช่ ItemReportName
      ItemName: safe(row.ItemName),
      ItemReportName: safe(row.ItemReportName),
      ControlRange: safe(row.ControlRange),
      StdMin: safe(row.StdMin),
      StdMax: safe(row.StdMax),
      StdSymbol: safe(row.StdSymbol),
      Result: result,
      // pattern NPI แสดง remark ตอน approve ไว้ใต้ผลในวงเล็บ
      ApproveRemark: safe(row.ResultApproveRemark),
      // pattern PPI - Toyota ใช้ค่าดิบของ F-F แสดงในวงเล็บใต้ผลที่เป็น "< ..."
      FfRawData: ffRawData[safe(row.ID)] || [],
    };
    item.Evaluation = ovsUtil.evaluate(item);
    sample.items.push(item);
  });

  const tanks = tankOrder.map((name) => tankMap[name]);

  return {
    reqNo: reqNo,
    refNo: reqNo,
    custFull: custFull,
    custShort: custShort,
    patternReport: master.PatternReport,
    samplingDate: rows[0].SamplingDate,
    receiveDate: receiveDate,
    reportingDate: reportingDate,
    signers: signers,
    tanks: tanks,
  };
}

// -------------------------------------------------------------------------
// ข้อมูลรูปแบบเดียวกับ Routine_KACReport สำหรับตกไปใช้แบบฟอร์มของ SAR เดิม
// -------------------------------------------------------------------------
async function buildOvsReportData(reqNoIn, resultFieldIn) {
  const reqNo = safe(reqNoIn);
  const resultField = resultFieldIn || RESULT_FIELD_PREVIEW;
  if (reqNo === "") return { error: "ไม่ได้ระบุเลขที่ request" };

  const db = await loadRequestRows(reqNo);
  if (!db || !db.recordset) {
    return { error: "อ่าน Routine_RequestLab ไม่สำเร็จ : " + errText(db) };
  }
  if (db.recordset.length === 0) {
    return {
      error:
        "ไม่พบรายการที่ต้องออก report ของ " +
        reqNo +
        " ใน Routine_RequestLab (ทุกแถวมี ReportOrder = 0)",
    };
  }

  const rows = db.recordset
    .slice()
    .sort((a, b) => numValue(a.ReportOrder, 0) - numValue(b.ReportOrder, 0));
  const custFull = safe(rows[0].CustFull);
  const custShort = safe(rows[0].CustShort);
  const master = await loadHeaderFromMaster(custShort, custFull);
  const comments = await loadLatestComments(custFull);

  // report อ่านวันที่ด้วย getUTC* จึงใช้เที่ยงคืน UTC เหมือนค่าที่อ่านออกมาจาก DB
  const today = new Date();
  const now = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const samplingDate = rows[0].SamplingDate || now;

  let dataReport = rows.map((row) => ({
    ID: "",
    ReqNo: safe(row.ReqNo),
    CustFull: custFull,
    ReviseNo: 0,
    PatternReport: master.PatternReport,
    ReportOrder: numValue(row.ReportOrder, 0),
    SampleNo: numValue(row.SampleNo, 0),
    GroupNameTS: safe(row.GroupNameTS),
    SampleGroup: safe(row.SampleGroup),
    SampleType: safe(row.SampleType),
    SampleTank: safe(row.SampleTank),
    SampleName: safe(row.SampleName),
    ProcessReportName: safe(row.ProcessReportName),
    SamplingDate: samplingDate,
    CreateReportDate: now,
    ItemNo: numValue(row.ItemNo, 0),
    ItemName: safe(row.ItemName),
    ItemReportName: safe(row.ItemReportName),
    StdFactor: safe(row.StdFactor),
    StdMin: safe(row.StdMin),
    StdSymbol: safe(row.StdSymbol),
    StdMax: safe(row.StdMax),
    ControlRange: safe(row.ControlRange),
    // preview : คอลัมน์ R APPOV (ผลที่ TTC approve แล้ว) เพราะตอน TTC กดดู
    //           report ฝั่ง requester ยังไม่ได้ complete ผล
    // create  : ResultComplete เหมือนระบบเดิม (ดู RESULT_FIELD_* ด้านบน)
    ResultIn: normalizeResult(resultOf(row, resultField)),
    ResultReport: "",
    Evaluation: "-",
    Incharge: safe(row.Incharge),
    InchargeTime: null,
    SubLeader: master.SubLeader,
    SubLeaderTime: null,
    GL: master.GL,
    GLTime: null,
    JP: master.JP,
    JPTime: null,
    DGM: master.DGM,
    DGMTime: null,
    NextApprover: "",
    ReportCompleteDate: null,
    ReportRemark: "",
    ...comments,
  }));

  dataReport = mergeSameReportOrder(dataReport);
  dataReport.forEach((row) => {
    row.ResultIn = formatResult(row);
    row.ResultReport = row.ResultIn;
    row.Evaluation = evaluateRow(row);
  });
  dataReport = await createReport.ReplaceItemName(dataReport);

  return { dataReport: dataReport, reqNo: reqNo, custFull: custFull };
}

// -------------------------------------------------------------------------
// สร้าง PDF ของงาน OVS : มี pattern ของ OVS ใช้ของ OVS ไม่มีก็ตกไปใช้ฟอร์ม SAR เดิม
// ทุกทางที่ต้องออก report ของ OVS (preview / create / approve / อีเมล) เรียกตัวนี้
// เพราะ Pattern_0Select ของ SAR เดิมมี else ปิดท้ายที่ fallback เป็น K1 เสมอ
// -------------------------------------------------------------------------
async function createReportOvs(reqNoIn, resultFieldIn) {
  const reqNo = safe(reqNoIn);
  const resultField = resultFieldIn || RESULT_FIELD_PREVIEW;

  const built = await buildOvsReport(reqNo, resultField);
  if (built.error) throw new Error(built.error);

  const pattern = safe(built.patternReport);
  if (createpdfOvs.HasPattern(pattern)) {
    console.log(
      `createReportOvs : ${built.reqNo} | pattern OVS = ${pattern} | lines = ${built.tanks.length} | result = ${resultField}`
    );
    return await createpdfOvs.SelectPattern(built);
  }

  console.log(
    `createReportOvs : ${built.reqNo} | ยังไม่มี pattern OVS ของ '${pattern}' ใช้แบบฟอร์ม SAR เดิมแทน`
  );
  const legacy = await buildOvsReportData(reqNo, resultField);
  if (legacy.error) throw new Error(legacy.error);
  masterDoc.setReqNo(legacy.reqNo);
  masterDocYearly.setReqNo(legacy.reqNo);
  return await createpdf.SelectPattern(legacy.dataReport);
}

router.post("/KACReportData_LoadReportOVS", async (req, res) => {
  console.log("in _LoadReportOVS");
  try {
    // preview ของหน้า TTC ไม่ส่งอะไรมา -> ใช้ ResultApprove เหมือนเดิม
    // ถ้าส่ง ResultComplete มา -> ได้ตัวเลขชุดเดียวกับตอน create report
    const resultField =
      safe(req.body.ResultField) === RESULT_FIELD_CREATE
        ? RESULT_FIELD_CREATE
        : RESULT_FIELD_PREVIEW;

    const pdf = await createReportOvs(req.body.ReqNo, resultField);
    return res.send(pdf);
  } catch (error) {
    // ต้องตอบ 500 ไม่ใช่ 200 เพราะฝั่ง Flutter เอา body ไป base64Decode ตรง ๆ
    const message = errText(error);
    console.error("[LoadReportOVS] " + req.body.ReqNo + " : " + message);
    return res.status(500).send("ERROR: " + message);
  }
});

// -------------------------------------------------------------------------
// CREATE REPORT ของงาน OVS
//
// ระบบเดิม : Flutter ส่งแถวที่ผู้ใช้แก้ในหน้า RAW REPORT DATA มาให้ insert
// งาน OVS  : ไม่มีข้อมูลฝั่ง TS ให้แก้ จึง build ที่ฝั่งนี้จาก Routine_RequestLab
//            เหมือนทาง preview ของหน้า TTC แล้วค่อยเขียนลง Routine_KACReport
//            ต่างกันแค่ใช้ ResultComplete แทน ResultApprove
//
// การเขียน Routine_KACReport ทำให้ SubLeader/GL/JP/DGM จาก master ลงไปอยู่ใน
// ตาราง แถว REPORT ในหน้า requester (ซึ่งเช็ค SubLeader != "") จึงจะขึ้น
// -------------------------------------------------------------------------

// ลำดับผู้อนุมัติ : เอาคนแรกในสายที่มีชื่อจริง ถ้าไม่มีเลยถือว่า report จบทันที
function pickNextApprover(row) {
  const chain = [row.SubLeader, row.GL, row.DGM, row.JP];
  for (let i = 0; i < chain.length; i++) {
    const name = safe(chain[i]);
    if (name !== "" && name !== "-") return name;
  }
  return "COMPLETE";
}

function sqlText(value) {
  return `N'${sqlEscape(value)}'`;
}

function buildInsertQuery(rows, dt, incharge, nextApprover) {
  const columns = `[ReqNo],[CustFull],[ReviseNo],[PatternReport],[ReportOrder],[SampleNo]
      ,[GroupNameTS],[SampleGroup],[SampleType],[SampleTank],[SampleName],[ProcessReportName]
      ,[SamplingDate],[CreateReportDate],[ItemNo],[ItemName],[ItemReportName]
      ,[StdFactor],[StdMax],[StdSymbol],[StdMin],[ControlRange]
      ,[ResultIn],[ResultReport],[Evaluation]
      ,[Incharge],[InchargeTime],[InchargeTime_0]
      ,[SubLeader],[GL],[JP],[DGM],[NextApprover]
      ,[Comment1],[Comment2],[Comment3],[Comment4],[Comment5]
      ,[Comment6],[Comment7],[Comment8],[Comment9],[Comment10],[ReportRemark]`;

  const values = rows
    .map(
      (row) => `(${sqlText(row.ReqNo)}
      ,${sqlText(row.CustFull)}
      ,'0'
      ,${sqlText(row.PatternReport)}
      ,'${numValue(row.ReportOrder, 0)}'
      ,'${numValue(row.SampleNo, 0)}'
      ,${sqlText(row.GroupNameTS)}
      ,${sqlText(row.SampleGroup)}
      ,${sqlText(row.SampleType)}
      ,${sqlText(row.SampleTank)}
      ,${sqlText(row.SampleName)}
      ,${sqlText(row.ProcessReportName)}
      ,'${dtget.toDateSQL(row.SamplingDate)}'
      ,'${dt}'
      ,'${numValue(row.ItemNo, 0)}'
      ,${sqlText(row.ItemName)}
      ,${sqlText(row.ItemReportName)}
      ,${sqlText(row.StdFactor)}
      ,${sqlText(row.StdMax)}
      ,${sqlText(row.StdSymbol)}
      ,${sqlText(row.StdMin)}
      ,${sqlText(row.ControlRange)}
      ,${sqlText(row.ResultIn)}
      ,${sqlText(row.ResultReport)}
      ,${sqlText(row.Evaluation)}
      ,${sqlText(incharge)}
      ,'${dt}'
      ,'${dt}'
      ,${sqlText(row.SubLeader)}
      ,${sqlText(row.GL)}
      ,${sqlText(row.JP)}
      ,${sqlText(row.DGM)}
      ,${sqlText(nextApprover)}
      ,${sqlText(row.Comment1)}
      ,${sqlText(row.Comment2)}
      ,${sqlText(row.Comment3)}
      ,${sqlText(row.Comment4)}
      ,${sqlText(row.Comment5)}
      ,${sqlText(row.Comment6)}
      ,${sqlText(row.Comment7)}
      ,${sqlText(row.Comment8)}
      ,${sqlText(row.Comment9)}
      ,${sqlText(row.Comment10)}
      ,${sqlText(row.ReportRemark)}
      )`
    )
    .join(",");

  return `Insert into Routine_KACReport (${columns}) values ${values};`;
}

router.post("/KACReportData_createKACReportOVS", async (req, res) => {
  console.log("in _createKACReportOVS");
  try {
    const reqNo = safe(req.body.ReqNo);
    const user = safe(req.body.User);

    const built = await buildOvsReportData(reqNo, RESULT_FIELD_CREATE);
    if (built.error) {
      console.log("createKACReportOVS : " + built.error);
      return res.status(500).json("ERROR: " + built.error);
    }

    const rows = built.dataReport;
    if (!rows || rows.length === 0) {
      return res.status(500).json("ERROR: ไม่มีรายการที่ต้องออก report ของ " + reqNo);
    }

    const dt = dtget.DateTimeNow();
    const nextApprover = pickNextApprover(rows[0]);
    const incharge = user !== "" ? user : safe(rows[0].Incharge);

    const query =
      `Delete from [Routine_KACReport] where reqNo = '${sqlEscape(reqNo)}';` +
      buildInsertQuery(rows, dt, incharge, nextApprover);
    await mssql.qurey(query);

    console.log(
      `createKACReportOVS : ${reqNo} | rows = ${rows.length} | nextApprover = ${nextApprover}`
    );

    // ออก PDF ทางเดียวกับ preview ของหน้า TTC ต่างกันแค่คอลัมน์ผล
    const pdf = await createReportOvs(reqNo, RESULT_FIELD_CREATE);
    return res.send(pdf);
  } catch (error) {
    // ต้องตอบ 500 ไม่ใช่ 200 เพราะฝั่ง Flutter เอา body ไป base64Decode ตรง ๆ
    const message = errText(error);
    console.error("[createKACReportOVS] " + req.body.ReqNo + " : " + message);
    return res.status(500).json("ERROR: " + message);
  }
});

module.exports = router;
module.exports.buildOvsReport = buildOvsReport;
module.exports.buildOvsReportData = buildOvsReportData;
module.exports.createReportOvs = createReportOvs;
module.exports.RESULT_FIELD_CREATE = RESULT_FIELD_CREATE;
