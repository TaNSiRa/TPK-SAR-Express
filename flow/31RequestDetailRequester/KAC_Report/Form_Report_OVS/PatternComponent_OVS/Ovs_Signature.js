const fs = require("fs");
const { jsPDF } = require("jspdf");
require("jspdf-autotable");
const util = require("./Ovs_Util.js");

// -------------------------------------------------------------------------
// ช่องเซ็นท้ายรายงาน OVS : ตาราง 4 กรอบตายตัว อยู่มุมล่างขวาของหน้าสุดท้ายเสมอ
//
// เรียงซ้ายไปขวา : UserApprove -> คนกด create report -> DGM -> JP
// หัวกรอบ : Approved data by -> Checked by -> Review by -> Approved by
// ช่องที่ยังไม่มีชื่อก็ปล่อยกรอบว่างไว้
//
// รูปลายเซ็นอ่านจากที่เดียวกับ pattern เก่าของ SAR คือ
//   C:\AutomationProject\SAR\asset_ts\Sign_Pic\<ชื่อผู้เซ็น>.jpg
// และวาดเฉพาะคนที่เซ็นแล้วจริง (signed) เหมือนของเดิมที่เช็คเวลา approve ก่อนวาด
//
// ตำแหน่งในวงเล็บมาจาก Master_User.Ovs_Position
// -------------------------------------------------------------------------

const SIGN_PIC_BASE = "C:\\AutomationProject\\SAR\\asset_ts\\Sign_Pic\\";

const BOX_COUNT = 4;
const BOX_WIDTH = 30; // mm ต่อ 1 กรอบ
const SIGN_HEIGHT = 16; // ความสูงแถวที่เว้นไว้ให้รูปลายเซ็น
const NAME_HEIGHT = 9; // ความสูงช่องชื่อ + ตำแหน่ง (2 บรรทัด)
const MARGIN_RIGHT = 18; // ให้ชิดขวาเท่ากับ margin ของตารางหลัก
const BOTTOM_MARGIN = 20; // ขอบล่างของช่องเซ็นห่างขอบกระดาษ (เลข form อยู่ที่ 10 mm)

// หัวของแต่ละกรอบ เรียงตามลำดับผู้เซ็นด้านบน
const HEAD_LABELS = ["Approved data by:", "Checked by:", "Review by:", "Approved by:"];

const HEAD_FILL = [189, 215, 238]; // ฟ้าอ่อนตามแบบฟอร์มตัวอย่าง
const LINE_COLOR = [0, 0, 0];

function cellStyle(extra, boxWidth) {
  return Object.assign(
    {
      textColor: 0,
      font: "times",
      fontSize: 9,
      valign: "middle",
      halign: "center",
      cellWidth: boxWidth,
      cellPadding: 0.8,
      lineColor: LINE_COLOR,
      lineWidth: 0.1,
    },
    extra || {}
  );
}

// วาดตารางลงเอกสารทดลองเพื่อวัดความสูงจริง (ชื่อยาวอาจตัดบรรทัดทำให้สูงขึ้น)
function measureHeight(tableOptions) {
  // ความกว้างตารางตายตัวอยู่แล้ว ไม่ต้องใช้ margin ซ้ายของหน้าจริง
  // (กระดาษ A3 margin ซ้ายเกินความกว้าง A4 ของเอกสารทดลอง)
  const scratch = new jsPDF();
  scratch.autoTable({ ...tableOptions, startY: 0, margin: { left: 0, right: 0, top: 0 } });
  return scratch.lastAutoTable.finalY;
}

function positionText(position) {
  const text = util.safe(position);
  return text === "" ? "" : "(" + text + ")";
}

// ความกว้างต่อกรอบ : pattern ที่ต้องวางช่องเซ็นข้างตาราง (เช่น A3 แนวนอน) ส่ง options.boxWidth มาได้
function boxWidthOf(options) {
  return (options && options.boxWidth) || BOX_WIDTH;
}

// labels : หัวกรอบของ pattern ที่ใช้คำต่างจากค่าเริ่มต้น (ต้องมี BOX_COUNT ช่อง)
function buildTable(doc, signers, labels, options) {
  const headLabels = labels || HEAD_LABELS;
  const boxWidth = boxWidthOf(options);
  const list = [];
  for (let i = 0; i < BOX_COUNT; i++) {
    const signer = (signers && signers[i]) || {};
    list.push({
      name: util.safe(signer.name),
      position: util.safe(signer.position),
      signed: signer.signed === true,
    });
  }

  const pageWidth = doc.internal.pageSize.width;
  const tableWidth = boxWidth * BOX_COUNT;
  const left = pageWidth - MARGIN_RIGHT - tableWidth;

  // ชื่อกับตำแหน่งอยู่ช่องเดียวกันคนละบรรทัด จะได้ไม่มีเส้นคั่นระหว่างกัน
  // สูงเผื่อไว้ 2 บรรทัดเสมอ กรอบจะได้สูงเท่ากันแม้ยังไม่มีชื่อ
  const head = [];
  const signRow = [];
  const nameRow = [];
  list.forEach((signer, index) => {
    head.push({ content: headLabels[index], styles: cellStyle({ fillColor: HEAD_FILL }, boxWidth) });
    signRow.push({ content: "", styles: cellStyle({ minCellHeight: SIGN_HEIGHT }, boxWidth) });
    const lines = [util.toSignName(signer.name), positionText(signer.position)];
    nameRow.push({
      content: lines.filter((line) => line !== "").join("\n"),
      styles: cellStyle({ minCellHeight: NAME_HEIGHT }, boxWidth),
    });
  });

  const tableOptions = {
    head: [head],
    body: [signRow, nameRow],
    theme: "grid",
    margin: { left: left, right: MARGIN_RIGHT },
    tableWidth: tableWidth,
    styles: { lineColor: LINE_COLOR, lineWidth: 0.1 },
  };

  return { list, tableOptions, boxWidth };
}

// ช่องเซ็นต้องอยู่ล่างขวาของกระดาษเสมอ : วางให้ขอบล่างของตารางอยู่ที่ขอบล่างที่กำหนด
// คืนขอบบนของช่องเซ็น ให้ pattern เช็คก่อนได้ว่าเนื้อหาท้ายรายงานจะทับช่องเซ็นหรือไม่
function topYOf(doc, tableOptions) {
  const bottomY = doc.internal.pageSize.height - BOTTOM_MARGIN;
  return bottomY - measureHeight(tableOptions);
}

exports.TopY = (doc, signers, labels, options) =>
  topYOf(doc, buildTable(doc, signers, labels, options).tableOptions);

// ความกว้างทั้งหมดของช่องเซ็น ให้ pattern เช็คได้ว่าวางข้างตารางได้หรือไม่
exports.Width = (options) => boxWidthOf(options) * BOX_COUNT;

exports.DrawSignature = (doc, signers, currentY, labels, options) => {
  const { list, tableOptions, boxWidth } = buildTable(doc, signers, labels, options);

  // currentY คือจุดต่ำสุดที่เนื้อหาใช้ไปแล้ว ถ้าช่องเซ็นจะทับเนื้อหาให้ขึ้นหน้าใหม่
  const topY = topYOf(doc, tableOptions);
  if (currentY > topY) doc.addPage();

  doc.autoTable({
    ...tableOptions,
    startY: topY,
    didDrawCell: function (data) {
      // แถว index 0 ของ body คือแถวที่เว้นไว้ให้รูปลายเซ็น
      if (data.section !== "body" || data.row.index !== 0) return;
      const signer = list[data.column.index];
      if (!signer || !signer.signed || signer.name === "") return;
      try {
        const bitmap = fs.readFileSync(SIGN_PIC_BASE + signer.name + ".jpg");
        doc.addImage(
          bitmap.toString("base64"),
          "jpg",
          data.cell.x + 1,
          data.cell.y + 1,
          boxWidth - 2,
          SIGN_HEIGHT - 2
        );
      } catch (err) {
        // ไม่มีไฟล์ลายเซ็นของคนนี้ ปล่อยกรอบว่างไว้เหมือน pattern เก่า
        console.log("ไม่พบรูปลายเซ็นของ " + signer.name);
      }
    },
  });

  return doc.lastAutoTable.finalY;
};
