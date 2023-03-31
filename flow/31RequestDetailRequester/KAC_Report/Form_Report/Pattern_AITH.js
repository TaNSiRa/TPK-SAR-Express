const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSet.js");
const Pattern_AITH = require("./PatternComponent/Pattern_AITH.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const fs = require("fs");

exports.CreatePDF = async (dataReport) => {
  console.log("AITH");
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
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

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Coating Performance",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.1,
              maxCellHeight: 12,
              cellWidth: 50,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY;

    //Set Pic'
    var i = 0;
    var indexStart = 0;
    for (i; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder == 101) {
        indexStart = i;
        break;
      }
    }

    //ctw1
    buffDoc = await Pattern_AITH.CTWSet(dataReport, doc, indexStart, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    currentY = Pattern_Doc.addPage(doc);

    //toc1
    buffDoc = await Pattern_AITH.TOCSet(
      dataReport,
      doc,
      indexStart + 6,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //contact1
    buffDoc = await Pattern_AITH.ContactAng(
      dataReport,
      doc,
      indexStart + 8,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //ctw2
    buffDoc = await Pattern_AITH.CTWSet(
      dataReport,
      doc,
      indexStart + 9,
      currentY
    );

    doc = buffDoc[0];
    currentY = buffDoc[1];
    //toc1
    buffDoc = await Pattern_AITH.TOCSet(
      dataReport,
      doc,
      indexStart + 15,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //contact2
    buffDoc = await Pattern_AITH.ContactAng(
      dataReport,
      doc,
      indexStart + 17,
      currentY
    );
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
