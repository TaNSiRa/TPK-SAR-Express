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
    console.log("BFC");
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
    buffDoc = await DataSetBFC(dataReport, doc, currentY);
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

async function DataSetBFC(dataReport, doc, currentY) {
  try {
    console.log("DataSetBFC");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "การตรวจสอบตัวอย่างลวด",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.1,
              maxCellHeight: 12,
              cellWidth: 35,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "    1. ชิ้นงานหลังเคลือบฟอสเฟต",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.4,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });
    currentY = await doc.lastAutoTable.finalY;
    var startIndex = 0;

    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 101) {
        startIndex = i;
        break;
      }
    }
    var dataInHead = [
      [
        { colSpan: 2, content: "ชิ้นงานหลังเคลือบฟอสเฟต" },
        "น้ำหนักการเคลือบ (กรัม ต่อ ตร.ม.)",
      ],
    ];
    var dataInTable = [
      [
        {
          rowSpan: 3,
          content: "ขนาดลวด",
        },

        dataReport[startIndex].ProcessReportName,

        dataReport[startIndex].ResultReport,
      ],
      [
        dataReport[startIndex + 1].ProcessReportName,

        dataReport[startIndex + 1].ResultReport,
      ],
      [
        dataReport[startIndex + 2].ProcessReportName,

        dataReport[startIndex + 2].ResultReport,
      ],
    ];

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: dataInHead,
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 15,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
      },
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
        0: { fillColor: [211, 239, 240] },
      },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    startIndex = startIndex + 3;

    currentY = Pattern_Doc.addPage(doc);

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "    2. ชิ้นงานหลังเคลือบสบู่",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.4,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;

    dataInHead = [
      [{ colSpan: 3, content: "ชิ้นงานหลังเคลือบสบู่" }, "ค่าที่ตรวจสอบได้"],
    ];
    dataInTable = [
      [
        {
          rowSpan: 9,
          content: "น้ำหนักการเคลือบ\n(กรัม ต่อ ตร.ม.)",
        },
        {
          rowSpan: 3,
          content: dataReport[startIndex].ProcessReportName,
        },
        dataReport[startIndex].ItemReportName,
        dataReport[startIndex].ResultReport,
      ],
      [
        dataReport[startIndex + 1].ItemReportName,
        dataReport[startIndex + 1].ResultReport,
      ],
      [
        dataReport[startIndex + 2].ItemReportName,
        dataReport[startIndex + 2].ResultReport,
      ],
      [
        {
          rowSpan: 3,
          content: dataReport[startIndex + 3].ProcessReportName,
        },
        dataReport[startIndex + 3].ItemReportName,
        dataReport[startIndex + 3].ResultReport,
      ],
      [
        dataReport[startIndex + 4].ItemReportName,
        dataReport[startIndex + 4].ResultReport,
      ],
      [
        dataReport[startIndex + 5].ItemReportName,
        dataReport[startIndex + 5].ResultReport,
      ],
      [
        {
          rowSpan: 3,
          content: dataReport[startIndex + 6].ProcessReportName,
        },
        dataReport[startIndex + 6].ItemReportName,
        dataReport[startIndex + 6].ResultReport,
      ],
      [
        dataReport[startIndex + 7].ItemReportName,
        dataReport[startIndex + 7].ResultReport,
      ],
      [
        dataReport[startIndex + 8].ItemReportName,
        dataReport[startIndex + 8].ResultReport,
      ],
    ];

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: dataInHead,
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 15,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        minCellHeight: 10,
        maxCellHeight: 12,
      },
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
        0: { fillColor: [211, 239, 240] },
      },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    startIndex = startIndex + 3;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}
