const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// VPC-Dong A : PERFORMANCE OF CHROME COATING
//
// SampleTank มาเป็น "Dong A - WS" : หน้า "-" คือชื่อลูกค้า หลัง "-" คือ code
//   Customer Name / Customer name = ชื่อลูกค้าจาก SampleTank ("Dong A")
//   Chemical Name                 = SampleName
//   Sampling                      = SamplingDate (เขียนแบบ "26 Dec 25")
//   Code                          = code จาก SampleTank ("WS")
//   Top / Bottom                  = ผล "Cr Cwt." ของตัวอย่างนั้นที่ Position = Top / Bottom
// 1 แถวในตาราง = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
// ช่อง Customer name / Sampling ที่ค่าเหมือนแถวบนจะรวมเป็นช่องเดียว
// ตัวอย่างต่างลูกค้า หรือต่าง Chemical Name แยกเป็นคนละตาราง
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ VPC-Mitsubishi VN
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF CHROME COATING";

// ItemName ใน Routine_RequestLab ของช่องผล และค่า Position ของแต่ละคอลัมน์
const ITEM_NAME = "Cr Cwt.";
const RESULT_LABEL = "Cr Coating (mg/m²)";
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

// Customer name / Sampling / Code / Top / Bottom
const COLUMN_WIDTHS = [37, 27, 29, 35.5, 35.5];
const HEAD_TOP_HEIGHT = 14.5; // แถว "Cr Coating (mg/m²)"
const ROW_HEIGHT = 7.4; // แถว Top / Bottom และแถวผล

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TITLE_GAP = 14; // หัวข้อหน้า -> Customer Name
const INFO_TABLE_GAP = 4; // บล็อก Customer / Chemical Name -> ตาราง
const TABLE_GAP = 10; // ระหว่างตารางของแต่ละกลุ่ม
const REMARK_GAP = 10; // ตารางสุดท้าย -> Remark
const REMARK_LINE_HEIGHT = 5.6;
const BOTTOM_LIMIT = 20; // เนื้อหาห้ามเลยขอบล่างนี้ (เลข form อยู่ที่ 10 mm)

// ผลที่วิเคราะห์ไม่ได้ แสดงเป็น N/D เหมือน NPI
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  return text;
}

// "Dong A - WS" -> { customer: "Dong A", code: "WS" }
// ไม่มี "-" ให้ทั้งค่าเป็นชื่อลูกค้า
function splitTank(tankName) {
  const text = util.safe(tankName);
  const index = text.lastIndexOf("-");
  if (index === -1) return { customer: text, code: "" };
  return {
    customer: text.substring(0, index).trim(),
    code: text.substring(index + 1).trim(),
  };
}

// Sampling เขียนเป็น "26 Dec 25"
// ค่าที่อ่านจาก DB เป็น datetime UTC จึงต้องอ่านด้วย getUTC* ไม่งั้นวันจะเพี้ยนไป 1 วัน
function toSamplingDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";
  const year = String(date.getUTCFullYear() % 100).padStart(2, "0");
  return date.getUTCDate() + " " + MONTHS_SHORT[date.getUTCMonth()] + " " + year;
}

// ผลของตัวอย่างที่ Position นั้น คืน null เมื่อไม่มีรายการนั้นเลย
function findItem(sample, position) {
  const wantedItem = ITEM_NAME.toLowerCase();
  const wantedPosition = position.toLowerCase();
  const found = sample.items.filter(
    (item) =>
      util.safe(item.ItemName).toLowerCase() === wantedItem &&
      util.safe(item.Position).toLowerCase() === wantedPosition
  );
  if (found.length === 0) return null;
  return found.find((item) => util.safe(item.Result) !== "") || found[0];
}

// รวมตัวอย่างทุก tank เป็นแถวของตาราง เรียงตาม SampleNo
// แล้วแบ่งกลุ่มตาม (ลูกค้า, Chemical Name) ที่ติดกัน กลุ่มละ 1 ตาราง
// ตัวอย่างที่ไม่มีผล Cr Cwt. เลยไม่ต้องออกแถว
function collectGroups(report) {
  const rows = [];
  report.tanks.forEach((tank) => {
    const { customer, code } = splitTank(tank.tankName);
    const push = (sample) => {
      if (POSITIONS.every((position) => findItem(sample, position) === null)) return;
      rows.push({
        sampleNo: sample.sampleNo,
        customer: customer,
        code: code,
        chemicalName: util.safe(sample.sampleName),
        sampling: toSamplingDate(sample.samplingDate),
        results: POSITIONS.map((position) => {
          const item = findItem(sample, position);
          return item === null ? "" : resultText(item.Result);
        }),
      });
    };
    tank.solutions.forEach(push);
    tank.performances.forEach(push);
  });
  rows.sort((a, b) => a.sampleNo - b.sampleNo);

  const groups = [];
  rows.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last.customer === row.customer && last.chemicalName === row.chemicalName) {
      last.rows.push(row);
    } else {
      groups.push({ customer: row.customer, chemicalName: row.chemicalName, rows: [row] });
    }
  });
  return groups;
}

function drawPageHeader(doc, report) {
  const currentY = header.DrawHeader(doc, report);
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + TITLE_GAP;
}

// บล็อก "Customer Name:" / "Chemical Name:" กลางกระดาษ
// ":" ติดท้ายป้ายแต่ละบรรทัด ส่วนค่าเริ่มตรงกันทั้งสองบรรทัด
// รับขอบบน คืนขอบล่าง (แบบ DrawSampleInfo)
const INFO_ASCENT = 2.8;
const INFO_DESCENT = 1;
const INFO_LINE_HEIGHT = 8.8;
const INFO_BLOCK_HEIGHT = INFO_ASCENT + INFO_LINE_HEIGHT + INFO_DESCENT;

function drawInfo(doc, group, topY) {
  const rows = [
    { label: "Customer Name:", value: group.customer },
    { label: "Chemical Name:", value: group.chemicalName },
  ];
  const gapAfterColon = 13;

  doc.setFontSize(12);
  doc.setFont("times", "bold");
  let labelWidth = 0;
  rows.forEach((row) => {
    labelWidth = Math.max(labelWidth, doc.getTextWidth(row.label));
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
    doc.text(row.label, startX, y);
    doc.setFont("times", "normal");
    doc.text(row.value, valueX, y);
  });

  return topY + INFO_BLOCK_HEIGHT;
}

// จำนวนแถวที่ค่าในคอลัมน์นี้ซ้ำกันต่อเนื่องจากแถว index ลงไป
function spanFrom(rows, index, field) {
  let count = 1;
  while (index + count < rows.length && rows[index + count][field] === rows[index][field]) {
    count++;
  }
  return count;
}

// ตารางของ 1 กลุ่ม
//   | Customer name | Sampling | Code | Cr Coating (mg/m²) |
//   |               |          |      |   Top   |  Bottom  |
//   | Dong A        | 26 Dec 25| WS   |  30.10  |  24.79   |
//   |  (รวมช่อง)    | (รวมช่อง) | C    |  ...    |  ...     |
function buildTableOptions(doc, group) {
  const headStyle = { fillColor: HEAD_FILL, fontStyle: "bold" };
  const head = [
    [
      { content: "Customer name", rowSpan: 2, styles: headStyle },
      { content: "Sampling", rowSpan: 2, styles: headStyle },
      { content: "Code", rowSpan: 2, styles: headStyle },
      {
        content: RESULT_LABEL,
        colSpan: POSITIONS.length,
        styles: { ...headStyle, minCellHeight: HEAD_TOP_HEIGHT },
      },
    ],
    POSITIONS.map((position) => ({ content: position, styles: headStyle })),
  ];

  const body = [];
  let customerLeft = 0;
  let samplingLeft = 0;
  group.rows.forEach((row, index) => {
    const line = [];
    // ช่องที่ถูกรวมจากแถวบนไม่ต้องใส่ cell ซ้ำ
    if (customerLeft === 0) {
      customerLeft = spanFrom(group.rows, index, "customer");
      line.push({ content: row.customer, rowSpan: customerLeft });
    }
    if (samplingLeft === 0) {
      samplingLeft = spanFrom(group.rows, index, "sampling");
      line.push({ content: row.sampling, rowSpan: samplingLeft });
    }
    customerLeft--;
    samplingLeft--;
    line.push(row.code);
    row.results.forEach((result) => line.push(result));
    body.push(line);
  });

  const tableWidth = COLUMN_WIDTHS.reduce((a, b) => a + b, 0);
  const left = (doc.internal.pageSize.width - tableWidth) / 2;
  const columnStyles = {};
  COLUMN_WIDTHS.forEach((width, index) => {
    columnStyles[index] = { cellWidth: width };
  });

  return {
    head: head,
    body: body,
    theme: "grid",
    margin: { left: left, right: left },
    tableWidth: tableWidth,
    styles: {
      font: "times",
      fontSize: 12,
      textColor: 0,
      fillColor: [255, 255, 255],
      lineColor: 0,
      lineWidth: 0.2,
      cellPadding: 1,
      halign: "center",
      valign: "middle",
      minCellHeight: ROW_HEIGHT,
    },
    headStyles: { textColor: 0 },
    columnStyles: columnStyles,
  };
}

// วาดตารางลงเอกสารทดลองเพื่อวัดความสูงจริง (ชื่อยาวอาจตัดบรรทัดทำให้สูงขึ้น)
function measureHeight(tableOptions) {
  const scratch = new jsPDF();
  scratch.autoTable({ ...tableOptions, startY: 0, margin: { ...tableOptions.margin, top: 0 } });
  return scratch.lastAutoTable.finalY;
}

function remarkHeight() {
  return (REMARK_LINES.length - 1) * REMARK_LINE_HEIGHT + INFO_DESCENT;
}

// "Remark :" ตามด้วยข้อความเรียงบรรทัด รับ baseline ของบรรทัดแรก คืนขอบล่าง
function drawRemark(doc, baseY) {
  doc.setFontSize(11.5);
  doc.setFont("times", "bold");
  const labelX = header.MARGIN_LEFT + 10;
  doc.text(REMARK_LABEL, labelX, baseY);
  const colonX = labelX + doc.getTextWidth(REMARK_LABEL) + 1.5;
  doc.setFont("times", "normal");
  doc.text(":", colonX, baseY);

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
  const groups = collectGroups(report);
  if (groups.length === 0) {
    throw new Error("ไม่มีตัวอย่างที่ออกรายงานได้ใน " + report.refNo);
  }

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageTopY = drawPageHeader(doc, report);
  const bottomY = pageHeight - BOTTOM_LIMIT;
  let currentY = pageTopY;
  let pageEmpty = true;
  const newPage = () => {
    doc.addPage();
    drawPageHeader(doc, report);
    currentY = pageTopY;
    pageEmpty = true;
  };

  // จำนวนแถวมากสุดของกลุ่มที่วางได้ตั้งแต่ currentY โดยไม่เลยขอบล่าง
  const rowsThatFit = (group, rows) => {
    const room = bottomY - currentY - INFO_BLOCK_HEIGHT - INFO_TABLE_GAP;
    let count = 0;
    while (
      count < rows.length &&
      measureHeight(buildTableOptions(doc, { ...group, rows: rows.slice(0, count + 1) })) <= room
    ) {
      count++;
    }
    return count;
  };

  groups.forEach((group) => {
    // ช่องที่รวมแถว (rowSpan) ตัดข้ามหน้าไม่ได้ จึงแบ่งแถวเป็นก้อนตามที่หน้านั้นวางได้เอง
    // ก้อนที่ขึ้นหน้าใหม่จะมีบล็อก Customer / Chemical Name และหัวตารางซ้ำ
    let remaining = group.rows;
    while (remaining.length > 0) {
      let count = rowsThatFit(group, remaining);
      // ทั้งกลุ่มไม่พอหน้านี้ ขึ้นหน้าใหม่ก่อน (ถ้าหน้านี้มีของอยู่แล้ว)
      if (count < remaining.length && !pageEmpty) {
        newPage();
        count = rowsThatFit(group, remaining);
      }
      count = Math.max(count, 1);
      const chunk = { ...group, rows: remaining.slice(0, count) };
      remaining = remaining.slice(count);

      currentY = drawInfo(doc, chunk, currentY) + INFO_TABLE_GAP;
      doc.autoTable({ ...buildTableOptions(doc, chunk), startY: currentY });
      currentY = doc.lastAutoTable.finalY + TABLE_GAP;
      pageEmpty = false;
      if (remaining.length > 0) newPage();
    }
  });

  // remark และช่องเซ็นต้องอยู่หน้าสุดท้ายด้วยกันเสมอ
  // ถ้า remark จะทับช่องเซ็น ย้ายทั้งสองอย่างไปหน้าใหม่พร้อมหัวกระดาษ
  let remarkY = currentY - TABLE_GAP + REMARK_GAP;
  const signatureTopY = signature.TopY(doc, report.signers, SIGN_LABELS);
  if (remarkY + remarkHeight() + 4 > signatureTopY) {
    newPage();
    remarkY = pageTopY;
  }
  const lastY = drawRemark(doc, remarkY);

  signature.DrawSignature(doc, report.signers, lastY + 4, SIGN_LABELS);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
