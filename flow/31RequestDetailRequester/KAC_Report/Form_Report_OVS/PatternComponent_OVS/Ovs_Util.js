// -------------------------------------------------------------------------
// ตัวช่วยที่ทุก pattern ของระบบ OVS ใช้ร่วมกัน
// แยกจาก Form_Report ของ SAR เดิมทั้งหมด เพื่อไม่ให้แก้ฝั่ง OVS แล้วกระทบของเดิม
// -------------------------------------------------------------------------

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function safe(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

// วันที่ในรายงาน OVS เขียนเป็น "18 September 2025"
// ค่าที่อ่านจาก DB เป็น datetime UTC จึงต้องอ่านด้วย getUTC* ไม่งั้นวันจะเพี้ยนไป 1 วัน
function toLongDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";
  return (
    date.getUTCDate() + " " + MONTHS[date.getUTCMonth()] + " " + date.getUTCFullYear()
  );
}

// ตัดวงเล็บและข้อความในวงเล็บออก ใช้ตอนเขียน comment
// "F.A. (pt.)" -> "F.A."   "Zn Content (g/L)" -> "Zn Content"
function stripParentheses(name) {
  return safe(name).replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

// คืนค่าเป็นตัวเลขเฉพาะเมื่อแปลงได้ทั้งสตริง
function asNumber(value) {
  const text = safe(value);
  if (text === "") return null;
  const num = Number(text);
  return isNaN(num) ? null : num;
}

// ผลที่ไม่ได้เป็นค่าวัดจริง ให้ถือว่ายังไม่มีผล
const NOT_A_RESULT = [
  "DELIVERY ERROR",
  "INSTRUMENT BREAKDOWN",
  "ANALYSIS ERROR",
  "SAMPLE ERROR",
  "N/A",
  "",
  "-",
];

function hasResult(value) {
  return NOT_A_RESULT.indexOf(safe(value).toUpperCase()) === -1;
}

// ช่อง Reference ใช้ค่า ControlRange ตรง ๆ
// ยกเว้นรูปแบบสัญลักษณ์ที่ในรายงานเขียนเป็นคำ (">7" -> "more than 7")
function toReferenceText(controlRange) {
  const text = safe(controlRange);
  if (text === "" || text === "-") return "--";
  const more = text.match(/^>=?\s*(.+)$/);
  if (more) return "more than " + more[1].trim();
  const less = text.match(/^<=?\s*(.+)$/);
  if (less) return "less than " + less[1].trim();
  return text;
}

// ช่อง Specifications ของหน้า performance ในแบบฟอร์มเขียน "--" เมื่อไม่ได้คุมค่า
function toSpecText(controlRange) {
  const text = safe(controlRange);
  if (text === "" || text === "-") return "--";
  return text;
}

// ตัดเกรดผลเทียบกับ std ของแถวนั้น
// คืน "Passed" / "Lower" / "Higher" ตามคำที่ใช้ในแบบฟอร์ม OVS
// ถ้ายังไม่มีผล หรือไม่ได้คุมค่าไว้ คืนค่าว่าง
function evaluate(row) {
  if (!hasResult(row.Result)) return "";
  const num = asNumber(row.Result);
  if (num === null) return "";

  const symbol = safe(row.StdSymbol);
  const min = asNumber(row.StdMin);
  const max = asNumber(row.StdMax);

  // ">7" คุมเฉพาะขอบล่าง , "<300" คุมเฉพาะขอบบน
  if (symbol === ">" || symbol === ">=") {
    if (min === null) return "";
    return num < min ? "Lower" : "Passed";
  }
  if (symbol === "<" || symbol === "<=") {
    if (max === null) return "";
    return num > max ? "Higher" : "Passed";
  }

  if (min === null && max === null) return "";
  if (min !== null && num < min) return "Lower";
  if (max !== null && num > max) return "Higher";
  return "Passed";
}

// comment ของหน้า quality of solution สร้างจากรายการที่หลุด spec
//   1 รายการ  : "A content is out of control range"
//   หลายรายการ : "A, B, and C contents are out of control range"
function buildOutOfRangeComment(items) {
  const names = [];
  items.forEach((item) => {
    if (item.Evaluation === "Lower" || item.Evaluation === "Higher") {
      const name = stripParentheses(item.ItemReportName);
      if (name !== "" && names.indexOf(name) === -1) names.push(name);
    }
  });
  if (names.length === 0) return "-";
  if (names.length === 1) return names[0] + " content is out of control range";
  const last = names[names.length - 1];
  const head = names.slice(0, names.length - 1).join(", ");
  return head + ", and " + last + " contents are out of control range";
}

// ชื่อผู้เซ็นใน DB เก็บเป็นตัวพิมพ์ใหญ่ทั้งหมด (K.CHAIYAPHOT)
// แต่ในรายงานเขียนเป็น K.Chaiyaphot
function toSignName(name) {
  const text = safe(name);
  if (text === "") return "";
  return text
    .toLowerCase()
    .replace(/(^|[.\s-])([a-z])/g, (all, sep, ch) => sep + ch.toUpperCase());
}

// ป้ายหน้าช่องเซ็น : คนแรกเป็นคนออก คนสุดท้ายเป็นคนอนุมัติ ที่เหลือเป็นคนตรวจ
function signLabel(index, total) {
  if (index === 0) return "Issued by:";
  if (index === total - 1) return "Approved by:";
  return "Checked by:";
}

module.exports = {
  safe,
  toLongDate,
  stripParentheses,
  asNumber,
  hasResult,
  toReferenceText,
  toSpecText,
  evaluate,
  buildOutOfRangeComment,
  toSignName,
  signLabel,
};
