const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSet.js");
const Pattern_NHK = require("./PatternComponent/Pattern_NHK.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
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
    // set up new language
    //console.log(doc.getFontList());
    /*doc.addFileToVFS("THSarabun-normal.ttf", THSarabunNew);
    doc.addFont("THSarabun-normal.ttf", "THSarabun", "normal");
    doc.addFileToVFS('THSarabun Italic-italic.ttf', THSarabunNewl);
    doc.addFont('THSarabun Italic-italic.ttf', 'THSarabun Italic', 'italic');
    doc.addFileToVFS('THSarabun Bold-bold.ttf', THSarabunNewb);
    doc.addFont('THSarabun Bold-bold.ttf', 'THSarabun Bold', 'bold');
    doc.addFileToVFS('THSarabun Bold Italic-italic.ttf', THSarabunNewbll);
    doc.addFont('THSarabun Bold Italic-italic.ttf', 'THSarabun Italic', 'italic'); */
    //finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont("THSarabun");
    console.log("2");
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

    //Set Zinc
    buffDoc = await Pattern_NHK.ZincNoPic(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Zinc16Pic
    buffDoc = await Pattern_NHK.ZincSet16Pic(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Comment
    buffDoc = await Pattern_MainC.CommentSet(dataReport, doc, currentY);
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

exports.CreatePDFSta = async (dataReport) => {
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;
    // set up new language
    //console.log(doc.getFontList());
    /*doc.addFileToVFS("THSarabun-normal.ttf", THSarabunNew);
    doc.addFont("THSarabun-normal.ttf", "THSarabun", "normal");
    doc.addFileToVFS('THSarabun Italic-italic.ttf', THSarabunNewl);
    doc.addFont('THSarabun Italic-italic.ttf', 'THSarabun Italic', 'italic');
    doc.addFileToVFS('THSarabun Bold-bold.ttf', THSarabunNewb);
    doc.addFont('THSarabun Bold-bold.ttf', 'THSarabun Bold', 'bold');
    doc.addFileToVFS('THSarabun Bold Italic-italic.ttf', THSarabunNewbll);
    doc.addFont('THSarabun Bold Italic-italic.ttf', 'THSarabun Italic', 'italic'); */
    //finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont("THSarabun");
    console.log("2");
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

    //Set Zinc
    buffDoc = await Pattern_NHK.ZincNoPic(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Zinc16Pic
    buffDoc = await Pattern_NHK.ZincSet3Pic(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Comment
    buffDoc = await Pattern_MainC.CommentSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

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
