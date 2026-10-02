const fs = require("fs");
const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const header = require("./PatternComponent_OVS/Ovs_Header.js");
const signature = require("./PatternComponent_OVS/Ovs_Signature.js");
const util = require("./PatternComponent_OVS/Ovs_Util.js");

// -------------------------------------------------------------------------
// VPH-TMV-FRAME LINE : PERFORMANCE OF PHOSPHATE COATING (กระดาษ A3 แนวนอน)
//
// บล็อกข้อมูลเหนือตาราง (ชิดซ้าย)
//   Customer Name  = ข้อความตายตัว "TMV-FRAME LINE"
//   Material Type  = ProcessReportName
//   Sampling Date  = SamplingDate (เขียนแบบ "November 4th, 2025")
//   Chemical Name  = SampleName
// ตาราง : ตำแหน่ง B - L ตายตัว ตำแหน่งที่ n ใช้ข้อมูลของ SampleNo n (B = 1, C = 2, ...)
//   1 บล็อก = 3 ตำแหน่ง , 1 ตำแหน่ง = คอลัมน์ Outer / Inner
//   แถวรูป SEM 2 แถว (x200 / x1500) = รูปจากพาธในผลของ sample นั้นที่ Position ตรงกัน
//   แถว Coating weight            = ผล "Zn Cwt." ของ sample นั้นที่ Position ตรงกัน
// หน้าละ 2 บล็อก หัวกระดาษ + บล็อกข้อมูลซ้ำทุกหน้า
// remark อยู่ใต้ตารางสุดท้ายของทุกหน้า ช่องเซ็นอยู่มุมล่างขวาของหน้าสุดท้าย (ข้างบล็อกสุดท้าย)
// -------------------------------------------------------------------------

const PAGE_TITLE = "PERFORMANCE OF PHOSPHATE COATING";

const CUSTOMER_NAME = "TMV-FRAME LINE";
// ช่องซ้ายสุดของตาราง เขียนตามแบบฟอร์ม
const CUSTOMER_CELL = "TMV-Frame line";
// หัวช่องซ้ายสุด : บล็อกแรกของหน้าเขียน Customer Name บล็อกถัดไปเขียน Sample ตามแบบฟอร์ม
const FIRST_BLOCK_HEAD = "Customer Name";
const NEXT_BLOCK_HEAD = "Sample";

// ตำแหน่งตายตัวตามแบบฟอร์ม index 0 = SampleNo 1
const POSITIONS = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const POSITIONS_PER_BLOCK = 3;

// ค่าในคอลัมน์ Position ของ Routine_RequestLab (บางแถวมีช่องว่างต่อท้าย จึงเทียบหลัง trim)
const SIDES = [
  { label: "Outer", position: "Outer" },
  { label: "Inner", position: "Inner" },
];

// แถวรูปของแต่ละด้าน แยกด้วย ItemReportName ("SEM Picture x200, 20 Kv")
// ถ้าชื่อไม่บอกกำลังขยาย ใช้ลำดับ ReportOrder แทน
const LOCATIONS = [
  { label: "SEM 20kV x200", match: /x\s*200(?!\d)/i },
  { label: "SEM 20kV x1500", match: /x\s*1500/i },
];

const CWT_ITEM_NAME = "Zn Cwt.";

// remark ท้ายรายงานเป็นข้อความตายตัวตามแบบฟอร์ม
const REMARK_TEXT =
  "Remark: Calibration curve of Cwt. on SPCC is in range of 0.000-3.766 g/m2";

// ช่องเซ็นใช้กรอบชุดเดิม เปลี่ยนแค่หัวกรอบตามแบบฟอร์มนี้
// กรอบแคบกว่าค่าเริ่มต้น เพื่อให้วางข้างบล็อกสุดท้าย (2 ตำแหน่ง) ได้โดยไม่ทับตาราง
const SIGN_LABELS = ["Issued by:", "Checked by:", "Review by:", "Approved by:"];
const SIGN_OPTIONS = { boxWidth: 26 };

// รูปผล SEM อยู่ที่เดียวกับ pattern AKZ (ค่าในผลเป็นพาธต่อจากโฟลเดอร์นี้)
const PIC_BASE = "C:\\AutomationProject\\SAR\\asset\\";

const HEAD_FILL = [141, 180, 226];
const FONT_SIZE = 9;
const CELL_PADDING = 0.8;
const PIC_PADDING = 0.4; // ขอบขาวรอบรูปในช่อง

const COL_CUSTOMER = 28;
const COL_LOCATION = 28;
const HEAD_ROW_HEIGHT = 5.5;
const CWT_ROW_HEIGHT = 6;

const TITLE_GAP = 4; // TEST REPORT -> กรอบหัวข้อ
const INFO_GAP = 5; // กรอบหัวข้อ -> บล็อกข้อมูล
const INFO_TABLE_GAP = 3.5; // บล็อกข้อมูล -> ตาราง
const INFO_FONT_SIZE = 11;
const INFO_LINE_HEIGHT = 5.3;
const INFO_ASCENT = 2.8;
const INFO_DESCENT = 1;
const TABLE_BOTTOM = 273; // ตารางห้ามเลยขอบนี้ (ต้องเหลือที่ให้ remark , เลข form อยู่ที่ 287)
const REMARK_GAP = 6; // ขอบล่างตารางสุดท้าย -> baseline ของ remark
const SIGN_GAP = 4; // ระยะห่างขั้นต่ำระหว่างช่องเซ็นกับตาราง

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function newDoc() {
  return new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
}

// ผลที่วิเคราะห์ไม่ได้ แสดงเป็น N/D เหมือน NPI
function resultText(value) {
  const text = util.safe(value);
  if (text.toUpperCase() === "CAN NOT ANALYSIS") return "N/D";
  return text;
}

function samePosition(value, position) {
  return util.safe(value).toLowerCase() === position.toLowerCase();
}

// รวม sample ทุก tank ไว้ในที่เดียว ใช้ SampleNo เป็น key
function collectSamples(report) {
  const map = {};
  report.tanks.forEach((tank) => {
    tank.solutions.concat(tank.performances).forEach((sample) => {
      const found = map[sample.sampleNo];
      if (!found) {
        map[sample.sampleNo] = {
          ...sample,
          items: sample.items.slice(),
          pictures: (sample.pictures || []).slice(),
        };
        return;
      }
      found.items = found.items.concat(sample.items);
      found.pictures = found.pictures.concat(sample.pictures || []);
    });
  });
  return map;
}

// ค่าระดับรายงานหยิบจาก sample แรกที่มีค่า (เรียงตาม SampleNo)
function firstValue(samples, field) {
  const list = Object.keys(samples)
    .map((key) => samples[key])
    .sort((a, b) => a.sampleNo - b.sampleNo);
  for (let i = 0; i < list.length; i++) {
    const value = util.safe(list[i][field]);
    if (value !== "") return value;
  }
  return "";
}

// ผล Zn Cwt. ของด้านนั้น
function findCwt(sample, side) {
  if (!sample) return "";
  const wanted = CWT_ITEM_NAME.toLowerCase();
  const found = sample.items.filter(
    (item) =>
      util.safe(item.ItemName).toLowerCase() === wanted &&
      samePosition(item.Position, side.position)
  );
  const filled = found.find((item) => util.safe(item.Result) !== "");
  return filled ? resultText(filled.Result) : "";
}

// พาธรูปของด้านนั้น เรียงตามแถว LOCATIONS
function findPictures(sample, side) {
  const slots = LOCATIONS.map(() => "");
  if (!sample) return slots;
  const list = sample.pictures
    .filter((picture) => samePosition(picture.Position, side.position))
    .sort((a, b) => a.ReportOrder - b.ReportOrder);

  const leftover = [];
  list.forEach((picture) => {
    const index = LOCATIONS.findIndex((location) =>
      location.match.test(util.safe(picture.itemReportName))
    );
    if (index !== -1 && slots[index] === "") {
      slots[index] = util.safe(picture.path);
    } else {
      leftover.push(util.safe(picture.path));
    }
  });
  // ชื่อรายการไม่บอกกำลังขยาย : ลงช่องที่ยังว่างตามลำดับ
  slots.forEach((value, index) => {
    if (value === "" && leftover.length > 0) slots[index] = leftover.shift();
  });
  return slots;
}

// 1 ตำแหน่ง = 2 คอลัมน์ (Outer / Inner)
function buildPositions(samples) {
  return POSITIONS.map((letter, index) => {
    const sample = samples[index + 1];
    return {
      letter: letter,
      sides: SIDES.map((side) => ({
        label: side.label,
        pictures: findPictures(sample, side),
        cwt: findCwt(sample, side),
      })),
    };
  });
}

// ---------------------------------------------------------------- ขนาดตาราง
function pictureColumnWidth(doc) {
  const tableWidth =
    doc.internal.pageSize.width - header.MARGIN_LEFT - header.MARGIN_RIGHT;
  const columns = POSITIONS_PER_BLOCK * SIDES.length;
  return (tableWidth - COL_CUSTOMER - COL_LOCATION) / columns;
}

// ความสูงแถวรูป : ให้หน้าละ 2 บล็อกพอดีระหว่างหัวตารางกับ TABLE_BOTTOM
// แต่ไม่สูงเกินสัดส่วนรูป SEM (4:3) ของความกว้างช่อง
function pictureRowHeight(doc, tableTopY) {
  const perBlock = (TABLE_BOTTOM - tableTopY) / 2 - 0.5;
  const fit = (perBlock - HEAD_ROW_HEIGHT * 2 - CWT_ROW_HEIGHT) / LOCATIONS.length;
  const picWidth = pictureColumnWidth(doc) - PIC_PADDING * 2;
  const natural = picWidth * 0.75 + PIC_PADDING * 2;
  return Math.min(fit, natural);
}

// ---------------------------------------------------------------- หัวกระดาษ
// วันที่แบบ "November 4th, 2025" ตัว th เป็นตัวยก
function ordinalSuffix(day) {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
}

// ค่าจาก DB เป็น datetime UTC จึงอ่านด้วย getUTC* (เหมือน util.toLongDate)
function drawOrdinalDate(doc, value, x, y) {
  if (!value) return;
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return;
  const day = date.getUTCDate();
  const head = MONTHS[date.getUTCMonth()] + " " + day;
  const tail = ", " + date.getUTCFullYear();

  doc.setFont("times", "normal");
  doc.setFontSize(INFO_FONT_SIZE);
  doc.text(head, x, y);
  let cursor = x + doc.getTextWidth(head);

  doc.setFontSize(INFO_FONT_SIZE * 0.62);
  const suffix = ordinalSuffix(day);
  doc.text(suffix, cursor, y - 1.5);
  cursor += doc.getTextWidth(suffix);

  doc.setFontSize(INFO_FONT_SIZE);
  doc.text(tail, cursor, y);
}

// บล็อกข้อมูลชิดซ้าย : ป้ายตัวหนา ค่าเริ่มตรงกันทุกบรรทัด
// รับขอบบน คืนขอบล่าง
function drawInfo(doc, info, topY) {
  const rows = [
    { label: "Customer Name :", value: CUSTOMER_NAME },
    { label: "Material Type :", value: info.material },
    { label: "Sampling Date :", date: info.samplingDate },
    { label: "Chemical Name :", value: info.chemical },
  ];

  doc.setFontSize(INFO_FONT_SIZE);
  doc.setFont("times", "bold");
  let labelWidth = 0;
  rows.forEach((row) => {
    labelWidth = Math.max(labelWidth, doc.getTextWidth(row.label));
  });
  const labelX = header.MARGIN_LEFT + 3;
  const valueX = labelX + labelWidth + 8;

  rows.forEach((row, index) => {
    const y = topY + INFO_ASCENT + index * INFO_LINE_HEIGHT;
    doc.setFont("times", "bold");
    doc.setFontSize(INFO_FONT_SIZE);
    doc.text(row.label, labelX, y);
    if (row.date !== undefined) {
      drawOrdinalDate(doc, row.date, valueX, y);
    } else {
      doc.setFont("times", "normal");
      doc.text(util.safe(row.value), valueX, y);
    }
  });

  return topY + INFO_ASCENT + (rows.length - 1) * INFO_LINE_HEIGHT + INFO_DESCENT;
}

// หัวกระดาษ + กรอบหัวข้อ + บล็อกข้อมูล คืนขอบบนของตาราง
function drawPageHeader(doc, report, info) {
  const testReportY = header.DrawHeaderWide(doc, report);
  const titleBottom = header.DrawPageTitle(doc, PAGE_TITLE, testReportY + TITLE_GAP);
  return drawInfo(doc, info, titleBottom + INFO_GAP) + INFO_TABLE_GAP;
}

// ---------------------------------------------------------------- ตาราง
// ตารางของ 1 บล็อก (ไม่เกิน 3 ตำแหน่ง)
//   | Customer Name | Location       |      B position     | ...
//   |               |                |  Outer   |  Inner   | ...
//   | TMV-Frame line| SEM 20kV x200  |  (รูป)   |  (รูป)   | ...
//   |   (รวมช่อง)    | SEM 20kV x1500 |  (รูป)   |  (รูป)   | ...
//   |               |   (รวมช่อง)     | Coating weight = ...| ...
function buildTableOptions(doc, positions, headLabel, picHeight) {
  const headStyle = { fillColor: HEAD_FILL, fontStyle: "bold", minCellHeight: HEAD_ROW_HEIGHT };
  const head = [
    [
      { content: headLabel, rowSpan: 2, styles: headStyle },
      { content: "Location", rowSpan: 2, styles: headStyle },
    ].concat(
      positions.map((position) => ({
        content: position.letter + " position",
        colSpan: SIDES.length,
        styles: headStyle,
      }))
    ),
    [].concat(
      ...positions.map((position) =>
        position.sides.map((side) => ({ content: side.label, styles: headStyle }))
      )
    ),
  ];

  const sides = [].concat(...positions.map((position) => position.sides));
  const pictureCells = () =>
    sides.map(() => ({ content: "", styles: { minCellHeight: picHeight } }));
  const body = [
    [
      { content: CUSTOMER_CELL, rowSpan: LOCATIONS.length + 1, styles: { fontStyle: "bold" } },
      { content: LOCATIONS[0].label, styles: { fontStyle: "bold" } },
    ].concat(pictureCells()),
    [
      // แถวสุดท้ายของ Location รวมกับแถว Coating weight ตามแบบฟอร์ม
      { content: LOCATIONS[1].label, rowSpan: 2, styles: { fontStyle: "bold" } },
    ].concat(pictureCells()),
    sides.map((side) => ({
      content: "Coating weight = " + (side.cwt === "" ? "-" : side.cwt) + " g/m²",
      styles: { minCellHeight: CWT_ROW_HEIGHT },
    })),
  ];

  const picWidth = pictureColumnWidth(doc);
  const columnStyles = { 0: { cellWidth: COL_CUSTOMER }, 1: { cellWidth: COL_LOCATION } };
  sides.forEach((side, index) => {
    columnStyles[index + 2] = { cellWidth: picWidth };
  });
  const tableWidth = COL_CUSTOMER + COL_LOCATION + picWidth * sides.length;

  return {
    head: head,
    body: body,
    theme: "grid",
    margin: { left: header.MARGIN_LEFT, right: doc.internal.pageSize.width - header.MARGIN_LEFT - tableWidth },
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
    },
    headStyles: { textColor: 0 },
    columnStyles: columnStyles,
    // ข้อมูลไว้ให้ didDrawCell หาพาธรูปของช่อง
    sides: sides,
  };
}

function picturePath(path) {
  const text = util.safe(path);
  if (/^[A-Za-z]:[\\/]/.test(text) || text.indexOf("\\\\") === 0) return text;
  return PIC_BASE + text;
}

// วางรูปให้พอดีช่องโดยคงสัดส่วน จัดกลางช่อง
function drawPicture(doc, path, cell) {
  if (util.safe(path) === "") return;
  try {
    const file = picturePath(path);
    const data = fs.readFileSync(file).toString("base64");
    const format = /\.png$/i.test(file) ? "PNG" : "JPEG";
    const props = doc.getImageProperties("data:image/" + format.toLowerCase() + ";base64," + data);
    const roomWidth = cell.width - PIC_PADDING * 2;
    const roomHeight = cell.height - PIC_PADDING * 2;
    const scale = Math.min(roomWidth / props.width, roomHeight / props.height);
    const width = props.width * scale;
    const height = props.height * scale;
    doc.addImage(
      data,
      format,
      cell.x + (cell.width - width) / 2,
      cell.y + (cell.height - height) / 2,
      width,
      height
    );
  } catch (err) {
    // ไม่มีไฟล์รูปให้ปล่อยช่องว่างไว้ ไม่ต้องทำให้รายงานทั้งใบพัง
    console.log("Pattern_VPH_TMV_FrameLine : อ่านรูป SEM ไม่สำเร็จ " + err.message);
  }
}

function drawTable(doc, tableOptions, startY) {
  const { sides, ...options } = tableOptions;
  doc.autoTable({
    ...options,
    startY: startY,
    didDrawCell: (data) => {
      if (data.section !== "body" || data.row.index >= LOCATIONS.length) return;
      const side = sides[data.column.index - 2];
      if (!side) return;
      drawPicture(doc, side.pictures[data.row.index], data.cell);
    },
  });
  return doc.lastAutoTable.finalY;
}

// วาดตารางลงเอกสารทดลองเพื่อวัดความสูงจริง
function measureHeight(tableOptions) {
  const { sides, ...options } = tableOptions;
  const scratch = newDoc();
  scratch.autoTable({ ...options, startY: 0, margin: { ...options.margin, top: 0 } });
  return scratch.lastAutoTable.finalY;
}

// remark ชิดซ้ายใต้ตารางสุดท้ายของหน้า
function drawRemark(doc, tableBottomY) {
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(REMARK_TEXT, header.MARGIN_LEFT + 3, tableBottomY + REMARK_GAP);
}

// Zn Cwt. อาจถูกกดเพิ่มเป็น item เพิ่มตอนสร้าง request (ReportOrder = 0)
// pattern นี้หาช่องผลจาก ItemName + Position อยู่แล้ว ให้ดึงแถว ReportOrder = 0 มาด้วย
exports.USES_ALL_ITEMS = true;

// -------------------------------------------------------------------------
exports.CreatePDF = async (report) => {
  const doc = newDoc();
  const samples = collectSamples(report);
  if (Object.keys(samples).length === 0) {
    throw new Error("ไม่มีตัวอย่างที่ออกรายงานได้ใน " + report.refNo);
  }

  const info = {
    material: firstValue(samples, "processReportName"),
    chemical: firstValue(samples, "sampleName"),
    samplingDate: report.samplingDate,
  };
  const positions = buildPositions(samples);

  const pageTopY = drawPageHeader(doc, report, info);
  const picHeight = pictureRowHeight(doc, pageTopY);
  let currentY = pageTopY;
  let blockOnPage = 0;
  const newPage = () => {
    doc.addPage();
    drawPageHeader(doc, report, info);
    currentY = pageTopY;
    blockOnPage = 0;
  };

  // บล็อกสุดท้ายที่วาด ใช้หาที่วางช่องเซ็น
  let last = null;
  for (let start = 0; start < positions.length; start += POSITIONS_PER_BLOCK) {
    const chunk = positions.slice(start, start + POSITIONS_PER_BLOCK);
    const headLabel = blockOnPage === 0 ? FIRST_BLOCK_HEAD : NEXT_BLOCK_HEAD;
    let options = buildTableOptions(doc, chunk, headLabel, picHeight);
    if (blockOnPage > 0 && currentY + measureHeight(options) > TABLE_BOTTOM) {
      drawRemark(doc, currentY);
      newPage();
      options = buildTableOptions(doc, chunk, FIRST_BLOCK_HEAD, picHeight);
    }
    const topY = currentY;
    currentY = drawTable(doc, options, currentY);
    last = { topY: topY, bottomY: currentY, right: header.MARGIN_LEFT + options.tableWidth };
    blockOnPage++;
  }

  drawRemark(doc, last.bottomY);

  // ช่องเซ็นมุมล่างขวา : ถ้าบล็อกสุดท้ายไม่เต็มความกว้าง วางข้างบล็อกได้
  // ไม่งั้นต้องอยู่ใต้ตาราง ถ้าที่ไม่พอ DrawSignature จะขึ้นหน้าใหม่ให้เอง
  const pageWidth = doc.internal.pageSize.width;
  const signLeft = pageWidth - header.MARGIN_RIGHT - signature.Width(SIGN_OPTIONS);
  const besideTable = last.right + SIGN_GAP <= signLeft;
  let usedY = besideTable ? last.topY : last.bottomY + SIGN_GAP;
  if (usedY > signature.TopY(doc, report.signers, SIGN_LABELS, SIGN_OPTIONS)) {
    newPage();
    usedY = pageTopY;
  }
  signature.DrawSignature(doc, report.signers, usedY, SIGN_LABELS, SIGN_OPTIONS);
  header.DrawFormCode(doc);

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
};
