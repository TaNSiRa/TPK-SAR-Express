const fs = require("fs");
const util = require("./Ovs_Util.js");

const LOGO_PATH = "C:\\SAR\\asset\\TPK_LOGO.jpg";

// เลข form ที่มุมล่างขวาของทุกหน้าในรายงาน OVS
const FORM_CODE = "FR-CTC-04/005-00-07/07/23";

const MARGIN_LEFT = 18;
const MARGIN_RIGHT = 18;

// ระยะห่างมาตรฐานระหว่างบล็อกต่าง ๆ ของหน้า
// ใช้ค่าเดียวกันทั้งบนและล่างของบล็อก Line Name จะได้ห่างเท่ากัน
const BLOCK_GAP = 7;

// สีพื้นของแถบ Sample ด้านบนตาราง
const SAMPLE_BAR_FILL = [157, 195, 230];

// -------------------------------------------------------------------------
// หัวกระดาษของรายงาน OVS
//
// บล็อกโลโก้ + ชื่อหน่วยงาน วางไว้กลางกระดาษ
// แล้ว TEST REPORT กับบล็อกวันที่ไล่ลงมาข้างล่าง (ห้ามทับกัน)
// ทุก pattern ของ OVS ใช้หัวเดียวกันหมด
// -------------------------------------------------------------------------
exports.DrawHeader = (doc, header) => {
  const pageWidth = doc.internal.pageSize.width;
  let currentY = 14;

  const logoWidth = 26;
  const logoHeight = 13;
  const gap = 6;

  // ชื่อหน่วยงานเป็นตัวหนาทุกบรรทัด
  // บรรทัดชื่อบริษัทใหญ่เท่า TEST REPORT ส่วนสองบรรทัดล่างเล็กกว่า
  const TITLE_SIZE = 14;
  const COMPANY_SIZE = 12.5;
  const lines = [
    { text: "Thai  Parkerizing Co., Ltd.", size: TITLE_SIZE },
    { text: "Oversea Technical Service", size: COMPANY_SIZE },
    { text: "International Business Division", size: COMPANY_SIZE },
  ];

  // วัดความกว้างข้อความก่อน เพื่อหาจุดเริ่มที่ทำให้ทั้งบล็อกอยู่กลางกระดาษ
  doc.setFont("times", "bold");
  let textWidth = 0;
  lines.forEach((line) => {
    doc.setFontSize(line.size);
    textWidth = Math.max(textWidth, doc.getTextWidth(line.text));
  });

  // ข้อความสามบรรทัดจัดกึ่งกลางหน้ากระดาษ (กึ่งกลางเทียบกันเองด้วย ไม่ใช่ชิดซ้าย)
  // โลโก้วางไว้ทางซ้ายของบล็อกข้อความ
  const textCenterX = pageWidth / 2;
  const logoX = textCenterX - textWidth / 2 - gap - logoWidth;

  try {
    const bitmap = fs.readFileSync(LOGO_PATH);
    doc.addImage(bitmap.toString("base64"), "JPG", logoX, currentY, logoWidth, logoHeight);
  } catch (err) {
    // ไม่มีไฟล์โลโก้ไม่ใช่เหตุให้ทั้งรายงานพัง
    console.log("Ovs_Header : อ่านโลโก้ไม่สำเร็จ " + err.message);
  }

  let textY = currentY + 4;
  lines.forEach((line) => {
    doc.setFontSize(line.size);
    doc.text(line.text, textCenterX, textY, { align: "center" });
    textY = textY + 5.4;
  });

  currentY = Math.max(currentY + logoHeight, textY - 5.4) + 11;

  // TEST REPORT ตัวหนา มีเส้นใต้ (jsPDF ไม่มี underline ในตัว ต้องขีดเส้นเอง)
  const title = "TEST REPORT";
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text(title, pageWidth / 2, currentY, { align: "center" });
  const titleWidth = doc.getTextWidth(title);
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(
    pageWidth / 2 - titleWidth / 2,
    currentY + 1.3,
    pageWidth / 2 + titleWidth / 2,
    currentY + 1.3
  );

  // บล็อกวันที่อยู่ใต้ TEST REPORT ชิดฝั่งขวา
  currentY = currentY + 7;
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  // ค่าอยู่ที่เดิม ส่วนหัวข้อเริ่มตรงกันทั้งสามบรรทัด
  // จุดเริ่มคำนวณถอยจากค่า โดยยึดหัวข้อที่ยาวสุด จะได้ชิดค่ามากที่สุดโดยไม่ทับ
  const valueX = 157;
  const rows = [
    ["Received date:", util.toLongDate(header.receiveDate)],
    ["Reporting date:", util.toLongDate(header.reportingDate)],
    ["Ref. No.:", util.safe(header.refNo)],
  ];
  let labelWidth = 0;
  rows.forEach((row) => {
    labelWidth = Math.max(labelWidth, doc.getTextWidth(row[0]));
  });
  const labelX = valueX - labelWidth - 3;

  const dateLineHeight = 5.8;
  rows.forEach((row, index) => {
    const y = currentY + index * dateLineHeight;
    doc.text(row[0], labelX, y);
    doc.text(row[1], valueX, y);
  });
  currentY = currentY + (rows.length - 1) * dateLineHeight;

  return currentY + 8;
};

// หัวข้อของหน้า เช่น QUALITY OF SOLUTION / PERFORMANCE OF PHOSPHATE COATING
// ตีกรอบสี่เหลี่ยมรอบข้อความ
exports.DrawPageTitle = (doc, title, currentY) => {
  const pageWidth = doc.internal.pageSize.width;
  doc.setFont("times", "bold");
  doc.setFontSize(13);

  const textWidth = doc.getTextWidth(title);
  const padX = 6;
  const boxWidth = textWidth + padX * 2;
  const boxHeight = 9;
  const boxX = (pageWidth - boxWidth) / 2;

  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.rect(boxX, currentY, boxWidth, boxHeight);
  doc.text(title, pageWidth / 2, currentY + boxHeight / 2 + 1.6, {
    align: "center",
  });

  // คืนขอบล่างของกรอบ ผู้เรียกเป็นคนบวกระยะห่างเอง จะได้คุมให้เท่ากันทั้งบนล่าง
  return currentY + boxHeight;
};

// บล็อก Line Name / Sampling Date วางกลางกระดาษ
// รับ topY เป็นขอบบนของบล็อก และคืนขอบล่าง (ไม่ใช่ baseline)
// เพื่อให้ผู้เรียกบวกระยะห่างบนและล่างด้วยค่าเดียวกันได้ตรง ๆ
exports.DrawSampleInfo = (doc, info, topY) => {
  const centerX = doc.internal.pageSize.width / 2;
  doc.setFontSize(11);

  // จัดกลางโดยยึดทั้งบรรทัด (ป้าย + ค่า) เป็นก้อนเดียว
  const rows = [
    { label: "Line Name", value: util.safe(info.lineName) },
    { label: "Sampling Date", value: util.toLongDate(info.samplingDate) },
  ];

  // ป้ายเป็นตัวหนา ค่าเป็นตัวปกติ จึงต้องวัดความกว้างคนละฟอนต์
  // ให้ ":" ของทั้งสองบรรทัดตรงกัน จึงต้องรู้ความกว้างป้ายที่ยาวสุดก่อน
  const gapBeforeColon = 8;
  const gapAfterColon = 12;
  doc.setFont("times", "bold");
  let labelWidth = 0;
  rows.forEach((row) => {
    labelWidth = Math.max(labelWidth, doc.getTextWidth(row.label));
  });
  const colonWidth = doc.getTextWidth(":");

  doc.setFont("times", "normal");
  let valueWidth = 0;
  rows.forEach((row) => {
    valueWidth = Math.max(valueWidth, doc.getTextWidth(row.value));
  });

  const blockWidth =
    labelWidth + gapBeforeColon + colonWidth + gapAfterColon + valueWidth;
  const startX = centerX - blockWidth / 2;
  const colonX = startX + labelWidth + gapBeforeColon;
  const valueX = colonX + colonWidth + gapAfterColon;

  // แปลงระหว่างขอบบล็อกกับ baseline โดยยึด "ขอบหมึกจริง" ไม่ใช่ขอบกล่องฟอนต์
  // ascent = ความสูงตัวใหญ่ , descent = หางตัว p/g ของ Times 11pt
  // วัดจาก PDF ที่ render ออกมาจริง เพื่อให้ช่องว่างบน-ล่างของบล็อกเท่ากันพอดี
  const ascent = 2.6;
  const descent = 0.9;
  const lineHeight = 6;

  rows.forEach((row, index) => {
    const y = topY + ascent + index * lineHeight;
    doc.setFont("times", "bold");
    doc.text(row.label, startX, y);
    doc.text(":", colonX, y);
    doc.setFont("times", "normal");
    doc.text(row.value, valueX, y);
  });

  return topY + ascent + (rows.length - 1) * lineHeight + descent;
};

// แถบบนสุดของตาราง : ช่อง "Sample" แยกจากช่อง "Process & Product Name"
// วาดเป็นตารางของตัวเองที่ margin เดียวกับตารางหลัก เส้นขอบจะต่อกันเป็นกรอบเดียว
exports.DrawSampleBar = (doc, sampleName, currentY) => {
  doc.autoTable({
    startY: currentY,
    body: [
      [
        "Sample",
        "Process & Product Name:   " + util.safe(sampleName),
      ],
    ],
    theme: "grid",
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "times",
      fontSize: 11,
      textColor: 0,
      fillColor: SAMPLE_BAR_FILL,
      lineColor: 0,
      lineWidth: 0.1,
      cellPadding: 1.5,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 26 },
    },
  });
  return doc.lastAutoTable.finalY;
};

// แถว Comment เป็นแถวล่างสุดของตาราง กินเต็มความกว้าง
// วาดเป็นตารางของตัวเองที่ margin เดียวกัน เส้นขอบจะต่อกับตารางด้านบนเป็นกรอบเดียว
exports.DrawCommentRow = (doc, comment, currentY) => {
  doc.autoTable({
    startY: currentY,
    body: [["Comment :   " + util.safe(comment)]],
    theme: "grid",
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "times",
      fontSize: 11,
      textColor: 0,
      lineColor: 0,
      lineWidth: 0.1,
      cellPadding: 1.5,
      valign: "middle",
    },
  });
  return doc.lastAutoTable.finalY;
};

// เลข form มุมล่างขวา ต้องเรียกหลังสร้างครบทุกหน้าแล้ว
exports.DrawFormCode = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.text(FORM_CODE, pageWidth - MARGIN_RIGHT, pageHeight - 10, {
      align: "right",
    });
  }
  return doc;
};

exports.FORM_CODE = FORM_CODE;
exports.BLOCK_GAP = BLOCK_GAP;
exports.MARGIN_LEFT = MARGIN_LEFT;
exports.MARGIN_RIGHT = MARGIN_RIGHT;
