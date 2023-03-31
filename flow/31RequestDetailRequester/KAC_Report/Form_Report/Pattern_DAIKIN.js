const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_DAIKIN = require("./PatternComponent/Pattern_DAIKIN.js");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSetTH.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const fs = require("fs");

exports.CreatePDF = async (dataReport) => {
  console.log("DAIKIN");
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_DAIKIN.HeaderSetTH(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    //currentY = currentY - 10;
    buffDoc = await Pattern_DAIKIN.DataSetTH(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    /* var i = 0;
    var startIndex = 0;
    var endIndex = 0;
    for (i; i < dataReport.length; i++) {
      if (i + 1 < dataReport.length)
        if (dataReport[i].ReportOrder % 20 == 1) {
          startIndex = i;
        } else if (dataReport[i + 1].ReportOrder % 20 == 1) {
          endIndex = i;
          buffDoc = await Pattern_DAIKIN.DataSetTH(
            dataReport,
            startIndex,
            endIndex,
            doc,
            currentY
          );
          doc = buffDoc[0];
          currentY = buffDoc[1];
          currentY = Pattern_Doc.addPage(doc);
        } else {
          buffDoc = await Pattern_DAIKIN.DataSetTH(
            dataReport,
            startIndex,
            endIndex,
            doc,
            currentY
          );
          doc = buffDoc[0];
          currentY = buffDoc[1];
        }
    } */
    //SignSet

    if (currentY > 225) {
      currentY = await Pattern_Doc.addPage(doc);
    }

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
  console.log("DAIKIN");
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_DAIKIN.HeaderSetTH(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    //currentY = currentY - 10;
    buffDoc = await Pattern_DAIKIN.DataSetTHFFS(dataReport, doc, currentY);
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
