const Pattern_AKZ = require("./Pattern_AKZ.js");
const Pattern_NPI = require("./Pattern_NPI.js");

// -------------------------------------------------------------------------
// ตัวเลือก pattern ของระบบ OVS
//
// PatternReport มาจาก Routine_MasterPatternTS ของลูกค้า (Routine_RequestLab
// ไม่มีคอลัมน์นี้) ถ้ายังไม่ได้ทำ pattern ของ OVS ไว้ จะคืน null เพื่อให้ฝั่ง
// ที่เรียกไปใช้ report ของ SAR เดิมแทน จะได้ไม่พังระหว่างที่ยังทำไม่ครบ
//
// เพิ่ม pattern ใหม่ : สร้าง Pattern_<ชื่อ>.js ในโฟลเดอร์นี้ แล้วลงทะเบียนที่ PATTERNS
// -------------------------------------------------------------------------
const PATTERNS = {
  AKZ: Pattern_AKZ,
  NPI: Pattern_NPI,
};

exports.HasPattern = (patternReport) => {
  const key = String(patternReport || "").trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(PATTERNS, key);
};

// pattern ที่ต้องการแถว ReportOrder = 0 ด้วย (item ที่กดเพิ่มตอนสร้าง request)
exports.UsesAllItems = (patternReport) => {
  const key = String(patternReport || "").trim().toUpperCase();
  const pattern = PATTERNS[key];
  return !!(pattern && pattern.USES_ALL_ITEMS === true);
};

exports.SelectPattern = async (report) => {
  const key = String(report.patternReport || "").trim().toUpperCase();
  const pattern = PATTERNS[key];
  if (!pattern) {
    throw new Error("ยังไม่มี pattern ของ OVS สำหรับ '" + key + "'");
  }

  const pdf = await pattern.CreatePDF(report);
  if (typeof pdf !== "string" || pdf.length === 0) {
    throw new Error(
      "pattern OVS '" + key + "' ไม่ได้คืนค่าเป็น base64 (ได้ " + typeof pdf + ")"
    );
  }
  return pdf;
};

exports.ListPatterns = () => Object.keys(PATTERNS);
