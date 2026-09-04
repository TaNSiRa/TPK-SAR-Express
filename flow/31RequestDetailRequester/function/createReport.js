const createpdf = require("../KAC_Report/Form_Report/Pattern_0Select.js");
const mssql = require("../../../function/mssql.js");
const masterDoc = require("../KAC_Report/Form_Report/PatternComponent/Pattern_5MasterDoc.js");
const masterDocYearly = require("../KAC_Report/Form_Report/PatternComponent/Pattern_1MainHeadSetYear.js");
exports.CreateReport = async (reqNo) => {
  console.log("in CreateReport");
  console.log("CreateReportreqNo: " + reqNo); // Debugging

  // ส่ง reqNo ไปยังไฟล์ Pattern_5MasterDoc.js
  masterDoc.setReqNo(reqNo);
  masterDocYearly.setReqNo(reqNo);

  try {
    var buffDataIn = await mssql.qurey(
      `select * from Routine_KACReport where reqno = '${reqNo}' and reportorder != 0 order by reportorder asc`
    );
    //console.log(dataReport);
    //var dataReport = new ReportData_Structure();
    dataReport = buffDataIn.recordset;
    // console.log(dataReport);
    if (!dataReport || dataReport.length === 0) {
      // ไม่มี record ใน Routine_KACReport (ยังไม่เคยกด create report หรือถูกลบไปแล้ว)
      // ถ้าปล่อยผ่านจะไปตายที่ dataReport[0].PatternReport ซึ่งอ่านไม่ออกว่าเกิดอะไรขึ้น
      throw new Error(
        "ไม่พบข้อมูล report ของ " + reqNo + " ใน Routine_KACReport (ยังไม่ได้สร้าง report หรือถูกลบไปแล้ว)"
      );
    }
    dataReport = await this.ReplaceItemName(dataReport);
    var pdf = await createpdf.SelectPattern(dataReport);
    assertPdfBase64(pdf, reqNo);

    return pdf;
  } catch (error) {
    console.error("[CreateReport] " + reqNo + " : " + errText(error));
    throw error;
  }
};

// ปลายทาง (Flutter) เอาค่าที่ได้ไปเข้า base64Decode ตรง ๆ
// ถ้าปล่อยค่าที่ไม่ใช่ base64 หลุดไป จะกลายเป็น FormatException ที่ฝั่ง client
// ซึ่งบอกไม่ได้เลยว่าพังเพราะอะไร จึงต้องดักให้พังพร้อมเหตุผลตั้งแต่ที่นี่
function assertPdfBase64(pdf, reqNo) {
  if (typeof pdf !== "string" || pdf.length === 0) {
    throw new Error(
      "สร้าง PDF ของ " + reqNo + " ไม่สำเร็จ : " + errText(pdf)
    );
  }
  const head = Buffer.from(pdf.slice(0, 12), "base64").toString("latin1");
  if (!head.startsWith("%PDF")) {
    throw new Error(
      "สร้าง PDF ของ " + reqNo + " ไม่สำเร็จ : ข้อมูลที่ได้ไม่ใช่ไฟล์ PDF (ขึ้นต้นด้วย '" +
        pdf.slice(0, 20) +
        "')"
    );
  }
}

function errText(value) {
  if (value === null || value === undefined) return "no result";
  if (value instanceof Error) return value.message || String(value);
  if (typeof value === "object" && value.message) return String(value.message);
  return String(value);
}

exports.ReplaceItemName = async (dataIn) => {
  // console.log("in");
  for (let i = 0; i < dataIn.length; i++) {
    dataIn[i].ItemReportName = String(dataIn[i].ItemReportName).replace(
      "(mg/m2)",
      "(mg/m²)"
    );
    dataIn[i].ItemReportName = String(dataIn[i].ItemReportName).replace(
      "(g/m2)",
      "(g/m²)"
    );
    dataIn[i].ItemReportName = String(dataIn[i].ItemReportName).replace(
      "(us/",
      "(µS/"
    );
    dataIn[i].ItemReportName = String(dataIn[i].ItemReportName).replace(
      "(uS/",
      "(µS/"
    );
    dataIn[i].ItemReportName = String(dataIn[i].ItemReportName).replace(
      "(oC",
      "(°C"
    );
    dataIn[i].ItemReportName = String(dataIn[i].ItemReportName).replace(
      "(C",
      "(°C"
    );
    dataIn[i].ControlRange = String(dataIn[i].ControlRange).replace(
      "mg/m2",
      "mg/m²"
    );
    // console.log(dataIn[i].ItemReportName);
  }

  return dataIn;
};
/* 
function ReplaceItemName(dataIn) {
  console.log("in");
  for (let i = 0; i < dataIn.length; i++) {
    dataIn[i].ItemReportName = String(dataIn[i].ItemReportName).replace(
      "(g/m2)",
      "(g/m²)"
    );
  }
  return dataIn;
} */
