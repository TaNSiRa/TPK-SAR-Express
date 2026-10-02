const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// VPC-GPMI Solvent paint : PERFORMANCE OF CONVERSION COATING
//
// 1 ตาราง = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   Line Name      = SampleTank   } บล็อกเหนือตาราง แสดงเมื่อ line หรือวันที่เปลี่ยน
//   Sampling Date  = SamplingDate } หรือขึ้นหน้าใหม่ (วันที่เขียนแบบ "17 December 2025")
//   Product Name   = SampleName
//   Zr coating weight = ผลของ ItemName "Zr Cwt." ในตัวอย่างนั้น
//     ถ้ามี ResultApproveRemark ให้แสดงบรรทัดถัดมาในวงเล็บแบบ NPI
// ตารางแคบกว่าหน้ากระดาษ วางไว้กลางหน้าตามแบบฟอร์ม
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ VPC-Mitsubishi VN
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF CONVERSION COATING";

// ItemName ใน Routine_RequestLab ของแถวผล
const ROWS = [{ label: "Zr coating weight (mg/m²)", itemName: "Zr Cwt." }];

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม
const REMARK_LABEL = "Remark:";
const REMARK_TEXT =
  "Calibration curve of Zr on Al size 10 mm is in range of 0.00-104.20 mg/m²";

// ช่องเซ็นใช้กรอบชุดเดิม เปลี่ยนแค่หัวกรอบตามแบบฟอร์มนี้
const SIGN_LABELS = ["Issued by:", "Checked by:", "Review by:", "Approved by:"];

// ตารางกว้างไม่เต็มหน้า : Product Name / Item กับ Analysis Results
const WIDTH_ITEM = 61;
const WIDTH_RESULT = 50;
const ROW_HEIGHT = 10;

const TITLE_GAP = 12; // หัวข้อหน้า -> Line Name
const LINE_TABLE_GAP = 10; // บล็อก Line Name / Sampling Date -> ตาราง
const TABLE_GAP = 10; // ระหว่างตารางของแต่ละตัวอย่าง
const REMARK_GAP = 8; // ตารางสุดท้าย -> Remark
const BOTTOM_LIMIT = 20; // เนื้อหาห้ามเลยขอบล่างนี้ (เลข form อยู่ที่ 10 mm)

// ผลที่วิเคราะห์ไม่ได้ แสดงเป็น N/D เหมือน NPI
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  return text;
}

// ถ้ามี ResultApproveRemark ให้แสดงบรรทัดใต้ผลในวงเล็บ เช่น "0.00\n(0.00, 0.00)"
function cellText(item) {
  const result = resultText(item.Result);
  const remark = util.safe(item.ApproveRemark);
  if (remark === "" || remark === "-") return result;
  const wrapped = /^\(.*\)$/.test(remark) ? remark : "(" + remark + ")";
  return result === "" ? wrapped : result + "\n" + wrapped;
}

// คืน null เมื่อตัวอย่างนี้ไม่มีรายการนั้นเลย
function findItem(sample, itemName) {
  const wanted = itemName.toLowerCase();
  const found = sample.items.filter(
    (item) => util.safe(item.ItemName).toLowerCase() === wanted
  );
  if (found.length === 0) return null;
  return found.find((item) => util.safe(item.Result) !== "") || found[0];
}

// รวมตัวอย่างทุก line เป็นรายการเดียว เรียงตาม SampleNo
// ตัวอย่างที่ไม่มีรายการในแบบฟอร์มเลยไม่ต้องออกตาราง
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

function drawPageHeader(doc, report) {
  const currentY = header.DrawHeader(doc, report);
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + TITLE_GAP;
}

// บล็อก "Line Name :" / "Sampling Date :" กลางกระดาษ
// ":" ติดท้ายป้ายแต่ละบรรทัด ส่วนค่าเริ่มตรงกันทั้งสองบรรทัด
// รับขอบบน คืนขอบล่าง (แบบ DrawSampleInfo)
const LINE_ASCENT = 2.6;
const LINE_DESCENT = 0.9;
const LINE_HEIGHT = 7;
const LINE_BLOCK_HEIGHT = LINE_ASCENT + LINE_HEIGHT + LINE_DESCENT;

function lineInfoRows(tankName, sample) {
  return [
    { label: "Line Name", value: util.safe(tankName) },
    { label: "Sampling Date", value: util.toLongDate(sample.samplingDate) },
  ];
}

// ใช้เทียบว่าบล็อกบนหน้านี้ยังตรงกับตัวอย่างถัดไปหรือไม่
function lineInfoKey(tankName, sample) {
  return lineInfoRows(tankName, sample)
    .map((row) => row.value)
    .join("|");
}

function drawLineInfo(doc, tankName, sample, topY) {
  const rows = lineInfoRows(tankName, sample);
  const gapBeforeColon = 1;
  const gapAfterColon = 20;

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  // ความกว้างป้ายรวม ":" ของบรรทัดที่ยาวสุด
  const colonWidth = doc.getTextWidth(":");
  let labelWidth = 0;
  rows.forEach((row) => {
    labelWidth = Math.max(
      labelWidth,
      doc.getTextWidth(row.label) + gapBeforeColon + colonWidth
    );
  });
  doc.setFont("times", "normal");
  let valueWidth = 0;
  rows.forEach((row) => {
    valueWidth = Math.max(valueWidth, doc.getTextWidth(row.value));
  });

  const blockWidth = labelWidth + gapAfterColon + valueWidth;
  const startX = doc.internal.pageSize.width / 2 - blockWidth / 2;
  const valueX = startX + labelWidth + gapAfterColon;

  rows.forEach((row, index) => {
    const y = topY + LINE_ASCENT + index * LINE_HEIGHT;
    doc.setFont("times", "bold");
    doc.text(row.label, startX, y);
    doc.text(":", startX + doc.getTextWidth(row.label) + gapBeforeColon, y);
    doc.setFont("times", "normal");
    doc.text(row.value, valueX, y);
  });

  return topY + LINE_BLOCK_HEIGHT;
}

// ตารางของ 1 ตัวอย่าง
//   | Product Name: <SampleName>                    |
//   |            Item           | Analysis Results  |
//   | Zr coating weight (mg/m²) | ผล               |
//   |                           | (remark approver) |
function buildTableOptions(doc, sample) {
  const center = { halign: "center" };
  const body = [
    [
      {
        content: "Product Name:  " + util.safe(sample.sampleName),
        colSpan: 2,
        styles: { fontSize: 13 },
      },
    ],
    [
      { content: "Item", styles: center },
      { content: "Analysis Results", styles: center },
    ],
  ];

  ROWS.forEach((row) => {
    const item = findItem(sample, row.itemName);
    body.push([
      row.label,
      { content: item === null ? "" : cellText(item), styles: center },
    ]);
  });

  const left = (doc.internal.pageSize.width - WIDTH_ITEM - WIDTH_RESULT) / 2;
  return {
    body: body,
    theme: "grid",
    margin: { left: left, right: left },
    tableWidth: WIDTH_ITEM + WIDTH_RESULT,
    styles: {
      font: "times",
      fontSize: 11.5,
      textColor: 0,
      fillColor: [255, 255, 255],
      lineColor: 0,
      lineWidth: 0.2,
      cellPadding: 1.2,
      valign: "middle",
      minCellHeight: ROW_HEIGHT,
    },
    columnStyles: {
      0: { cellWidth: WIDTH_ITEM },
      1: { cellWidth: WIDTH_RESULT },
    },
  };
}

// วาดตารางลงเอกสารทดลองเพื่อวัดความสูงจริง (ชื่อยาวอาจตัดบรรทัดทำให้สูงขึ้น)
function measureHeight(tableOptions) {
  const scratch = new jsPDF();
  scratch.autoTable({ ...tableOptions, startY: 0, margin: { ...tableOptions.margin, top: 0 } });
  return scratch.lastAutoTable.finalY;
}

// remark บรรทัดเดียว จัดกลางหน้า รับ baseline คืนขอบล่าง
function drawRemark(doc, baseY) {
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  const labelWidth = doc.getTextWidth(REMARK_LABEL);
  doc.setFont("times", "normal");
  const gap = 1.5;
  const textWidth = doc.getTextWidth(REMARK_TEXT);

  const startX = doc.internal.pageSize.width / 2 - (labelWidth + gap + textWidth) / 2;
  doc.setFont("times", "bold");
  doc.text(REMARK_LABEL, startX, baseY);
  doc.setFont("times", "normal");
  doc.text(REMARK_TEXT, startX + labelWidth + gap, baseY);

  return baseY + LINE_DESCENT;
}

// Zr Cwt. อาจถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request (ReportOrder = 0)
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
  // บล็อก Line Name / Sampling Date ที่แสดงบนหน้านี้แล้ว ขึ้นหน้าใหม่ต้องแสดงซ้ำ
  let lineOnPage = null;

  samples.forEach(({ tankName, sample }, index) => {
    const tableOptions = buildTableOptions(doc, sample);
    const lineKey = lineInfoKey(tankName, sample);
    const lineHeight = lineKey !== lineOnPage ? LINE_BLOCK_HEIGHT + LINE_TABLE_GAP : 0;
    const blockHeight = lineHeight + measureHeight(tableOptions);

    // ไม่พอให้ตารางทั้งก้อนอยู่หน้าเดียวกัน ย้ายไปหน้าใหม่ทั้งก้อน
    if (index > 0 && currentY + blockHeight > pageHeight - BOTTOM_LIMIT) {
      doc.addPage();
      drawPageHeader(doc, report);
      currentY = pageTopY;
      lineOnPage = null;
    }

    if (lineKey !== lineOnPage) {
      currentY = drawLineInfo(doc, tankName, sample, currentY) + LINE_TABLE_GAP;
      lineOnPage = lineKey;
    }

    doc.autoTable({ ...tableOptions, startY: currentY });
    currentY = doc.lastAutoTable.finalY + TABLE_GAP;
  });

  // remark และช่องเซ็นต้องอยู่หน้าสุดท้ายด้วยกันเสมอ
  // ถ้า remark จะทับช่องเซ็น ย้ายทั้งสองอย่างไปหน้าใหม่พร้อมหัวกระดาษ
  let remarkY = currentY - TABLE_GAP + REMARK_GAP;
  const signatureTopY = signature.TopY(doc, report.signers, SIGN_LABELS);
  if (remarkY + LINE_DESCENT + 4 > signatureTopY) {
    doc.addPage();
    remarkY = drawPageHeader(doc, report);
  }
  const lastY = drawRemark(doc, remarkY);

  signature.DrawSignature(doc, report.signers, lastY + 4, SIGN_LABELS);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
