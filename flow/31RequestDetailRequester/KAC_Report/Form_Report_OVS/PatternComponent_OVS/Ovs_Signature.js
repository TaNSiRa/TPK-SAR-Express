const fs = require("fs");
const util = require("./Ovs_Util.js");

// -------------------------------------------------------------------------
// ช่องเซ็นท้ายรายงาน OVS : ตาราง 4 กรอบตายตัว ชิดขวาของหน้าสุดท้าย
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

// หัวของแต่ละกรอบ เรียงตามลำดับผู้เซ็นด้านบน
const HEAD_LABELS = ["Approved data by:", "Checked by:", "Review by:", "Approved by:"];

const HEAD_FILL = [189, 215, 238]; // ฟ้าอ่อนตามแบบฟอร์มตัวอย่าง
const LINE_COLOR = [0, 0, 0];

function cellStyle(extra) {
  return Object.assign(
    {
      textColor: 0,
      font: "times",
      fontSize: 9,
      valign: "middle",
      halign: "center",
      cellWidth: BOX_WIDTH,
      cellPadding: 0.8,
      lineColor: LINE_COLOR,
      lineWidth: 0.1,
    },
    extra || {}
  );
}

function positionText(position) {
  const text = util.safe(position);
  return text === "" ? "" : "(" + text + ")";
}

exports.DrawSignature = (doc, signers, currentY) => {
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
  const pageHeight = doc.internal.pageSize.height;
  const tableWidth = BOX_WIDTH * BOX_COUNT;
  const left = pageWidth - MARGIN_RIGHT - tableWidth;

  // เผื่อที่ให้หัวตาราง + แถวรูป + ชื่อ + ตำแหน่ง ไม่ให้ตกขอบล่าง
  if (currentY > pageHeight - (SIGN_HEIGHT + 30)) {
    doc.addPage();
    currentY = 20;
  }

  // ชื่อกับตำแหน่งอยู่ช่องเดียวกันคนละบรรทัด จะได้ไม่มีเส้นคั่นระหว่างกัน
  // สูงเผื่อไว้ 2 บรรทัดเสมอ กรอบจะได้สูงเท่ากันแม้ยังไม่มีชื่อ
  const head = [];
  const signRow = [];
  const nameRow = [];
  list.forEach((signer, index) => {
    head.push({ content: HEAD_LABELS[index], styles: cellStyle({ fillColor: HEAD_FILL }) });
    signRow.push({ content: "", styles: cellStyle({ minCellHeight: SIGN_HEIGHT }) });
    const lines = [util.toSignName(signer.name), positionText(signer.position)];
    nameRow.push({
      content: lines.filter((line) => line !== "").join("\n"),
      styles: cellStyle({ minCellHeight: NAME_HEIGHT }),
    });
  });

  doc.autoTable({
    startY: currentY,
    head: [head],
    body: [signRow, nameRow],
    theme: "grid",
    margin: { left: left, right: MARGIN_RIGHT },
    tableWidth: tableWidth,
    styles: { lineColor: LINE_COLOR, lineWidth: 0.1 },
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
          BOX_WIDTH - 2,
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
