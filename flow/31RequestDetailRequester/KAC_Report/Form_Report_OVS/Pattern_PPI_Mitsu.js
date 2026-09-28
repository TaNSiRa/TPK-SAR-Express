const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// PPI - Mitsu : PERFORMANCE OF PHOSPHATE COATING
//
// บล็อกกลางกระดาษ
//   Line Name      = SampleTank ตัดส่วนในวงเล็บออก ตัวพิมพ์ใหญ่
//   Sample ID      = ProcessReportName
// ตาราง (Table 1) 1 แถว = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   Chemical Name  = SampleName (แถบบนสุดของตาราง)
//   No.            = SampleNo
//   Sampling date  = SamplingDate ของตัวอย่างนั้น
//   Zn / Ni / Mn / Free F- (F-F) / Total F- (T-F(WWT)) = ผลของ ItemName นั้นในตัวอย่างนั้น
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ AKZ
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF PHOSPHATE COATING";
const TABLE_LABEL = "Table 1";
const TABLE_CAPTION = "Result of solution sample";

// ItemName ใน Routine_RequestLab ของแต่ละคอลัมน์ผล
const COLUMNS = [
  { title: "Zn\n(ppm)", itemName: "Zn", width: 20 },
  { title: "Ni\n(ppm)", itemName: "Ni", width: 20 },
  { title: "Mn\n(ppm)", itemName: "Mn", width: 20 },
  { title: "Free F-\n(ppm)", itemName: "F-F", width: 20, showRawData: true },
  { title: "Total F-\n(ppm)\nIon meter", itemName: "T-F(WWT)", width: 25 },
];
const WIDTH_NO = 14;
const WIDTH_DATE = 22;

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม
const REMARK_LABEL = "Remark:";
const REMARK_TEXT = "Free F- Curve range control 50-500 ppm";

const HEAD_FILL = [165, 201, 235];
const NO_ITEM_FILL = [217, 217, 217];

// ผลที่เป็นตัวเลขแสดงทศนิยม 1 ตำแหน่งตามแบบฟอร์ม
// (ค่าใน DB มีเศษ float ติดมา เช่น 22.200000000000003)
// ผลที่เป็นข้อความ เช่น "< 50" แสดงตามที่กรอก
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  const num = util.asNumber(text);
  return num === null ? text : num.toFixed(1);
}

// ผล F-F ที่ต่ำกว่า curve (มี "<" เช่น "< 50") ให้แสดงค่าดิบจาก Instrument_FF
// ในวงเล็บบรรทัดล่าง เช่น "< 50\n(24.9)"
//   มีทั้ง RawData_1 และ RawData_2 -> เฉลี่ยสองค่า
//   มีค่าเดียว                   -> ใช้ค่านั้น
//   ไม่มีเลย                     -> แสดงแค่ผล
// ค่าดิบที่ไม่ใช่ตัวเลข (ว่าง / "undefined") ถือว่าไม่มี
function rawDataText(item) {
  const values = (item.FfRawData || [])
    .map((value) => util.asNumber(value))
    .filter((num) => num !== null);
  if (values.length === 0) return "";
  const sum = values.reduce((a, b) => a + b, 0);
  return (sum / values.length).toFixed(1);
}

function cellText(item, column) {
  const result = resultText(item.Result);
  if (!column.showRawData || result.indexOf("<") === -1) return result;
  const raw = rawDataText(item);
  return raw === "" ? result : result + "\n(" + raw + ")";
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

// รวมตัวอย่างทุก line เป็นรายการเดียว เรียงตาม SampleNo
// Line Name คือ SampleTank ซึ่งเก็บไว้ที่ระดับ tank จึงแนบชื่อ tank ไปกับตัวอย่าง
function collectSamples(report) {
  const samples = [];
  report.tanks.forEach((tank) => {
    tank.solutions.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
    tank.performances.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
  });
  return samples.sort((a, b) => a.sample.sampleNo - b.sample.sampleNo);
}

// ค่าไม่ซ้ำของทุกตัวอย่าง ต่อกันด้วย ", "
function distinctJoin(samples, pick) {
  const names = [];
  samples.forEach((entry) => {
    const name = pick(entry);
    if (name !== "" && names.indexOf(name) === -1) names.push(name);
  });
  return names.join(", ");
}

// Line Name : SampleTank ตัดส่วนในวงเล็บออก ตัวพิมพ์ใหญ่
//   "Toyota Motor Phils. Corp. (Body)" -> "TOYOTA MOTOR PHILS. CORP."
function lineNameOf(samples) {
  return distinctJoin(samples, ({ tankName }) =>
    util.stripParentheses(tankName).toUpperCase()
  );
}

function sampleIdOf(samples) {
  return distinctJoin(samples, ({ sample }) => util.safe(sample.processReportName));
}

function chemicalNameOf(samples) {
  return distinctJoin(samples, ({ sample }) => util.safe(sample.sampleName));
}

// Sampling date ในตารางเขียนเป็น "14/05/26" (dd/MM/yy)
// ค่าที่อ่านจาก DB เป็น datetime UTC จึงต้องอ่านด้วย getUTC* ไม่งั้นวันจะเพี้ยนไป 1 วัน
function toShortDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return (
    pad(date.getUTCDate()) +
    "/" +
    pad(date.getUTCMonth() + 1) +
    "/" +
    pad(date.getUTCFullYear() % 100)
  );
}

function drawPageHeader(doc, report) {
  const currentY = header.DrawHeader(doc, report);
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + header.BLOCK_GAP;
}

// บล็อก Line Name / Sample ID กลางกระดาษ ":" ของสองบรรทัดตรงกัน
// รับขอบบน คืนขอบล่าง (แบบ DrawSampleInfo)
function drawLineInfo(doc, rows, topY) {
  const gapBeforeColon = 8;
  const gapAfterColon = 6;
  const ascent = 2.6;
  const descent = 0.9;
  const lineHeight = 6;

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  let labelWidth = 0;
  rows.forEach((row) => {
    labelWidth = Math.max(labelWidth, doc.getTextWidth(row.label));
  });
  const colonWidth = doc.getTextWidth(":");
  doc.setFont("times", "normal");
  let valueWidth = 0;
  rows.forEach((row) => {
    valueWidth = Math.max(valueWidth, doc.getTextWidth(row.value));
  });

  const blockWidth = labelWidth + gapBeforeColon + colonWidth + gapAfterColon + valueWidth;
  const startX = doc.internal.pageSize.width / 2 - blockWidth / 2;
  const colonX = startX + labelWidth + gapBeforeColon;
  const valueX = colonX + colonWidth + gapAfterColon;

  rows.forEach((row, index) => {
    const y = topY + ascent + index * lineHeight;
    doc.setFont("times", "bold");
    doc.text(row.label, startX, y);
    doc.text(":", colonX, y);
    doc.setFont("times", "normal");
    doc.text(row.value, valueX, y);
  });

  return topY + ascent + (rows.length - 1) * lineHeight + descent;
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
  let currentY = drawLineInfo(
    doc,
    [
      { label: "Line Name", value: lineNameOf(samples) },
      { label: "Sample ID", value: sampleIdOf(samples) },
    ],
    tableTopY
  );
  currentY = drawCaption(doc, currentY + header.BLOCK_GAP);

  const firstResultColumn = 2;
  const columnCount = firstResultColumn + COLUMNS.length;

  // เก็บว่าช่องไหนไม่มีรายการ เพื่อถมเทาตอนวาด
  const missing = [];
  const body = samples.map(({ sample }, rowIndex) => {
    const cells = [String(sample.sampleNo), toShortDate(sample.samplingDate)];
    COLUMNS.forEach((column, offset) => {
      const item = findItem(sample, column.itemName);
      if (item === null) {
        missing.push(rowIndex + ":" + (firstResultColumn + offset));
        cells.push("");
      } else {
        cells.push(cellText(item, column));
      }
    });
    return cells;
  });

  const columnStyles = {
    0: { cellWidth: WIDTH_NO },
    1: { cellWidth: WIDTH_DATE },
  };
  let tableWidth = WIDTH_NO + WIDTH_DATE;
  COLUMNS.forEach((column, offset) => {
    columnStyles[firstResultColumn + offset] = { cellWidth: column.width };
    tableWidth += column.width;
  });

  // ตารางแคบกว่าหน้ากระดาษ วางไว้กลางหน้าตามแบบฟอร์ม
  const sideMargin = (doc.internal.pageSize.width - tableWidth) / 2;

  doc.autoTable({
    startY: currentY + 4,
    head: [
      [
        {
          content: "Chemical Name: " + chemicalNameOf(samples),
          colSpan: columnCount,
          styles: { halign: "left", fillColor: HEAD_FILL },
        },
      ],
      ["No.", "Sampling\ndate"].concat(COLUMNS.map((column) => column.title)),
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
      fillColor: [255, 255, 255],
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

// Zn / Ni / Mn / F-F / T-F(WWT) อาจถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request (ReportOrder = 0)
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
