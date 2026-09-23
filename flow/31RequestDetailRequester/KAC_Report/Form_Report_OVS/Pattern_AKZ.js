const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

const PIC_BASE = "C:\\AutomationProject\\SAR\\asset\\";

// comment ของหน้า performance เป็นข้อความตายตัวตามแบบฟอร์ม
const PERFORMANCE_COMMENT =
  "Calibration curve of Cwt. on SPCC is in range of 0.000-3.766 g/m2";

// รายการที่ไม่ต้องแสดงในหน้า performance
const HIDDEN_PERFORMANCE_ITEMS = ["Mn Content (%)", "Ni Content (%)"];

const RED = [204, 0, 0];

function isHidden(itemReportName) {
  const name = util.safe(itemReportName).toLowerCase();
  return HIDDEN_PERFORMANCE_ITEMS.some(
    (hidden) => hidden.toLowerCase() === name
  );
}

function isCoatingWeight(itemReportName) {
  return /coating\s*weight/i.test(util.safe(itemReportName));
}

function resultText(value) {
  return util.hasResult(value) ? util.safe(value) : "--";
}

// -------------------------------------------------------------------------
// หน้า QUALITY OF SOLUTION : 1 หน้าต่อ 1 ตัวอย่างน้ำยา (1 line)
// -------------------------------------------------------------------------
function drawSolutionPage(doc, report, tank, sample) {
  let currentY = header.DrawHeader(doc, report);
  currentY = header.DrawPageTitle(doc, "QUALITY OF SOLUTION", currentY);
  currentY = header.DrawSampleInfo(
    doc,
    { lineName: tank.tankName, samplingDate: report.samplingDate },
    currentY + header.BLOCK_GAP
  );
  currentY = header.DrawSampleBar(doc, tank.productName, currentY + header.BLOCK_GAP);

  const body = sample.items.map((item) => [
    util.safe(item.ItemReportName),
    util.toReferenceText(item.ControlRange),
    resultText(item.Result),
    item.Evaluation,
  ]);

  doc.autoTable({
    startY: currentY,
    head: [["Item", "Reference", "Analysis Results", "Evaluation"]],
    body: body,
    theme: "grid",
    margin: { left: 18, right: 18 },
    styles: {
      font: "times",
      fontSize: 10,
      textColor: 0,
      lineColor: 0,
      lineWidth: 0.1,
      cellPadding: 1.5,
    },
    headStyles: {
      font: "times",
      fontStyle: "normal",
      fillColor: [255, 255, 255],
      textColor: 0,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
    },
    // ค่าที่หลุด spec ต้องเป็นสีแดงทั้งผลและคำตัดสิน
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const evaluation = body[data.row.index][3];
      if (
        (evaluation === "Lower" || evaluation === "Higher") &&
        (data.column.index === 2 || data.column.index === 3)
      ) {
        data.cell.styles.textColor = RED;
      }
    },
  });

  header.DrawCommentRow(
    doc,
    util.buildOutOfRangeComment(sample.items),
    doc.lastAutoTable.finalY
  );
}

// -------------------------------------------------------------------------
// หน้า PERFORMANCE OF PHOSPHATE COATING : 1 หน้าต่อ 1 ชิ้นทดสอบ
//
// ลำดับแถวตามแบบฟอร์ม (ไม่ยึด ReportOrder) :
//   Substrate -> Coating Appearance -> รายการจาก DB โดยแทรก Crystal Size
//   ต่อท้าย Coating Weight -> รูป SEM
// -------------------------------------------------------------------------
function buildPerformanceRows(sample) {
  const rows = [];
  rows.push(["Substrate", "--", util.safe(sample.sampleName)]);
  rows.push([
    "Coating Appearance (visual)",
    "--",
    resultText(sample.coatingAppearance),
  ]);

  sample.items.forEach((item) => {
    if (isHidden(item.ItemReportName)) return;
    rows.push([
      util.safe(item.ItemReportName),
      util.toSpecText(item.ControlRange),
      resultText(item.Result),
    ]);
    if (isCoatingWeight(item.ItemReportName)) {
      rows.push(["Crystal Size (\u00b5m)", "--", resultText(sample.crystalSize)]);
    }
  });

  return rows;
}

function drawPerformancePage(doc, report, tank, sample) {
  let currentY = header.DrawHeader(doc, report);
  currentY = header.DrawPageTitle(
    doc,
    "PERFORMANCE OF PHOSPHATE COATING",
    currentY
  );
  currentY = header.DrawSampleInfo(
    doc,
    { lineName: tank.tankName, samplingDate: report.samplingDate },
    currentY + header.BLOCK_GAP
  );
  currentY = header.DrawSampleBar(doc, tank.productName, currentY + header.BLOCK_GAP);

  const body = buildPerformanceRows(sample);

  // แถวรูป SEM อยู่แถวเดียวกับชื่อรายการ : ชื่ออยู่คอลัมน์ Item
  // ส่วนรูปกินสองคอลัมน์ที่เหลือ (ไม่ได้แยกเป็นคนละบรรทัด)
  const picHeight = 72;
  let picRowIndex = -1;
  if (sample.picture) {
    picRowIndex = body.length;
    body.push([
      { content: util.safe(sample.picture.itemReportName), styles: { valign: "top" } },
      { content: "", colSpan: 2, styles: { minCellHeight: picHeight } },
    ]);
  }

  doc.autoTable({
    startY: currentY,
    head: [["Item", "Specifications", "Analysis Results"]],
    body: body,
    theme: "grid",
    margin: { left: 18, right: 18 },
    styles: {
      font: "times",
      fontSize: 10,
      textColor: 0,
      lineColor: 0,
      lineWidth: 0.1,
      cellPadding: 1.5,
    },
    headStyles: {
      font: "times",
      fontStyle: "normal",
      fillColor: [255, 255, 255],
      textColor: 0,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: "center" },
      2: { halign: "center" },
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      if (data.row.index !== picRowIndex || data.column.index !== 1) return;
      if (util.safe(sample.picture.path) === "") return;
      try {
        const bitmap = fs.readFileSync(PIC_BASE + sample.picture.path);
        const picWidth = data.cell.width - 8;
        const x = data.cell.x + (data.cell.width - picWidth) / 2;
        doc.addImage(
          bitmap.toString("base64"),
          "JPEG",
          x,
          data.cell.y + 2,
          picWidth,
          picHeight - 4
        );
      } catch (err) {
        // ไม่มีไฟล์รูปให้ปล่อยช่องว่างไว้ ไม่ต้องทำให้รายงานทั้งใบพัง
        console.log("Pattern_AKZ : อ่านรูป SEM ไม่สำเร็จ " + err.message);
      }
    },
  });

  currentY = header.DrawCommentRow(doc, PERFORMANCE_COMMENT, doc.lastAutoTable.finalY);

  return currentY + 8;
}

// -------------------------------------------------------------------------
exports.CreatePDF = async (report) => {
  const doc = new jsPDF();
  let firstPage = true;
  let lastY = 20;

  report.tanks.forEach((tank) => {
    tank.solutions.forEach((sample) => {
      if (!firstPage) doc.addPage();
      firstPage = false;
      drawSolutionPage(doc, report, tank, sample);
    });
    tank.performances.forEach((sample) => {
      if (!firstPage) doc.addPage();
      firstPage = false;
      lastY = drawPerformancePage(doc, report, tank, sample);
    });
  });

  if (firstPage) {
    throw new Error("ไม่มีตัวอย่างที่ออกรายงานได้ใน " + report.refNo);
  }

  // ช่องเซ็นอยู่ท้ายรายงานหน้าสุดท้ายเท่านั้น
  signature.DrawSignature(doc, report.signers, lastY + 4);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
