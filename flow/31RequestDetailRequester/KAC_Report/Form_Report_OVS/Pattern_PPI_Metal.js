const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// PPI - Metal : QUALITY OF SOLUTION & NONCHROME COATING
//
// บรรทัดกลางกระดาษ
//   Customer Name  = SampleTank
// ตาราง (Table 1) 1 แถว = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   Item No.       = SampleNo
//   Sample ID      = ProcessReportName
//   Sampling Date  = SamplingDate ของตัวอย่างนั้น
//   Chemical Name  = SampleName
//   Al / Zr        = ผลของ ItemName นั้นในตัวอย่างนั้น
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ AKZ
// -------------------------------------------------------------------------

const PAGE_TITLE = "QUALITY OF SOLUTION & NONCHROME COATING";
const TABLE_LABEL = "Table 1";
const TABLE_CAPTION = "Result of solution sample";

// ItemName ใน Routine_RequestLab ของแต่ละคอลัมน์ผล
const COLUMNS = [
  { title: "Al", itemName: "Al", width: 19 },
  { title: "Zr", itemName: "Zr", width: 19 },
];
const UNIT = "(ppm)";
const WIDTH_NO = 17;
const WIDTH_SAMPLE_ID = 32;
const WIDTH_DATE = 25;
const WIDTH_CHEMICAL = 27;

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม
// ปล่อยว่างไว้ = ไม่พิมพ์บรรทัด remark
const REMARK_LABEL = "Remark:";
const REMARK_TEXT = "";

const HEAD_FILL = [180, 198, 231];
const NO_ITEM_FILL = [217, 217, 217];

// ผลที่เป็นตัวเลขแสดงทศนิยม 1 ตำแหน่งตามแบบฟอร์ม
// (ค่าใน DB มีเศษ float ติดมา เช่น 22.200000000000003)
// ผลที่เป็นข้อความ เช่น "<10.0" แสดงตามที่กรอก
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  const num = util.asNumber(text);
  return num === null ? text : num.toFixed(1);
}

// คืน null เมื่อตัวอย่างนี้ไม่มีรายการนั้นเลย (ใช้ตัดสินว่าจะถมเทา)
function findItem(sample, itemName) {
  const wanted = itemName.toLowerCase();
  const found = sample.items.filter(
    (item) => util.safe(item.ItemName).toLowerCase() === wanted
  );
  if (found.length === 0) return null;
  return found.find((item) => util.safe(item.Result) !== "") || found[0];
}

// รวมตัวอย่างทุก tank เป็นรายการเดียว เรียงตาม SampleNo
// Customer Name คือ SampleTank ซึ่งเก็บไว้ที่ระดับ tank จึงแนบชื่อ tank ไปกับตัวอย่าง
function collectSamples(report) {
  const samples = [];
  report.tanks.forEach((tank) => {
    tank.solutions.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
    tank.performances.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
  });
  return samples.sort((a, b) => a.sample.sampleNo - b.sample.sampleNo);
}

// Customer Name : SampleTank ไม่ซ้ำของทุกตัวอย่าง ต่อกันด้วย ", "
function customerNameOf(samples) {
  const names = [];
  samples.forEach(({ tankName }) => {
    const name = util.safe(tankName);
    if (name !== "" && names.indexOf(name) === -1) names.push(name);
  });
  return names.join(", ");
}

// Sampling Date ในตารางเขียนเป็น "06/02/2026" (dd/MM/yyyy)
// ค่าที่อ่านจาก DB เป็น datetime UTC จึงต้องอ่านด้วย getUTC* ไม่งั้นวันจะเพี้ยนไป 1 วัน
function toSlashDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return (
    pad(date.getUTCDate()) +
    "/" +
    pad(date.getUTCMonth() + 1) +
    "/" +
    date.getUTCFullYear()
  );
}

function drawPageHeader(doc, report) {
  const currentY = header.DrawHeader(doc, report);
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + header.BLOCK_GAP;
}

// บรรทัด "Customer Name : ..." กลางกระดาษ รับขอบบน คืนขอบล่าง (แบบ DrawSampleInfo)
function drawCustomerName(doc, value, topY) {
  const label = "Customer Name";
  const gapBeforeColon = 8;
  const gapAfterColon = 6;
  const ascent = 2.6;
  const descent = 0.9;

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  const labelWidth = doc.getTextWidth(label);
  const colonWidth = doc.getTextWidth(":");
  doc.setFont("times", "normal");
  const valueWidth = doc.getTextWidth(value);

  const blockWidth = labelWidth + gapBeforeColon + colonWidth + gapAfterColon + valueWidth;
  const startX = doc.internal.pageSize.width / 2 - blockWidth / 2;
  const colonX = startX + labelWidth + gapBeforeColon;
  const y = topY + ascent;

  doc.setFont("times", "bold");
  doc.text(label, startX, y);
  doc.text(":", colonX, y);
  doc.setFont("times", "normal");
  doc.text(value, colonX + colonWidth + gapAfterColon, y);

  return y + descent;
}

// "Table 1 Result of solution sample" : เลขตารางตัวหนา คำอธิบายตัวปกติ
function drawCaption(doc, topY) {
  const x = header.MARGIN_LEFT + 8;
  const y = topY + 2.6;
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.text(TABLE_LABEL, x, y);
  const labelWidth = doc.getTextWidth(TABLE_LABEL);
  doc.setFont("times", "normal");
  doc.text(TABLE_CAPTION, x + labelWidth + 2, y);
  return y + 0.9;
}

// ตัวอย่างเยอะจนล้นหน้า ตารางจะต่อหน้าถัดไปพร้อมหัวกระดาษ
function drawTable(doc, report, samples) {
  const tableTopY = drawPageHeader(doc, report);
  let currentY = drawCustomerName(doc, customerNameOf(samples), tableTopY);
  currentY = drawCaption(doc, currentY + header.BLOCK_GAP);

  const firstResultColumn = 4;

  // เก็บว่าช่องไหนไม่มีรายการ เพื่อถมเทาตอนวาด
  const missing = [];
  const body = samples.map(({ sample }, rowIndex) => {
    const cells = [
      String(sample.sampleNo),
      util.safe(sample.processReportName),
      toSlashDate(sample.samplingDate),
      util.safe(sample.sampleName),
    ];
    COLUMNS.forEach((column, offset) => {
      const item = findItem(sample, column.itemName);
      if (item === null) {
        missing.push(rowIndex + ":" + (firstResultColumn + offset));
        cells.push("");
      } else {
        cells.push(resultText(item.Result));
      }
    });
    return cells;
  });

  const columnStyles = {
    0: { cellWidth: WIDTH_NO },
    1: { cellWidth: WIDTH_SAMPLE_ID },
    2: { cellWidth: WIDTH_DATE },
    3: { cellWidth: WIDTH_CHEMICAL },
  };
  let tableWidth = WIDTH_NO + WIDTH_SAMPLE_ID + WIDTH_DATE + WIDTH_CHEMICAL;
  COLUMNS.forEach((column, offset) => {
    columnStyles[firstResultColumn + offset] = { cellWidth: column.width };
    tableWidth += column.width;
  });

  // ตารางแคบกว่าหน้ากระดาษ วางไว้กลางหน้า
  const sideMargin = (doc.internal.pageSize.width - tableWidth) / 2;

  // หัวตาราง 2 แถว : ชื่อธาตุอยู่แถวบน หน่วยอยู่แถวล่าง
  // สี่คอลัมน์แรกกินทั้งสองแถว
  const spanBoth = (content) => ({ content: content, rowSpan: 2 });

  doc.autoTable({
    startY: currentY + 4,
    head: [
      [
        spanBoth("Item No."),
        spanBoth("Sample ID"),
        spanBoth("Sampling\nDate"),
        spanBoth("Chemical\nName"),
      ].concat(COLUMNS.map((column) => column.title)),
      COLUMNS.map(() => UNIT),
    ],
    body: body,
    theme: "grid",
    // หน้าถัดไปเริ่มตารางใต้หัวกระดาษเหมือนหน้าแรก
    margin: { top: tableTopY, left: sideMargin, right: sideMargin },
    styles: {
      font: "times",
      fontSize: 10,
      textColor: 0,
      lineColor: 0,
      lineWidth: 0.1,
      cellPadding: 1.5,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      font: "times",
      fontStyle: "bold",
      fillColor: HEAD_FILL,
      textColor: 0,
    },
    columnStyles: columnStyles,
    willDrawPage: (data) => {
      if (data.pageNumber > 1) drawPageHeader(doc, report);
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      if (missing.indexOf(data.row.index + ":" + data.column.index) !== -1) {
        data.cell.styles.fillColor = NO_ITEM_FILL;
      }
    },
  });

  return doc.lastAutoTable.finalY;
}

function drawRemark(doc, report, currentY) {
  if (REMARK_TEXT === "") return currentY;

  const pageHeight = doc.internal.pageSize.height;

  // ไม่พอให้ remark อยู่หน้าเดียวกับตาราง ย้ายไปหน้าใหม่พร้อมหัวกระดาษ
  if (currentY > pageHeight - 30) {
    doc.addPage();
    currentY = drawPageHeader(doc, report) + 5;
  }

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  const labelX = header.MARGIN_LEFT + 8;
  doc.text(REMARK_LABEL, labelX, currentY);
  doc.setFont("times", "normal");
  doc.text(REMARK_TEXT, labelX + doc.getTextWidth(REMARK_LABEL) + 2, currentY);

  return currentY;
}

// Al / Zr อาจถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request (ReportOrder = 0)
// pattern นี้หาคอลัมน์จาก ItemName อยู่แล้ว ให้ดึงแถว ReportOrder = 0 มาด้วย
exports.USES_ALL_ITEMS = true;

// -------------------------------------------------------------------------
exports.CreatePDF = async (report) => {
  const samples = collectSamples(report);
  if (samples.length === 0) {
    throw new Error("ไม่มีตัวอย่างที่ออกรายงานได้ใน " + report.refNo);
  }

  const doc = new jsPDF();
  const finalY = drawTable(doc, report, samples);

  // remark และช่องเซ็นอยู่ท้ายรายงานหน้าสุดท้ายเท่านั้น
  const lastY = drawRemark(doc, report, finalY + 10);
  signature.DrawSignature(doc, report.signers, lastY + 8);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
