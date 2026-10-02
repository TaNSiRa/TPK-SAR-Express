const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// PPI - Enkei : QUALITY OF SOLUTION & NONCHROME COATING
//
// บรรทัดกลางกระดาษ
//   Customer Name  = SampleTank
// ตาราง (Table 1) 1 แถว = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   Item No.       = SampleNo
//   Sample ID      = ProcessReportName
//   Sampling Date  = SamplingDate ของตัวอย่างนั้น (แถวติดกันที่วันเดียวกันรวมเป็นช่องเดียว)
//   Chemical Name  = SampleName
//   Al / Fe / Zr / Surfactant / Free F (F-F) = ผลของ ItemName นั้นในตัวอย่างนั้น
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ AKZ
// -------------------------------------------------------------------------

const PAGE_TITLE = "QUALITY OF SOLUTION & NONCHROME COATING";
const TABLE_LABEL = "Table 1";
const TABLE_CAPTION = "Result of solution sample";

// ItemName ใน Routine_RequestLab ของแต่ละคอลัมน์ผล
const COLUMNS = [
  { title: "Al", unit: "(ppm)", itemName: "Al", width: 16 },
  { title: "Fe", unit: "(ppm)", itemName: "Fe", width: 16 },
  { title: "Zr", unit: "(ppm)", itemName: "Zr", width: 16 },
  { title: "Surfactant", unit: "(g/l)", itemName: "Surfactant", width: 22 },
  { title: "Free F", unit: "(ppm)", itemName: "F-F", width: 16 },
];
const WIDTH_NO = 12;
const WIDTH_SAMPLE_ID = 31;
const WIDTH_DATE = 22;
const WIDTH_CHEMICAL = 28;

// ช่องที่ตัวอย่างนั้นไม่มีรายการ แบบฟอร์มเขียน "--"
const NO_ITEM_TEXT = "--";

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม บรรทัดที่สองเยื้องตรงกับบรรทัดแรก
const REMARK_LABEL = "Remark:";
const REMARK_LINES = [
  "1. Free F was measured at room temperature",
  "2. Free F- Curve range control 5-50 ppm",
];
const REMARK_LINE_HEIGHT = 5.5;

// ช่องเซ็นใช้กรอบชุดเดิม เปลี่ยนแค่หัวกรอบตามแบบฟอร์มนี้
const SIGN_LABELS = ["Issued by:", "Checked by:", "Review by:", "Approved by:"];

const HEAD_FILL = [180, 198, 231];

// ผลที่เป็นตัวเลขแสดงทศนิยม 1 ตำแหน่งตามแบบฟอร์ม
// (ค่าใน DB มีเศษ float ติดมา เช่น 22.200000000000003)
// ผลที่เป็นข้อความ เช่น "<10.0" แสดงตามที่กรอก
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  const num = util.asNumber(text);
  return num === null ? text : num.toFixed(1);
}

// ถ้ามี ResultApproveRemark ให้แสดงบรรทัดใต้ผลในวงเล็บ เช่น "57.6\n(56.1)" (แบบ NPI)
function cellText(item) {
  const result = resultText(item.Result);
  const remark = util.safe(item.ApproveRemark);
  if (remark === "" || remark === "-") return result;
  const wrapped = /^\(.*\)$/.test(remark) ? remark : "(" + remark + ")";
  return result === "" ? wrapped : result + "\n" + wrapped;
}

// คืน null เมื่อตัวอย่างนี้ไม่มีรายการนั้นเลย (ใช้ตัดสินว่าจะเขียน "--")
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

// ช่อง Sampling Date (dd MMMM yyyy) ของแถวติดกันที่เป็นวันเดียวกันรวมเป็นช่องเดียว (rowSpan)
// คืน array ตามแถว : แถวแรกของกลุ่มได้ cell ที่มี rowSpan แถวที่เหลือได้ null (ไม่ต้องใส่ช่อง)
function samplingDateCells(samples) {
  const dates = samples.map(({ sample }) => util.toLongDate(sample.samplingDate));
  const cells = dates.map(() => null);
  let i = 0;
  while (i < dates.length) {
    let j = i + 1;
    while (j < dates.length && dates[j] === dates[i]) j++;
    // แบบฟอร์มขึ้นบรรทัดใหม่ก่อนปี : "14 May\n2026"
    cells[i] = { content: dates[i].replace(/ (\d{4})$/, "\n$1"), rowSpan: j - i };
    i = j;
  }
  return cells;
}

// ตัวอย่างเยอะจนล้นหน้า ตารางจะต่อหน้าถัดไปพร้อมหัวกระดาษ
function drawTable(doc, report, samples) {
  const tableTopY = drawPageHeader(doc, report);
  let currentY = drawCustomerName(doc, customerNameOf(samples), tableTopY);
  currentY = drawCaption(doc, currentY + header.BLOCK_GAP);

  const dateCells = samplingDateCells(samples);
  const body = samples.map(({ sample }, rowIndex) => {
    const cells = [String(sample.sampleNo), util.safe(sample.processReportName)];
    if (dateCells[rowIndex] !== null) cells.push(dateCells[rowIndex]);
    cells.push({ content: util.safe(sample.sampleName), styles: { halign: "left" } });
    COLUMNS.forEach((column) => {
      const item = findItem(sample, column.itemName);
      cells.push(item === null ? NO_ITEM_TEXT : cellText(item));
    });
    return cells;
  });

  const columnStyles = {
    0: { cellWidth: WIDTH_NO },
    1: { cellWidth: WIDTH_SAMPLE_ID },
    2: { cellWidth: WIDTH_DATE },
    3: { cellWidth: WIDTH_CHEMICAL },
  };
  const firstResultColumn = 4;
  let tableWidth = WIDTH_NO + WIDTH_SAMPLE_ID + WIDTH_DATE + WIDTH_CHEMICAL;
  COLUMNS.forEach((column, offset) => {
    columnStyles[firstResultColumn + offset] = { cellWidth: column.width };
    tableWidth += column.width;
  });

  // วางตารางไว้กลางหน้า
  const sideMargin = (doc.internal.pageSize.width - tableWidth) / 2;

  // หัวตาราง 2 แถว : ชื่อรายการอยู่แถวบน หน่วยอยู่แถวล่าง
  // สี่คอลัมน์แรกกินทั้งสองแถว
  const spanBoth = (content) => ({ content: content, rowSpan: 2 });

  doc.autoTable({
    startY: currentY + 4,
    head: [
      [
        spanBoth("Item\nNo."),
        spanBoth("Sample ID"),
        spanBoth("Sampling\nDate"),
        spanBoth("Chemical\nName"),
      ].concat(COLUMNS.map((column) => column.title)),
      COLUMNS.map((column) => column.unit),
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
  });

  return doc.lastAutoTable.finalY;
}

// คืน baseline ของบรรทัด remark สุดท้าย
function drawRemark(doc, report, currentY) {
  const pageHeight = doc.internal.pageSize.height;
  const blockHeight = (REMARK_LINES.length - 1) * REMARK_LINE_HEIGHT;

  // ไม่พอให้ remark อยู่หน้าเดียวกับตาราง ย้ายไปหน้าใหม่พร้อมหัวกระดาษ
  if (currentY + blockHeight > pageHeight - 30) {
    doc.addPage();
    currentY = drawPageHeader(doc, report) + 5;
  }

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  const labelX = header.MARGIN_LEFT + 8;
  doc.text(REMARK_LABEL, labelX, currentY);
  const textX = labelX + doc.getTextWidth(REMARK_LABEL) + 2;
  doc.setFont("times", "normal");
  REMARK_LINES.forEach((line, index) => {
    doc.text(line, textX, currentY + index * REMARK_LINE_HEIGHT);
  });

  return currentY + blockHeight;
}

// Al / Fe / Zr / Surfactant / F-F อาจถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request (ReportOrder = 0)
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
  signature.DrawSignature(doc, report.signers, lastY + 8, SIGN_LABELS);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
