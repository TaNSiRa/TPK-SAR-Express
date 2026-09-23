const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// PERFORMANCE OF P-RATIO, Ni and Mn CONTENT
//
// ตารางเดียวต่อ request : 1 แถว = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   No.            = SampleNo
//   Customer       = SampleName
//   Sampling Date  = SampleRemark
//   Material       = ProcessReportName
//   P-ratio / Ni / Mn = ผลของ ItemName นั้นในตัวอย่างนั้น
// ตัวอย่างที่ไม่ได้ขอรายการนั้นมา ช่องจะเป็นสีเทาตามแบบฟอร์ม
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ AKZ
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF P-RATIO, Ni and Mn CONTENT";

// ItemName ใน Routine_RequestLab ของแต่ละคอลัมน์ผล
const ITEM_P_RATIO = "XRD P Ratio(%)";
const ITEM_NI = "Ni Cwt.";
const ITEM_MN = "Mn";

// remark ท้ายตารางเป็นข้อความตายตัวตามแบบฟอร์ม
const REMARK_LABEL = "Remark:";
const REMARK_LINES = [
  "- Results are not deducted from bare.",
  "- Standard Curve of Ni on SPCC is in range of 8.76-19.65 mg/m²",
  "- Standard Curve of Mn on SPCC is in range of 88.70-111.00 mg/m²",
];

const HEAD_FILL = [189, 215, 238];
const NO_ITEM_FILL = [217, 217, 217];

// ผลที่วิเคราะห์ไม่ได้ ในแบบฟอร์มเขียนเป็น N/D
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  return text;
}

// ถ้ามี ResultApproveRemark ให้แสดงบรรทัดใต้ผลในวงเล็บ เช่น "85.57\n(91.94, 91.37)"
function cellText(item) {
  const result = resultText(item.Result);
  const remark = util.safe(item.ApproveRemark);
  if (remark === "" || remark === "-") return result;
  const wrapped = /^\(.*\)$/.test(remark) ? remark : "(" + remark + ")";
  return result === "" ? wrapped : result + "\n" + wrapped;
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
function collectSamples(report) {
  const samples = [];
  report.tanks.forEach((tank) => {
    tank.solutions.forEach((sample) => samples.push(sample));
    tank.performances.forEach((sample) => samples.push(sample));
  });
  return samples.sort((a, b) => a.sampleNo - b.sampleNo);
}

function drawPageHeader(doc, report) {
  const currentY = header.DrawHeader(doc, report);
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + header.BLOCK_GAP;
}

function drawRemark(doc, report, currentY, pageTopY) {
  const pageHeight = doc.internal.pageSize.height;
  const lineHeight = 5.5;
  const blockHeight = REMARK_LINES.length * lineHeight;

  // ไม่พอให้ remark ทั้งก้อนอยู่หน้าเดียวกัน ย้ายไปหน้าใหม่ทั้งก้อน
  if (currentY + blockHeight > pageHeight - 20) {
    doc.addPage();
    drawPageHeader(doc, report);
    currentY = pageTopY;
  }

  doc.setFontSize(10);
  doc.setFont("times", "bold");
  const labelX = header.MARGIN_LEFT + 2;
  doc.text(REMARK_LABEL, labelX, currentY);
  const textX = labelX + doc.getTextWidth(REMARK_LABEL) + 2;

  doc.setFont("times", "normal");
  REMARK_LINES.forEach((line, index) => {
    doc.text(line, textX, currentY + index * lineHeight);
  });

  return currentY + (REMARK_LINES.length - 1) * lineHeight;
}

// Ni / Mn มักถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request จึงมี ReportOrder = 0
// pattern นี้หาคอลัมน์จาก ItemName อยู่แล้ว ให้ดึงแถว ReportOrder = 0 มาด้วย
exports.USES_ALL_ITEMS = true;

// -------------------------------------------------------------------------
exports.CreatePDF = async (report) => {
  const samples = collectSamples(report);
  if (samples.length === 0) {
    throw new Error("ไม่มีตัวอย่างที่ออกรายงานได้ใน " + report.refNo);
  }

  const doc = new jsPDF();
  const tableTopY = drawPageHeader(doc, report);

  // เก็บว่าช่องไหนไม่มีรายการ เพื่อถมเทาตอนวาด
  const missing = [];
  const body = samples.map((sample, rowIndex) => {
    const cells = [
      String(sample.sampleNo),
      util.safe(sample.sampleName),
      util.safe(sample.sampleRemark),
      util.safe(sample.processReportName),
    ];
    [ITEM_P_RATIO, ITEM_NI, ITEM_MN].forEach((itemName, offset) => {
      const item = findItem(sample, itemName);
      if (item === null) {
        missing.push(rowIndex + ":" + (4 + offset));
        cells.push("");
      } else {
        cells.push(cellText(item));
      }
    });
    return cells;
  });

  doc.autoTable({
    startY: tableTopY,
    head: [
      [
        "No.",
        "Customer",
        "Sampling Date",
        "Material",
        "P-ratio\n(%)",
        "Ni\n(mg/m2)",
        "Mn\n(mg/m2)",
      ],
    ],
    body: body,
    theme: "grid",
    // หน้าถัดไปเริ่มตารางใต้หัวกระดาษเหมือนหน้าแรก
    margin: { top: tableTopY, left: header.MARGIN_LEFT, right: header.MARGIN_RIGHT },
    styles: {
      font: "times",
      fontSize: 10,
      textColor: 0,
      lineColor: 0,
      lineWidth: 0.1,
      cellPadding: 1.2,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      font: "times",
      fontStyle: "bold",
      fillColor: HEAD_FILL,
      textColor: 0,
    },
    // Customer ไม่กำหนดความกว้าง ให้ได้ส่วนที่เหลือของหน้า
    columnStyles: {
      0: { cellWidth: 11 },
      2: { cellWidth: 23 },
      3: { cellWidth: 20.2 },
      4: { cellWidth: 26 },
      5: { cellWidth: 28.6 },
      6: { cellWidth: 28.6 },
    },
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

  const lastY = drawRemark(doc, report, doc.lastAutoTable.finalY + 7, tableTopY + 5);

  // ช่องเซ็นอยู่ท้ายรายงานหน้าสุดท้ายเท่านั้น
  signature.DrawSignature(doc, report.signers, lastY + 8);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
