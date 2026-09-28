const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// PPI - Toyota : PERFORMANCE OF PHOSPHATE COATING
//
// ตารางละ 1 แถว = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   No.            = SampleNo
//   Customer       = SampleTank
//   Sample ID      = ProcessReportName
//   Sampling Date  = SamplingDate ของตัวอย่างนั้น (วันเดียวกันที่อยู่ติดกันรวมเป็นช่องเดียว)
//   ช่องผล         = ผลของ ItemName นั้นในตัวอย่างนั้น
//
// หน้า 1 (Table 1) : Zn / Ni / Mn
// หน้า 2 (Table 2) : Free F- (F-F) / Total F- (T-F(WWT))
//                    ออกเฉพาะเมื่อมีตัวอย่างใดขอ F-F หรือ T-F(WWT) มา
// remark กับช่องเซ็นอยู่หน้าสุดท้ายเสมอ
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ AKZ
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF PHOSPHATE COATING";
const TABLE_CAPTION = "Result of solution sample";

// ItemName ใน Routine_RequestLab ของแต่ละคอลัมน์ผล
const TABLE_METAL = {
  label: "Table 1",
  columns: [
    { title: "Zn\n(ppm)", itemName: "Zn" },
    { title: "Ni\n(ppm)", itemName: "Ni" },
    { title: "Mn\n(ppm)", itemName: "Mn" },
  ],
  // No. / Sample ID / Sampling Date / ผลแต่ละคอลัมน์ ส่วน Customer ได้ที่เหลือ
  widths: { no: 11, sampleId: 24, date: 26, result: 20 },
};
const TABLE_FLUORIDE = {
  label: "Table 2",
  columns: [
    { title: "Free F-\n(ppm)", itemName: "F-F", showRawData: true },
    { title: "Total F-\n(ppm)", itemName: "T-F(WWT)" },
  ],
  widths: { no: 11, sampleId: 26, date: 28, result: 24 },
};

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม
const REMARK_LABEL = "Remark:";
const REMARK_TEXT = "Free F- Curve range control 50-500 ppm";

const HEAD_FILL = [189, 215, 238];
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
// ในวงเล็บบรรทัดล่าง เช่น "< 50\n(31.4)"
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

function hasAnyItem(samples, columns) {
  return samples.some(({ sample }) =>
    columns.some((column) => findItem(sample, column.itemName) !== null)
  );
}

// รวมตัวอย่างทุก line เป็นรายการเดียว เรียงตาม SampleNo
// Customer คือ SampleTank ซึ่งเก็บไว้ที่ระดับ tank จึงแนบชื่อ tank ไปกับตัวอย่าง
function collectSamples(report) {
  const samples = [];
  report.tanks.forEach((tank) => {
    tank.solutions.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
    tank.performances.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
  });
  return samples.sort((a, b) => a.sample.sampleNo - b.sample.sampleNo);
}

// Customer Name บนหัวตาราง : SampleTank ตัดส่วนในวงเล็บออก ตัวพิมพ์ใหญ่
//   "Toyota Motor Phils. Corp. (Body)" -> "TOYOTA MOTOR PHILS. CORP."
function customerNameOf(samples) {
  const names = [];
  samples.forEach(({ tankName }) => {
    const name = util.stripParentheses(tankName).toUpperCase();
    if (name !== "" && names.indexOf(name) === -1) names.push(name);
  });
  return names.join(", ");
}

// ช่อง Customer ในตาราง : ส่วนที่อยู่ในวงเล็บขึ้นบรรทัดที่ 2 เสมอ
//   "Toyota Motor Phils. Corp. (Body)" -> "Toyota Motor Phils. Corp.\n(Body)"
function customerCellText(tankName) {
  const text = util.safe(tankName);
  const open = text.indexOf("(");
  if (open <= 0) return text;
  return text.slice(0, open).trim() + "\n" + text.slice(open).trim();
}

// Chemical Name บนแถบหัวตาราง = SampleName
function chemicalNameOf(samples) {
  const names = [];
  samples.forEach(({ sample }) => {
    const name = util.safe(sample.sampleName);
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
function drawCaption(doc, label, topY) {
  const x = header.MARGIN_LEFT + 8;
  const y = topY + 2.6;
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.text(label, x, y);
  const labelWidth = doc.getTextWidth(label);
  doc.setFont("times", "normal");
  doc.text(TABLE_CAPTION, x + labelWidth + 2, y);
  return y + 0.9;
}

// ตัวอย่างที่อยู่ติดกันและเก็บวันเดียวกัน ให้ช่อง Sampling Date รวมเป็นช่องเดียว
function groupSamplingDates(samples) {
  const spans = new Array(samples.length).fill(0);
  let start = 0;
  for (let i = 1; i <= samples.length; i++) {
    const same =
      i < samples.length &&
      util.toLongDate(samples[i].sample.samplingDate) ===
        util.toLongDate(samples[start].sample.samplingDate);
    if (!same) {
      spans[start] = i - start;
      start = i;
    }
  }
  return spans;
}

// 1 ตาราง = 1 หน้า (ถ้าตัวอย่างเยอะ ตารางจะต่อหน้าถัดไปพร้อมหัวกระดาษ)
function drawTablePage(doc, report, samples, spec, addPage) {
  if (addPage) doc.addPage();
  const tableTopY = drawPageHeader(doc, report);
  let currentY = drawCustomerName(doc, customerNameOf(samples), tableTopY);
  currentY = drawCaption(doc, spec.label, currentY + header.BLOCK_GAP);

  const dateColumn = 3;
  const firstResultColumn = 4;
  const columnCount = firstResultColumn + spec.columns.length;
  const spans = groupSamplingDates(samples);

  // เก็บว่าช่องไหนไม่มีรายการ เพื่อถมเทาตอนวาด
  const missing = [];
  const body = samples.map(({ tankName, sample }, rowIndex) => {
    const cells = [
      String(sample.sampleNo),
      customerCellText(tankName),
      util.safe(sample.processReportName),
    ];
    // แถวที่อยู่ในช่วงวันเดียวกับแถวก่อนหน้า ไม่ต้องใส่ช่องวันที่ (ถูก rowSpan กินไปแล้ว)
    if (spans[rowIndex] > 0) {
      cells.push({
        content: util.toLongDate(sample.samplingDate),
        rowSpan: spans[rowIndex],
      });
    }
    spec.columns.forEach((column, offset) => {
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
    0: { cellWidth: spec.widths.no },
    2: { cellWidth: spec.widths.sampleId },
    [dateColumn]: { cellWidth: spec.widths.date },
  };
  spec.columns.forEach((column, offset) => {
    columnStyles[firstResultColumn + offset] = { cellWidth: spec.widths.result };
  });

  doc.autoTable({
    startY: currentY + 4,
    head: [
      [
        {
          content: "Chemical Name : " + chemicalNameOf(samples),
          colSpan: columnCount,
          styles: { halign: "left", fillColor: HEAD_FILL },
        },
      ],
      ["No.", "Customer", "Sample ID", "Sampling\nDate"].concat(
        spec.columns.map((column) => column.title)
      ),
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
    // Customer ไม่กำหนดความกว้าง ให้ได้ส่วนที่เหลือของหน้า
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

  return { finalY: doc.lastAutoTable.finalY, tableTopY: tableTopY };
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
  let drawn = drawTablePage(doc, report, samples, TABLE_METAL, false);

  // หน้า 2 ออกเฉพาะเมื่อมีตัวอย่างที่ขอ F-F หรือ T-F(WWT)
  if (hasAnyItem(samples, TABLE_FLUORIDE.columns)) {
    drawn = drawTablePage(doc, report, samples, TABLE_FLUORIDE, true);
  }

  // remark และช่องเซ็นอยู่ท้ายรายงานหน้าสุดท้ายเท่านั้น
  const lastY = drawRemark(doc, report, drawn.finalY + 10);
  signature.DrawSignature(doc, report.signers, lastY + 8);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
