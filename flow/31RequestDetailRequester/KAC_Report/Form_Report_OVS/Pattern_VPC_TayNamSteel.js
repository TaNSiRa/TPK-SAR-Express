const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// VPC-Tay Nam Steel : PERFORMANCE OF CHROME COATING
//
// บล็อกเหนือตาราง (กลางหน้า)
//   Customer Name  = SampleTank ส่วนหน้า " - " ("Tay Nam Steel - Blank" -> "Tay Nam Steel")
//   Chemical Name  = SampleName
//   Sampling Date  = SamplingDate (เขียนแบบ "10 December 2025")
// ตารางเดียว 1 แถว = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   Customer name  = เหมือนบล็อกด้านบน  } แถวติดกันที่ค่าเหมือนกันรวมเป็นช่องเดียว
//   Material       = ProcessReportName  }
//   Code           = SampleTank ส่วนหลัง " - " ("Tay Nam Steel - Blank" -> "Blank")
//   Top / Bottom   = ผลของ "Cr Cwt." ในตัวอย่างนั้นที่ Position = Top / Bottom
// ถ้าบล็อกด้านบนเปลี่ยน (ลูกค้า / น้ำยา / วันที่) ขึ้นบล็อก + ตารางใหม่
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ VPC-Mitsubishi VN
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF CHROME COATING";

// ItemName ใน Routine_RequestLab ของช่องผล แยกด้านด้วยคอลัมน์ Position
const ITEM_NAME = "Cr Cwt.";
const RESULT_HEAD = "Cr Coating (mg/m²)";
const POSITIONS = ["Top", "Bottom"];

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม
const REMARK_LABEL = "Remark";
const REMARK_LINES = [
  "1. Standard Curve of Cr on GI at BP is in range of 0.00 – 136.00 mg/m²",
  "2. Results are not deducted from blank.",
];

// ช่องเซ็นใช้กรอบชุดเดิม เปลี่ยนแค่หัวกรอบตามแบบฟอร์มนี้
const SIGN_LABELS = ["Issued by:", "Checked by:", "Review by:", "Approved by:"];

const HEAD_FILL = [189, 215, 238];

// ความกว้างคอลัมน์ Customer name / Material / Code ส่วน Top / Bottom แบ่งที่เหลือเท่ากัน
const WIDTH_CUSTOMER = 39;
const WIDTH_MATERIAL = 29;
const WIDTH_CODE = 31;
const ROW_HEIGHT = 7.3;

const TITLE_GAP = 14; // หัวข้อหน้า -> บล็อก Customer Name
const INFO_TABLE_GAP = 11; // บล็อก Customer Name -> ตาราง
const TABLE_GAP = 10; // ระหว่างตารางแต่ละชุด
const REMARK_GAP = 10; // ตารางสุดท้าย -> Remark
const REMARK_LINE_HEIGHT = 5.5;
const BOTTOM_LIMIT = 20; // เนื้อหาห้ามเลยขอบล่างนี้ (เลข form อยู่ที่ 10 mm)
const MIN_TABLE_SPACE = 40; // บล็อกบนต้องมีที่ให้หัวตาราง + แถวแรกด้วย ไม่งั้นขึ้นหน้าใหม่

// ผลที่วิเคราะห์ไม่ได้ แสดงเป็น N/D เหมือน NPI
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  return text;
}

// SampleTank เขียนเป็น "<ลูกค้า> - <code>" ตัดที่ " - " ตัวสุดท้าย
function splitTank(tankName) {
  const text = util.safe(tankName);
  const index = text.lastIndexOf(" - ");
  if (index === -1) return { customer: text, code: "" };
  return {
    customer: text.substring(0, index).trim(),
    code: text.substring(index + 3).trim(),
  };
}

// คืน null เมื่อตัวอย่างนี้ไม่มีผลด้านนั้นเลย
function findItem(sample, position) {
  const wanted = ITEM_NAME.toLowerCase();
  const side = position.toLowerCase();
  const found = sample.items.filter(
    (item) =>
      util.safe(item.ItemName).toLowerCase() === wanted &&
      util.safe(item.Position).toLowerCase() === side
  );
  if (found.length === 0) return null;
  return found.find((item) => util.safe(item.Result) !== "") || found[0];
}

// รวมตัวอย่างทุก tank เป็นรายการเดียว เรียงตาม SampleNo
// (tank เดียวกันเช่น "... - Blank" มีได้หลายตัวอย่างคนละ Material)
// ตัวอย่างที่ไม่มี Cr Cwt. เลยไม่ต้องออกในตาราง
function collectSamples(report) {
  const samples = [];
  report.tanks.forEach((tank) => {
    const { customer, code } = splitTank(tank.tankName);
    const add = (sample) => samples.push({ customer, code, sample });
    tank.solutions.forEach(add);
    tank.performances.forEach(add);
  });
  return samples
    .filter(({ sample }) => POSITIONS.some((position) => findItem(sample, position) !== null))
    .sort((a, b) => a.sample.sampleNo - b.sample.sampleNo);
}

function infoRows(entry) {
  return [
    { label: "Customer Name", value: entry.customer },
    { label: "Chemical Name", value: util.safe(entry.sample.sampleName) },
    { label: "Sampling Date", value: util.toLongDate(entry.sample.samplingDate) },
  ];
}

function infoKey(entry) {
  return infoRows(entry)
    .map((row) => row.value)
    .join("|");
}

// ตัวอย่างที่ติดกันและมีบล็อกด้านบนเหมือนกัน อยู่ตารางเดียวกัน
function groupSamples(samples) {
  const groups = [];
  samples.forEach((entry) => {
    const key = infoKey(entry);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.entries.push(entry);
    } else {
      groups.push({ key, entries: [entry] });
    }
  });
  return groups;
}

function drawPageHeader(doc, report) {
  const currentY = header.DrawHeader(doc, report);
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + TITLE_GAP;
}

// บล็อก "Customer Name: / Chemical Name: / Sampling Date:" กลางกระดาษ
// ":" ติดท้ายป้ายแต่ละบรรทัด ส่วนค่าเริ่มตรงกันทุกบรรทัด
// รับขอบบน คืนขอบล่าง (แบบ DrawSampleInfo)
const INFO_ASCENT = 2.6;
const INFO_DESCENT = 0.9;
const INFO_LINE_HEIGHT = 7.5;
const INFO_BLOCK_HEIGHT = INFO_ASCENT + 2 * INFO_LINE_HEIGHT + INFO_DESCENT;

function drawInfo(doc, entry, topY) {
  const rows = infoRows(entry);
  const gapAfterColon = 20;

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  let labelWidth = 0;
  rows.forEach((row) => {
    labelWidth = Math.max(labelWidth, doc.getTextWidth(row.label + ":"));
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
    const y = topY + INFO_ASCENT + index * INFO_LINE_HEIGHT;
    doc.setFont("times", "bold");
    doc.text(row.label + ":", startX, y);
    doc.setFont("times", "normal");
    doc.text(row.value, valueX, y);
  });

  return topY + INFO_BLOCK_HEIGHT;
}

// จำนวนแถวที่ติดกันซึ่งค่าเหมือนกัน เริ่มจากแถว index (ใช้รวมช่องด้วย rowSpan)
function spanFrom(values, index) {
  let count = 1;
  while (index + count < values.length && values[index + count] === values[index]) count++;
  return count;
}

// ตารางของ 1 ชุด
//   | Customer name | Material | Code | Cr Coating (mg/m²) |
//   |               |          |      |   Top   | Bottom   |
//   | Tay Nam Steel | GL       | Blank|  ผล     |  ผล      |
// Material รวมช่องเฉพาะในลูกค้าเดียวกัน
function buildTableOptions(entries) {
  const center = { halign: "center" };
  const customers = entries.map((entry) => entry.customer);
  const materials = entries.map(
    (entry) => entry.customer + "|" + util.safe(entry.sample.processReportName)
  );

  const body = entries.map((entry, index) => {
    const row = [];
    if (index === 0 || customers[index] !== customers[index - 1]) {
      row.push({
        content: entry.customer,
        rowSpan: spanFrom(customers, index),
        styles: center,
      });
    }
    if (index === 0 || materials[index] !== materials[index - 1]) {
      row.push({
        content: util.safe(entry.sample.processReportName),
        rowSpan: spanFrom(materials, index),
        styles: center,
      });
    }
    row.push({ content: entry.code, styles: center });
    POSITIONS.forEach((position) => {
      const item = findItem(entry.sample, position);
      row.push({ content: item === null ? "" : resultText(item.Result), styles: center });
    });
    return row;
  });

  const head = [
    [
      { content: "Customer name", rowSpan: 2 },
      { content: "Material", rowSpan: 2 },
      { content: "Code", rowSpan: 2 },
      { content: RESULT_HEAD, colSpan: 2, styles: { minCellHeight: 14.5 } },
    ],
    POSITIONS.map((position) => ({ content: position })),
  ];

  return {
    head: head,
    body: body,
    theme: "grid",
    margin: { left: header.MARGIN_LEFT, right: header.MARGIN_RIGHT, bottom: BOTTOM_LIMIT },
    styles: {
      font: "times",
      fontSize: 11.5,
      textColor: 0,
      fillColor: [255, 255, 255],
      lineColor: 0,
      lineWidth: 0.1,
      cellPadding: 1.2,
      valign: "middle",
      minCellHeight: ROW_HEIGHT,
    },
    headStyles: {
      fontStyle: "bold",
      fillColor: HEAD_FILL,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: WIDTH_CUSTOMER },
      1: { cellWidth: WIDTH_MATERIAL },
      2: { cellWidth: WIDTH_CODE },
    },
  };
}

// วาดตารางลงเอกสารทดลองเพื่อวัดความสูงจริง (ชื่อยาวอาจตัดบรรทัดทำให้สูงขึ้น)
function measureHeight(tableOptions) {
  const scratch = new jsPDF();
  scratch.autoTable({ ...tableOptions, startY: 0, margin: { ...tableOptions.margin, top: 0 } });
  return scratch.lastAutoTable.finalY;
}

// autoTable ตัดช่องที่ rowSpan ข้ามหน้าไม่ได้ (ช่องรวมจะพัง)
// จึงแบ่งแถวเป็นชุดที่พอดีหน้าเอง แต่ละหน้าเป็นตารางของตัวเอง มีหัวตาราง
// และช่อง Customer name / Material รวมใหม่ในหน้านั้น
// คืนขอบล่างของตารางชุดสุดท้าย
function drawTable(doc, report, entries, startY, pageTopY) {
  const limitY = doc.internal.pageSize.height - BOTTOM_LIMIT;
  const heightOf = (from, to) => measureHeight(buildTableOptions(entries.slice(from, to)));
  let currentY = startY;
  let start = 0;

  while (start < entries.length) {
    // หัวตาราง + แถวแรกยังไม่พอ ขึ้นหน้าใหม่ก่อน (ถ้ายังไม่ได้อยู่บนสุดของหน้า)
    if (currentY + heightOf(start, start + 1) > limitY && currentY > pageTopY) {
      doc.addPage();
      currentY = drawPageHeader(doc, report);
      continue;
    }
    let end = start + 1;
    while (end < entries.length && currentY + heightOf(start, end + 1) <= limitY) end++;

    doc.autoTable({ ...buildTableOptions(entries.slice(start, end)), startY: currentY });
    currentY = doc.lastAutoTable.finalY;
    start = end;

    if (start < entries.length) {
      doc.addPage();
      currentY = drawPageHeader(doc, report);
    }
  }
  return currentY;
}

function remarkHeight() {
  return (REMARK_LINES.length - 1) * REMARK_LINE_HEIGHT + INFO_DESCENT;
}

// รับ baseline ของบรรทัดแรก คืนขอบล่างของบรรทัดสุดท้าย
function drawRemark(doc, baseY) {
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  const labelX = header.MARGIN_LEFT + 5;
  doc.text(REMARK_LABEL, labelX, baseY);
  doc.setFont("times", "normal");
  doc.text(":", labelX + doc.getTextWidth(REMARK_LABEL) + 1.5, baseY);

  const textX = labelX + 20;
  REMARK_LINES.forEach((line, index) => {
    doc.text(line, textX, baseY + index * REMARK_LINE_HEIGHT);
  });

  return baseY + remarkHeight();
}

// Cr Cwt. อาจถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request (ReportOrder = 0)
// pattern นี้หาช่องผลจาก ItemName + Position อยู่แล้ว ให้ดึงแถว ReportOrder = 0 มาด้วย
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

  groupSamples(samples).forEach((group, index) => {
    if (
      index > 0 &&
      currentY + INFO_BLOCK_HEIGHT + INFO_TABLE_GAP + MIN_TABLE_SPACE > pageHeight - BOTTOM_LIMIT
    ) {
      doc.addPage();
      currentY = drawPageHeader(doc, report);
    }

    currentY = drawInfo(doc, group.entries[0], currentY) + INFO_TABLE_GAP;
    currentY = drawTable(doc, report, group.entries, currentY, pageTopY) + TABLE_GAP;
  });

  // remark และช่องเซ็นต้องอยู่หน้าสุดท้ายด้วยกันเสมอ
  // ถ้า remark จะทับช่องเซ็น ย้ายทั้งสองอย่างไปหน้าใหม่พร้อมหัวกระดาษ
  let remarkY = currentY - TABLE_GAP + REMARK_GAP;
  const signatureTopY = signature.TopY(doc, report.signers, SIGN_LABELS);
  if (remarkY + remarkHeight() + 4 > signatureTopY) {
    doc.addPage();
    remarkY = drawPageHeader(doc, report);
  }
  const lastY = drawRemark(doc, remarkY);

  signature.DrawSignature(doc, report.signers, lastY + 4, SIGN_LABELS);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
