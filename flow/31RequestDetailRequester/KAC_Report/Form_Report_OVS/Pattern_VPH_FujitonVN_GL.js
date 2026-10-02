const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// VPH-FUJITON VN-GL : PERFORMANCE OF CHROME COATING
//
// บล็อกเหนือตาราง (กลางหน้า)
//   Line Name      = SampleTank
//   Material       = ProcessReportName
// ตาราง 1 แถว = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   Sample ID      = SampleName ขึ้นบรรทัดใหม่ก่อน "(" เสมอ เช่น "Blank\n(Coil: ...)"
//   Sampling date  = SamplingDate (เขียนแบบ "26 February 2026") แถวติดกันที่วันเดียวกันรวมเป็นช่องเดียว
//   Chemical name  = SampleType (ยาวเกินช่องตัดบรรทัดหลัง "/")
//   Top / Back     = ผล "Cr Cwt." ของตัวอย่างนั้นที่ Position = Top / Bottom
// ถ้า Line Name / Material เปลี่ยน ขึ้นบล็อก + ตารางใหม่
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ VPC-Dong A
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF CHROME COATING";

// ItemName ใน Routine_RequestLab ของช่องผล แยกด้านด้วยคอลัมน์ Position
// หัวคอลัมน์ในแบบฟอร์มเขียนว่า Back แต่ข้อมูลเก็บเป็น Position = Bottom
const ITEM_NAME = "Cr Cwt.";
const RESULT_HEAD = "Total Cr Coating (mg/m²)";
const COLUMNS = [
  { label: "Top", position: "Top" },
  { label: "Back", position: "Bottom" },
];

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม
const REMARK_LABEL = "Remark";
const REMARK_LINES = [
  "1. Calibration curve of Cr on GL is in range of 0.00-128.98 mg/m². (New curve)",
  "2. Result were not deduced from blank.",
];

// ช่องเซ็นใช้กรอบชุดเดิม เปลี่ยนแค่หัวกรอบตามแบบฟอร์มนี้
const SIGN_LABELS = ["Issued by:", "Checked by:", "Review by:", "Approved by:"];

const HEAD_FILL = [189, 215, 238];

// Sample ID / Sampling date / Chemical name / Top / Back
const COLUMN_WIDTHS = [50.5, 37, 30, 27, 26];
const CELL_PADDING = 1;
const HEAD_TOP_HEIGHT = 8.7; // แถว "Total Cr Coating (mg/m²)"
const HEAD_BOTTOM_HEIGHT = 9.4; // แถว Top / Back
const ROW_HEIGHT = 10; // แถวผล (สูงพอสำหรับ 2 บรรทัด)
const FONT_SIZE = 12;

const TITLE_GAP = 10; // หัวข้อหน้า -> Line Name
const INFO_TABLE_GAP = 5; // บล็อก Line Name / Material -> ตาราง
const TABLE_GAP = 10; // ระหว่างตารางของแต่ละกลุ่ม
const REMARK_GAP = 10; // ตารางสุดท้าย -> Remark
const REMARK_LINE_HEIGHT = 5.2;
const BOTTOM_LIMIT = 20; // เนื้อหาห้ามเลยขอบล่างนี้ (เลข form อยู่ที่ 10 mm)

// ผลที่วิเคราะห์ไม่ได้ แสดงเป็น N/D เหมือน NPI
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  return text;
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

// Chemical name ที่ยาวเกินช่อง ตัดบรรทัดหลัง "/" ตามแบบฟอร์ม แทนการให้ autoTable ตัดกลางคำ
//   "CL-N364SV/ZM-1300ANV" -> "CL-N364SV/\nZM-1300ANV"
function fitText(doc, text, columnIndex, breakAt) {
  doc.setFont("times", "normal");
  doc.setFontSize(FONT_SIZE);
  const room = COLUMN_WIDTHS[columnIndex] - CELL_PADDING * 2;
  if (doc.getTextWidth(text) <= room) return text;
  return breakAt(text);
}

// Sample ID ขึ้นบรรทัดใหม่ก่อน "(" เสมอ แถวจะได้สูงเท่ากันทุกแถวเหมือนแบบฟอร์ม
//   "Blank (Coil: A601166A)" -> "Blank\n(Coil: A601166A)"
function breakSampleId(text) {
  return text.replace(/\s*\(/, "\n(");
}

function breakChemical(text) {
  return text.replace(/\/\s*/g, "/\n");
}

// รวมตัวอย่างทุก tank เป็นแถวของตาราง เรียงตาม SampleNo
// แล้วแบ่งกลุ่มตาม (Line Name, Material) ที่ติดกัน กลุ่มละ 1 ตาราง
// ตัวอย่างที่ไม่มีผล Cr Cwt. เลยไม่ต้องออกแถว
function collectGroups(doc, report) {
  const rows = [];
  report.tanks.forEach((tank) => {
    const push = (sample) => {
      const items = COLUMNS.map((column) => findItem(sample, column.position));
      if (items.every((item) => item === null)) return;
      const chemicalName = util.safe(sample.sampleType);
      rows.push({
        sampleNo: sample.sampleNo,
        lineName: util.safe(tank.tankName),
        material: util.safe(sample.processReportName),
        sampleId: breakSampleId(util.safe(sample.sampleName)),
        sampling: util.toLongDate(sample.samplingDate),
        chemicalName: fitText(doc, chemicalName === "" ? "-" : chemicalName, 2, breakChemical),
        results: items.map((item) => (item === null ? "" : resultText(item.Result))),
      });
    };
    tank.solutions.forEach(push);
    tank.performances.forEach(push);
  });
  rows.sort((a, b) => a.sampleNo - b.sampleNo);

  const groups = [];
  rows.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last.lineName === row.lineName && last.material === row.material) {
      last.rows.push(row);
    } else {
      groups.push({ lineName: row.lineName, material: row.material, rows: [row] });
    }
  });
  return groups;
}

function drawPageHeader(doc, report) {
  const currentY = header.DrawHeader(doc, report);
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + TITLE_GAP;
}

// บล็อก "Line Name:" / "Material:" กลางกระดาษ
// ":" ติดท้ายป้ายแต่ละบรรทัด ส่วนค่าเริ่มตรงกันทั้งสองบรรทัด
// รับขอบบน คืนขอบล่าง (แบบ DrawSampleInfo)
const INFO_ASCENT = 2.8;
const INFO_DESCENT = 1;
const INFO_LINE_HEIGHT = 6.6;
const INFO_BLOCK_HEIGHT = INFO_ASCENT + INFO_LINE_HEIGHT + INFO_DESCENT;

function drawInfo(doc, group, topY) {
  const rows = [
    { label: "Line Name:", value: group.lineName },
    { label: "Material:", value: group.material },
  ];
  const gapAfterColon = 8;

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
//   | Sample ID | Sampling date | Chemical name | Total Cr Coating (mg/m²) |
//   |           |               |               |   Top   |   Back         |
//   | Blank     | 26 February   | -             |  14.96  |  10.58         |
//   | Treatment |   (รวมช่อง)    | CL-N364SV/... |  32.97  |  45.65         |
function buildTableOptions(doc, group) {
  const headStyle = { fillColor: HEAD_FILL, fontStyle: "bold" };
  const head = [
    [
      { content: "Sample ID", rowSpan: 2, styles: headStyle },
      { content: "Sampling date", rowSpan: 2, styles: headStyle },
      { content: "Chemical\nname", rowSpan: 2, styles: headStyle },
      {
        content: RESULT_HEAD,
        colSpan: COLUMNS.length,
        styles: { ...headStyle, minCellHeight: HEAD_TOP_HEIGHT },
      },
    ],
    COLUMNS.map((column) => ({
      content: column.label,
      styles: { ...headStyle, minCellHeight: HEAD_BOTTOM_HEIGHT },
    })),
  ];

  const body = [];
  let samplingLeft = 0;
  group.rows.forEach((row, index) => {
    const line = [row.sampleId];
    // ช่องที่ถูกรวมจากแถวบนไม่ต้องใส่ cell ซ้ำ
    if (samplingLeft === 0) {
      samplingLeft = spanFrom(group.rows, index, "sampling");
      line.push({ content: row.sampling, rowSpan: samplingLeft });
    }
    samplingLeft--;
    line.push(row.chemicalName);
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
      fontSize: FONT_SIZE,
      textColor: 0,
      fillColor: [255, 255, 255],
      lineColor: 0,
      lineWidth: 0.2,
      cellPadding: CELL_PADDING,
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

// "Remark:" ตามด้วยข้อความเรียงบรรทัด รับ baseline ของบรรทัดแรก คืนขอบล่าง
function drawRemark(doc, baseY) {
  doc.setFontSize(12);
  doc.setFont("times", "bold");
  const labelX = header.MARGIN_LEFT + 12;
  doc.text(REMARK_LABEL + ":", labelX, baseY);

  doc.setFont("times", "normal");
  const textX = labelX + 22;
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
  const doc = new jsPDF();
  const groups = collectGroups(doc, report);
  if (groups.length === 0) {
    throw new Error("ไม่มีตัวอย่างที่ออกรายงานได้ใน " + report.refNo);
  }

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
    // ก้อนที่ขึ้นหน้าใหม่จะมีบล็อก Line Name / Material และหัวตารางซ้ำ
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
