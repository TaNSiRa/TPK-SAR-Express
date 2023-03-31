const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_SCI = require("./PatternComponent/Pattern_SCI.js");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSetTH.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const fs = require("fs");

exports.CreatePDF = async (dataReport) => {
  console.log("SCI");
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_SCI.HeaderSetTH(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    //currentY = currentY - 10;
    buffDoc = await Pattern_SCI.DataSetTH(dataReport, doc, currentY,3);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    
    //SignSet
    currentY = currentY + 10;
    buffDoc = await Pattern_MainH.SignSetTH(dataReport, doc, currentY);
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

exports.CreatePDFW = async (dataReport) => {
  console.log("SCI");
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_SCI.HeaderSetTH(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    //currentY = currentY - 10;
    buffDoc = await Pattern_SCI.DataSetTH(dataReport, doc, currentY,2);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    
    //SignSet
    currentY = currentY + 10;
    buffDoc = await Pattern_MainH.SignSetTH(dataReport, doc, currentY);
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

exports.CreatePDFFFS = async (dataReport) => {
  console.log("SCI");
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_SCI.HeaderSetTH(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    //currentY = currentY - 10;
    buffDoc = await Pattern_SCI.DataSetTHFFS(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    
    //SignSet
    currentY = currentY + 10;
    buffDoc = await Pattern_MainH.SignSetTH(dataReport, doc, currentY);
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
