const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// VPC-Mitsubishi VN : PERFORMANCE OF PHOSPHATE COATING
//
// 1 ตาราง = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   Line Name      = SampleTank (บรรทัดเหนือตาราง แสดงเมื่อเปลี่ยน line หรือขึ้นหน้าใหม่)
//   Product Name   = SampleName
//   Sampling Date  = SamplingDate ของตัวอย่างนั้น (dd/MM/yy)
//   P-Ratio / Ni / Mn = ผลของ ItemName นั้นในตัวอย่างนั้น
// ตัวอย่างที่ไม่ได้ขอ Ni / Mn มา ช่องผลจะเป็นสีเทา
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ AKZ
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF PHOSPHATE COATING";

// ItemName ใน Routine_RequestLab ของแต่ละแถวผล
// grey = true : ตัวอย่างที่ไม่มีรายการนี้ ถมช่องผลเป็นสีเทา
const ROWS = [
  { label: "P-Ratio (%)", itemName: "XRD P Ratio(%)", grey: false },
  { label: "Ni Content (mg/m²)", itemName: "Ni Cwt.", grey: true },
  { label: "Mn Content (mg/m²)", itemName: "Mn Cwt.", grey: true },
];

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม
const REMARK_LABEL = "Remark";
const REMARK_LINES = [
  "- Standard Curve of Ni on SPCC is in range of 8.76-19.65 mg/m²",
  "- Standard Curve of Mn on SPCC is in range of 88.70-111.00 mg/m²",
];

const NO_ITEM_FILL = [217, 217, 217];

// ความกว้างคอลัมน์ Sample / Product Name ส่วน Analysis Results ได้ที่เหลือของหน้า
const WIDTH_SAMPLE = 27;
const WIDTH_PRODUCT = 81;

const TITLE_GAP = 12; // หัวข้อหน้า -> Line Name
const TABLE_GAP = 10; // ระหว่างตารางของแต่ละตัวอย่าง
const REMARK_GAP = 10; // ตารางสุดท้าย -> Remark
const REMARK_LINE_HEIGHT = 5.5;
const BOTTOM_LIMIT = 20; // เนื้อหาห้ามเลยขอบล่างนี้ (เลข form อยู่ที่ 10 mm)

// ผลที่วิเคราะห์ไม่ได้ แสดงเป็น N/D เหมือน NPI
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  return text;
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
// ตัวอย่างที่ไม่มีรายการในแบบฟอร์มเลย (เช่นน้ำยาที่ขอมาใน request เดียวกัน) ไม่ต้องออกตาราง
function collectSamples(report) {
  const samples = [];
  report.tanks.forEach((tank) => {
    tank.solutions.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
    tank.performances.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
  });
  return samples
    .filter(({ sample }) => ROWS.some((row) => findItem(sample, row.itemName) !== null))
    .sort((a, b) => a.sample.sampleNo - b.sample.sampleNo);
}

// Sampling Date ในตารางเขียนเป็น "22/05/26" (dd/MM/yy)
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
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + TITLE_GAP;
}

// บรรทัด "Line Name :  <SampleTank>" กลางกระดาษ รับขอบบน คืนขอบล่าง (แบบ DrawSampleInfo)
const LINE_ASCENT = 2.6;
const LINE_DESCENT = 0.9;
const LINE_BLOCK_HEIGHT = LINE_ASCENT + LINE_DESCENT;

function drawLineName(doc, lineName, topY) {
  const label = "Line Name";
  const value = util.safe(lineName);
  const gapBeforeColon = 1.5;
  const gapAfterColon = 25;

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  const labelWidth = doc.getTextWidth(label);
  const colonWidth = doc.getTextWidth(":");
  doc.setFont("times", "normal");
  const valueWidth = doc.getTextWidth(value);

  const blockWidth = labelWidth + gapBeforeColon + colonWidth + gapAfterColon + valueWidth;
  const startX = doc.internal.pageSize.width / 2 - blockWidth / 2;
  const colonX = startX + labelWidth + gapBeforeColon;
  const y = topY + LINE_ASCENT;

  doc.setFont("times", "bold");
  doc.text(label, startX, y);
  doc.text(":", colonX, y);
  doc.setFont("times", "normal");
  doc.text(value, colonX + colonWidth + gapAfterColon, y);

  return topY + LINE_BLOCK_HEIGHT;
}

// ตารางของ 1 ตัวอย่าง
//   | Sample | Product Name: <SampleName> | Analysis Results        |
//   |          Item                       | Sampling Date: dd/MM/yy |
//   | P-Ratio (%) / Ni / Mn               | ผล                      |
function buildTableOptions(sample) {
  const center = { halign: "center" };
  const body = [
    [
      { content: "Sample", styles: { fontSize: 12, minCellHeight: 11 } },
      {
        content: "Product Name:  " + util.safe(sample.sampleName),
        styles: { fontSize: 12 },
      },
      { content: "Analysis Results", styles: { fontSize: 12, halign: "center" } },
    ],
    [
      { content: "Item", colSpan: 2, styles: center },
      { content: "Sampling Date: " + toShortDate(sample.samplingDate), styles: center },
    ],
  ];

  ROWS.forEach((row) => {
    const item = findItem(sample, row.itemName);
    const resultCell = { content: "", styles: { halign: "center" } };
    if (item !== null) {
      resultCell.content = resultText(item.Result);
    } else if (row.grey) {
      resultCell.styles.fillColor = NO_ITEM_FILL;
    }
    body.push([{ content: row.label, colSpan: 2 }, resultCell]);
  });

  return {
    body: body,
    theme: "grid",
    margin: { left: header.MARGIN_LEFT, right: header.MARGIN_RIGHT },
    styles: {
      font: "times",
      fontSize: 11,
      textColor: 0,
      fillColor: [255, 255, 255],
      lineColor: 0,
      lineWidth: 0.1,
      cellPadding: 1.8,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: WIDTH_SAMPLE },
      1: { cellWidth: WIDTH_PRODUCT },
    },
  };
}

// วาดตารางลงเอกสารทดลองเพื่อวัดความสูงจริง (ชื่อยาวอาจตัดบรรทัดทำให้สูงขึ้น)
function measureHeight(tableOptions) {
  const scratch = new jsPDF();
  scratch.autoTable({ ...tableOptions, startY: 0, margin: { ...tableOptions.margin, top: 0 } });
  return scratch.lastAutoTable.finalY;
}

function remarkHeight() {
  return REMARK_LINES.length * REMARK_LINE_HEIGHT + LINE_DESCENT;
}

// รับ baseline ของบรรทัด "Remark" คืนขอบล่างของบรรทัดสุดท้าย
function drawRemark(doc, baseY) {
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  const labelX = header.MARGIN_LEFT + 5;
  doc.text(REMARK_LABEL, labelX, baseY);

  doc.setFont("times", "normal");
  const textX = labelX + 18;
  REMARK_LINES.forEach((line, index) => {
    doc.text(line, textX, baseY + (index + 1) * REMARK_LINE_HEIGHT);
  });

  return baseY + remarkHeight();
}

// Ni Cwt. / Mn Cwt. อาจถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request (ReportOrder = 0)
// pattern นี้หาแถวผลจาก ItemName อยู่แล้ว ให้ดึงแถว ReportOrder = 0 มาด้วย
exports.USES_ALL_ITEMS = true;

// -------------------------------------------------------------------------
exports.CreatePDF = async (report) => {
  const samples = collectSamples(report);
  if (samples.length === 0) {
    throw new Error("ไม่มีตัวอย่างที่ออกรายงานได้ใน " + report.refNo);
  }

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageTopY = drawPageHeader(doc, report);
  let currentY = pageTopY;
  // Line Name ที่แสดงบนหน้านี้แล้ว ขึ้นหน้าใหม่ต้องแสดงซ้ำ
  let lineOnPage = null;

  samples.forEach(({ tankName, sample }, index) => {
    const tableOptions = buildTableOptions(sample);
    const lineHeight = tankName !== lineOnPage ? LINE_BLOCK_HEIGHT + header.BLOCK_GAP : 0;
    const blockHeight = lineHeight + measureHeight(tableOptions);

    // ไม่พอให้ตารางทั้งก้อนอยู่หน้าเดียวกัน ย้ายไปหน้าใหม่ทั้งก้อน
    if (index > 0 && currentY + blockHeight > pageHeight - BOTTOM_LIMIT) {
      doc.addPage();
      drawPageHeader(doc, report);
      currentY = pageTopY;
      lineOnPage = null;
    }

    if (tankName !== lineOnPage) {
      currentY = drawLineName(doc, tankName, currentY) + header.BLOCK_GAP;
      lineOnPage = tankName;
    }

    doc.autoTable({ ...tableOptions, startY: currentY });
    currentY = doc.lastAutoTable.finalY + TABLE_GAP;
  });

  // remark และช่องเซ็นต้องอยู่หน้าสุดท้ายด้วยกันเสมอ
  // ถ้า remark จะทับช่องเซ็น ย้ายทั้งสองอย่างไปหน้าใหม่พร้อมหัวกระดาษ
  let remarkY = currentY - TABLE_GAP + REMARK_GAP;
  const signatureTopY = signature.TopY(doc, report.signers);
  if (remarkY + remarkHeight() + 4 > signatureTopY) {
    doc.addPage();
    remarkY = drawPageHeader(doc, report);
  }
  const lastY = drawRemark(doc, remarkY);

  signature.DrawSignature(doc, report.signers, lastY + 4);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
