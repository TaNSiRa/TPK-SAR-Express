const Pattern_AKZ = require("./Pattern_AKZ.js");
const Pattern_NPI = require("./Pattern_NPI.js");
const Pattern_NPM = require("./Pattern_NPM.js");
const Pattern_PPI_Toyota = require("./Pattern_PPI_Toyota.js");
const Pattern_PPI_Mitsu = require("./Pattern_PPI_Mitsu.js");
const Pattern_PPI_Metal = require("./Pattern_PPI_Metal.js");
const Pattern_PPI_Enkei = require("./Pattern_PPI_Enkei.js");
const Pattern_VPC_MitsubishiVN = require("./Pattern_VPC_MitsubishiVN.js");
const Pattern_VPC_GPMI_SolventPaint = require("./Pattern_VPC_GPMI_SolventPaint.js");
const Pattern_VPC_TayNamSteel = require("./Pattern_VPC_TayNamSteel.js");
const Pattern_VPC_DongA = require("./Pattern_VPC_DongA.js");
const Pattern_VPH_FujitonVN_GL = require("./Pattern_VPH_FujitonVN_GL.js");
const Pattern_VPH_TMV_FrameLine = require("./Pattern_VPH_TMV_FrameLine.js");

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
  NPM: Pattern_NPM,
  // key ต้องเป็นตัวพิมพ์ใหญ่ เพราะเทียบกับ PatternReport ที่ toUpperCase แล้ว
  "PPI - TOYOTA": Pattern_PPI_Toyota,
  "PPI - MITSU": Pattern_PPI_Mitsu,
  "PPI - METAL": Pattern_PPI_Metal,
  "PPI - ENKEI": Pattern_PPI_Enkei,
  "VPC-MITSUBISHI VN": Pattern_VPC_MitsubishiVN,
  "VPC-GPMI SOLVENT PAINT": Pattern_VPC_GPMI_SolventPaint,
  "VPC-TAY NAM STEEL": Pattern_VPC_TayNamSteel,
  "VPC-DONG A": Pattern_VPC_DongA,
  "VPH-FUJITON VN-GL": Pattern_VPH_FujitonVN_GL,
  "VPH-TMV-FRAME LINE": Pattern_VPH_TMV_FrameLine,
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
