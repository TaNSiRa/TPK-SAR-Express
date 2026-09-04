const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSet.js");
const Pattern_MainP = require("./PatternComponent/Pattern_3MainPicSet.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const fs = require("fs");

// pattern KOWOO : แยกออกมาจาก ATT (ATSUMITEC) เพื่อให้แก้ของ KOWOO ได้อิสระ
// ต่างจาก ATT สองเรื่อง
//   1. ไม่มีหน้ากราฟ control chart (ATT ผูกกราฟกับตำแหน่งแถวคงที่ซึ่งไม่ตรงกับ KOWOO)
//   2. บล็อก "Quality of PULS film" ใช้หัวตารางชุดเดียวแล้วเอา item ทุกชุดมาต่อกัน
//      (ดู PicSetforKOWOO ใน PatternComponent/Pattern_3MainPicSet.js)
exports.CreatePDF = async (dataReport) => {
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var currentY = 0;
    doc.setFont("THSarabun");

    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //SignSet
    buffDoc = await Pattern_MainH.SignSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //Data Set
    buffDoc = await Pattern_MainD.DataSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Pic
    buffDoc = await Pattern_MainP.PicSetforKOWOO(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Comment
    buffDoc = await Pattern_MainC.CommentSetforATT(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Document Code
    doc = await Pattern_Doc.MasterWeeklyDocument(doc);

    await doc.save(
      "C:\\AutomationProject\\SAR\\asset_ts\\Report\\KAC\\" +
      dataReport[0].ReqNo +
      ".pdf"
    );

    console.log("end SavePDF");

    var bitmap = fs.readFileSync(
      "C:\\AutomationProject\\SAR\\asset_ts\\Report\\KAC\\" +
      dataReport[0].ReqNo +
      ".pdf"
    );
    // convert binary data to base64 encoded string
    return bitmap.toString("base64");
  } catch (err) {
    console.error(
      "[Pattern_KOWOO] สร้างรายงาน " +
      (dataReport && dataReport[0] ? dataReport[0].ReqNo : "(unknown)") +
      " ไม่สำเร็จ :",
      err
    );
    throw err;
  }
};
