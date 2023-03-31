const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSetTH.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSetTH.js");
const Pattern_TSMI = require("./PatternComponent/Pattern_TSMI.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSetTH.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const fs = require("fs");
/* const THSarabunNew = require("../../../../asset/THSarabun-normal.js");
const THSarabunNewl = require("../../../../asset/THSarabun Italic-italic.js");
const THSarabunNewb = require("../../../../asset/THSarabun Bold-bold.js");
const THSarabunNewll = require("../../../../asset/THSarabun Bold Italic-italic.js"); */

exports.CreatePDF = async (dataReport) => {
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    console.log("2");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSetTH(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //SignSet
    buffDoc = await Pattern_MainH.SignSetTH(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //Data Set
    buffDoc = await Pattern_MainD.DataSetTH(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Pic
    buffDoc = await Pattern_TSMI.DataSetTSMI(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
 
    //Set Comment
    buffDoc = await Pattern_MainC.CommentSetTH(dataReport, doc, currentY);
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

    //console.log(doc.output('datauristring'));
    var bitmap = fs.readFileSync(
      "C:\\AutomationProject\\SAR\\asset_ts\\Report\\KAC\\" +
        dataReport[0].ReqNo +
        ".pdf"
    );
    // convert binary data to base64 encoded string
    //console.log(doc.output());
    //return doc.output();
    //doc.output("dataurlstring", "name");
    return bitmap.toString("base64");
  } catch (err) {
    console.log(err);
    return err;
  }
};
