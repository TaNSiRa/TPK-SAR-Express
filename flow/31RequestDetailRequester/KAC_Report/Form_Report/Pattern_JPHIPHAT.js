const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSet.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");
const { VarBinary } = require("mssql");

exports.CreatePDF = async (dataReport) => {
  try {
    console.log("JPHIPHAT");
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
    currentY = currentY - 10;
    buffDoc = await Pattern_MainD.DataSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Pic Set Honda
    buffDoc = await PicSetRefHONDA(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Pic Set Toyota
    buffDoc = await PicSetRefTMT(dataReport, doc, currentY);
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

/* PicSetRefHONDA = async (dataReport, doc, currentY) => { */
async function PicSetRefHONDA(dataReport, doc, currentY) {
  try {
    doc.addPage("a4", "landscape");
    currentY = 10;
    var TextSubJect = "SEM and coating weight refer HONDA specification";
    var widthText = doc.getTextWidth(TextSubJect);
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: TextSubJect,
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
              cellWidth: widthText - 8,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    // add position pic
    currentY = doc.lastAutoTable.finalY;
    //find start i set

    var i = 0;
    for (i; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        break;
      }
    }

    var picStartIndex = i;
    var dataInHeader = [];
    dataInHeader = [
      [
        {
          content: "MATERIAL",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
        {
          content: dataReport[i].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
        {
          content: dataReport[i + 1].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
        {
          content: dataReport[i + 2].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
            maxCellHeight: 12,
          },
        },
      ],
    ];
    var dataInTable = [];
    var picSetData = [];
    var picHeight = 50;
    var picWidht = 80;
    var runningPic = 0;

    //SET PIC Report order 101 102 103

    dataInTable.push([
      {
        content: dataReport[picStartIndex].ItemReportName,
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
    ]);
    picSetData.push(dataReport[picStartIndex].ResultReport);
    picSetData.push(dataReport[picStartIndex + 1].ResultReport);
    picSetData.push(dataReport[picStartIndex + 2].ResultReport);

    for (i = picStartIndex + 3; dataReport[i].ReportOrder < 110; i) {
      dataInTable.push([
        {
          content: dataReport[i].ItemReportName,
          styles: {
            valign: "middle",
            halign: "center",
            maxCellHeight: 12,
          },
        },
        {
          content:
            dataReport[i].ResultReport +
            "\n" +
            "(Specification: " +
            dataReport[i].ControlRange +
            ")",
          styles: {
            valign: "middle",
            halign: "center",
            maxCellHeight: 12,
          },
        },
        {
          content:
            dataReport[i + 1].ResultReport +
            "\n" +
            "(Specification: " +
            dataReport[i + 1].ControlRange +
            ")",
          styles: {
            valign: "middle",
            halign: "center",
            maxCellHeight: 12,
          },
        },
        {
          content:
            dataReport[i + 2].ResultReport +
            "\n" +
            "(Specification: " +
            dataReport[i + 2].ControlRange +
            ")",
          styles: {
            valign: "middle",
            halign: "center",
            maxCellHeight: 12,
          },
        },
      ]);
      i = i + 3;
    }

    doc.autoTable({
      startY: currentY + 4,
      head: dataInHeader,
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
        maxCellHeight: 12,
        //cellWidth: 17,
      },
      margin: { bottom: 20 },
      columnStyles: {
        0: {
          /* cellWidth: 75 */
        },
        1: { cellWidth: picWidht },
        2: { cellWidth: picWidht },
        3: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (
          data.section === "body" &&
          data.column.index >= 1 &&
          data.row.index == 0
        ) {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" + picSetData[runningPic]
            );
            runningPic++;
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            runningPic++;
            console.log("error pic" + err);
          }
        }
      },
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY;

    dataInTable = [];
    if (dataReport[0].Comment1 != "" && dataReport[0].Comment1 != null) {
      dataInTable.push([dataReport[0].Comment1]);
    }
    //console.log(dataInTable);
    if (dataInTable.length > 0) {
      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: "Comment",
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
                cellWidth: 18,
              },
            },
          ],
        ],
        //body: body,
        theme: "grid",
      });
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 2,

        body: dataInTable,
        bodyStyles: {
          textColor: 0,
          halign: "left",
          valign: "middle",
          fillColor: [255, 255, 255],
          font: "THSarabun",
          fontStyle: "normal",
          fontSize: 13,
          cellPadding: 1,
          maxCellHeight: 12,
          //cellWidth: 17,
        },

        theme: "plain",
      });
    }
    currentY = doc.lastAutoTable.finalY;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function PicSetRefTMT(dataReport, doc, currentY) {
  try {
    doc.addPage("a4", "landscape");
    currentY = 10;
    var TextSubJect = "SEM and coating weight refer TOYOTA specification";
    var widthText = doc.getTextWidth(TextSubJect);
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: TextSubJect,
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
              cellWidth: widthText - 8,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    // add position pic
    currentY = doc.lastAutoTable.finalY;
    //find start i set
    var i = 0;
    var cwtData = [];
    for (i; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder == 104) {
        cwtData.push(dataReport[i]);
        cwtData.push(dataReport[i + 1]);
        cwtData.push(dataReport[i + 2]);
      }
      if (dataReport[i].ReportOrder >= 120) {
        break;
      }
    }
    cwtData[0].ControlRange = "2 - 3";
    cwtData[1].ControlRange = "2 - 4";
    cwtData[2].ControlRange = "2 - 5";

    var picStartIndex = i;
    var dataInHeader = [];
    dataInHeader = [
      [
        {
          content: "MATERIAL",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
        {
          content: dataReport[i].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
        {
          content: dataReport[i + 1].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
        {
          content: dataReport[i + 2].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
            maxCellHeight: 12,
          },
        },
      ],
    ];
    var dataInTable = [];
    var picSetData = [];
    var picHeight = 50;
    var picWidht = 80;
    var runningPic = 0;

    //SET PIC Report order 101 102 103

    dataInTable.push([
      {
        content: dataReport[picStartIndex].ItemReportName,
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
    ]);
    picSetData.push(dataReport[picStartIndex].ResultReport);
    picSetData.push(dataReport[picStartIndex + 1].ResultReport);
    picSetData.push(dataReport[picStartIndex + 2].ResultReport);

    for (i = picStartIndex + 3; i < dataReport.length; i) {
      dataInTable.push([
        {
          content: dataReport[i].ItemReportName,
          styles: {
            valign: "middle",
            halign: "center",
            maxCellHeight: 12,
          },
        },
        {
          content:
            dataReport[i].ResultReport +
            "\n" +
            "(Specification: " +
            dataReport[i].ControlRange +
            ")",
          styles: {
            valign: "middle",
            halign: "center",
            maxCellHeight: 12,
          },
        },
        {
          content:
            dataReport[i + 1].ResultReport +
            "\n" +
            "(Specification: " +
            dataReport[i + 1].ControlRange +
            ")",
          styles: {
            valign: "middle",
            halign: "center",
            maxCellHeight: 12,
          },
        },
        {
          content:
            dataReport[i + 2].ResultReport +
            "\n" +
            "(Specification: " +
            dataReport[i + 2].ControlRange +
            ")",
          styles: {
            valign: "middle",
            halign: "center",
            maxCellHeight: 12,
          },
        },
      ]);
      if (i == picStartIndex + 3) {
        dataInTable.push([
          {
            content: cwtData[0].ItemReportName,
            styles: {
              valign: "middle",
              halign: "center",
              maxCellHeight: 12,
            },
          },
          {
            content:
              cwtData[0].ResultReport +
              "\n" +
              "(Specification: " +
              cwtData[0].ControlRange +
              ")",
            styles: {
              valign: "middle",
              halign: "center",
              maxCellHeight: 12,
            },
          },
          {
            content:
              cwtData[1].ResultReport +
              "\n" +
              "(Specification: " +
              cwtData[1].ControlRange +
              ")",
            styles: {
              valign: "middle",
              halign: "center",
              maxCellHeight: 12,
            },
          },
          {
            content:
              cwtData[2].ResultReport +
              "\n" +
              "(Specification: " +
              cwtData[2].ControlRange +
              ")",
            styles: {
              valign: "middle",
              halign: "center",
              maxCellHeight: 12,
            },
          },
        ]);
      }
      i = i + 3;
    }

    doc.autoTable({
      startY: currentY + 4,
      head: dataInHeader,
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
        maxCellHeight: 12,
        //cellWidth: 17,
      },
      margin: { bottom: 20 },
      columnStyles: {
        0: {
          /* cellWidth: 75 */
        },
        1: { cellWidth: picWidht },
        2: { cellWidth: picWidht },
        3: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (
          data.section === "body" &&
          data.column.index >= 1 &&
          data.row.index == 0
        ) {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" + picSetData[runningPic]
            );
            runningPic++;
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            runningPic++;
            console.log("error pic" + err);
          }
        }
      },
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY;

    dataInTable = [];
    if (dataReport[0].Comment2 != "" && dataReport[0].Comment2 != null) {
      dataInTable.push([dataReport[0].Comment2]);
    }
    //console.log(dataInTable);
    if (dataInTable.length > 0) {
      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: "Comment",
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
                cellWidth: 18,
              },
            },
          ],
        ],
        //body: body,
        theme: "grid",
      });
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 2,

        body: dataInTable,
        bodyStyles: {
          textColor: 0,
          halign: "left",
          valign: "middle",
          fillColor: [255, 255, 255],
          font: "THSarabun",
          fontStyle: "normal",
          fontSize: 13,
          cellPadding: 1,
          maxCellHeight: 12,
          //cellWidth: 17,
        },

        theme: "plain",
      });
    }
    currentY = doc.lastAutoTable.finalY;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}
