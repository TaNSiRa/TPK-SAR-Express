const createpdf = require("../KAC_Report/Form_Report/Pattern_0Select.js");
const mssql = require("../../../function/mssql.js");
const masterDoc = require("C:/Users/auto/Desktop/Express/flow/31RequestDetailRequester/KAC_Report/Form_Report/PatternComponent/Pattern_5MasterDoc.js");
const masterDocYearly = require("C:/Users/auto/Desktop/Express/flow/31RequestDetailRequester/KAC_Report/Form_Report/PatternComponent/Pattern_1MainHeadSetYear.js");
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
    dataReport = await this.ReplaceItemName(dataReport);
    var pdf = await createpdf.SelectPattern(dataReport);

    return pdf;
  } catch (error) {
    console.log(error);
    //res.json(error);
    return "ERROR";
  }
};

exports.ReplaceItemName = async (dataIn) => {
  //console.log("in");
  for (let i = 0; i < dataIn.length; i++) {
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
    //console.log(dataIn[i].ItemReportName);
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
