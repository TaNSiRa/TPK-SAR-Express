const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSetTH.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSetTH.js");
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
    buffDoc = await DataSetSTIC(dataReport, doc, currentY);
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

async function DataSetSTIC(dataReport, doc, currentY) {
  try {
    console.log("DataSetSTIC");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "น้ำหนักผลึกและผลการเคลือบ",
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
              cellWidth: 40,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    var dataInTable = [
      [
        {
          content:
            "น้ำหนักการเคลือบของฟิล์มฟอสเฟต \n" +
            dataReport[dataReport.length - 2].ProcessReportName,
        },
        {
          content:
            dataReport[dataReport.length - 2].ResultReport +
            "        กรัมต่อตารางเมตร",
        },
      ],
      [
        {
          content:
            "น้ำหนักการเคลือบของฟิล์มฟอสเฟต \n" +
            dataReport[dataReport.length - 1].ProcessReportName,
        },
        {
          content:
            dataReport[dataReport.length - 1].ResultReport +
            "        กรัมต่อตารางเมตร",
        },
      ],
    ];

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,

      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 13,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 70, fillColor: [211, 239, 240] },
      },
      willDrawCell: function (data) {
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[data.row.index].Evaluation == "ต่ำ" ||
            dataReport[data.row.index].Evaluation == "สูง" ||
            dataReport[data.row.index].Evaluation == "ไม่ผ่าน"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
        if (data.column.index === 4 && data.section === "body") {
          if (
            data.cell.raw == "ต่ำ" ||
            data.cell.raw == "สูง" ||
            data.cell.raw == "ไม่ผ่าน"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
      },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}
