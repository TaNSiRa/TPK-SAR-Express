const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// PERFORMANCE OF P-RATIO AND 020 RATIO
//
// ตารางเดียวต่อ request : 1 แถว = 1 ตัวอย่าง (SampleNo) เรียงตาม SampleNo
//   No.             = SampleNo
//   Customer Name   = SampleTank
//   Chemical Name   = ProcessReportName
//   Material Type   = SampleName
//   Sampling Date   = SampleRemark
//   P-ratio / 020-ratio = ผลของ ItemName นั้นในตัวอย่างนั้น
// ตัวอย่างที่ไม่ได้ขอรายการนั้นมา ช่องจะเป็นสีเทาตามแบบฟอร์ม
// หัวกระดาษ / ช่องเซ็น / เลข form ใช้ชุดเดียวกับ AKZ
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF P-RATIO AND 020 RATIO";

// ItemName ใน Routine_RequestLab ของแต่ละคอลัมน์ผล
const ITEM_P_RATIO = "XRD P Ratio(%)";
const ITEM_020_RATIO = "XRD 020 Ratio";

const HEAD_FILL = [189, 215, 238];
const NO_ITEM_FILL = [191, 191, 191];

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
// Customer Name คือ SampleTank ซึ่งเก็บไว้ที่ระดับ tank จึงแนบชื่อ tank ไปกับตัวอย่าง
function collectSamples(report) {
  const samples = [];
  report.tanks.forEach((tank) => {
    tank.solutions.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
    tank.performances.forEach((sample) => samples.push({ tankName: tank.tankName, sample }));
  });
  return samples.sort((a, b) => a.sample.sampleNo - b.sample.sampleNo);
}

function drawPageHeader(doc, report) {
  const currentY = header.DrawHeader(doc, report);
  return header.DrawPageTitle(doc, PAGE_TITLE, currentY) + header.BLOCK_GAP;
}

// P-ratio / 020-ratio อาจถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request (ReportOrder = 0)
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
  const body = samples.map(({ tankName, sample }, rowIndex) => {
    const cells = [
      String(sample.sampleNo),
      util.safe(tankName),
      util.safe(sample.processReportName),
      util.safe(sample.sampleName),
      util.safe(sample.sampleRemark),
    ];
    [ITEM_P_RATIO, ITEM_020_RATIO].forEach((itemName, offset) => {
      const item = findItem(sample, itemName);
      if (item === null) {
        missing.push(rowIndex + ":" + (5 + offset));
        cells.push("");
      } else {
        cells.push(resultText(item.Result));
      }
    });
    return cells;
  });

  doc.autoTable({
    startY: tableTopY,
    head: [
      [
        "No.",
        "Customer Name",
        "Chemical\nName",
        "Material\nType",
        "Sampling Date",
        "P-ratio\n(%)",
        "020-ratio",
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
      cellPadding: 2.5,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      font: "times",
      fontStyle: "bold",
      fillColor: HEAD_FILL,
      textColor: 0,
    },
    // Customer Name ไม่กำหนดความกว้าง ให้ได้ส่วนที่เหลือของหน้า
    columnStyles: {
      0: { cellWidth: 11 },
      2: { cellWidth: 22 },
      3: { cellWidth: 24 },
      4: { cellWidth: 35 },
      5: { cellWidth: 21 },
      6: { cellWidth: 21 },
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

  // ช่องเซ็นอยู่ท้ายรายงานหน้าสุดท้ายเท่านั้น
  signature.DrawSignature(doc, report.signers, doc.lastAutoTable.finalY + 15);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
