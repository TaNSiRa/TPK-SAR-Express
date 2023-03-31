const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSet.js");
const Pattern_MainP = require("./PatternComponent/Pattern_3MainPicSet.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const fs = require("fs");

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
    buffDoc = await Pattern_MainH.HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    buffDoc = await DataSetTBFST(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Comment
    buffDoc = await Pattern_MainC.CommentSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //SignSet
    if (currentY >= 297 - 50) {
      currentY = Pattern_Doc.addPage(doc);
    }
    buffDoc = await Pattern_MainH.SignSet(dataReport, doc, currentY);
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

async function DataSetTBFST(dataReport, doc, currentY) {
  try {
    console.log("DataSetTBFST");
    doc.autoTable({
      startY: currentY - 4,
      head: [
        [
          {
            content: "Condition",
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
              cellWidth: 20,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    var dataInTable = [];
    var countIndexSpans = 0;
    var MachineName = [
      "Case washing No.1",
      "Case washing No.2",
      "Case washing No.3",
      "Plate washing No.1",
      "Plate washing No.2",
      "Plate washing No.4",
    ];
    var MachineSpans = [5, 5, 5, 10, 10, 10];
    for (let i = 0; i < dataReport.length; i++) {
      if (i <= 14) {
        if (i == 0 || i == 5 || i == 10) {
          dataInTable.push([
            {
              rowSpan: MachineSpans[countIndexSpans],
              content: MachineName[countIndexSpans],
            },
            {
              rowSpan: 5,
              content: dataReport[i].ProcessReportName,
            },
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
          countIndexSpans++;
        } else if (i == 3 || i == 8 || i == 13) {
          dataInTable.push([
            { rowSpan: 2, content: dataReport[i].ItemReportName },
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
          i++;
          dataInTable.push([
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        } else {
          dataInTable.push([
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        }
      } else {
        if (i == 15 || i == 25 || i == 35) {
          dataInTable.push([
            {
              rowSpan: MachineSpans[countIndexSpans],
              content: MachineName[countIndexSpans],
            },
            {
              rowSpan: 5,
              content: dataReport[i].ProcessReportName,
            },
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
          countIndexSpans++;
        } else if (i == 20 || i == 30 || i == 40) {
          dataInTable.push([
            {
              rowSpan: 5,
              content: dataReport[i].ProcessReportName,
            },
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        } else if (
          i == 18 ||
          i == 23 ||
          i == 28 ||
          i == 33 ||
          i == 38 ||
          i == 43
        ) {
          dataInTable.push([
            { rowSpan: 2, content: dataReport[i].ItemReportName },
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
          i++;
          dataInTable.push([
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        } else {
          dataInTable.push([
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        }
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        [
          "MACHINE",
          "PROCESS",
          "CHECK ITEM",
          {
            content: "CONTROLED RANGE",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 11,
            },
          },
          "RESULT",
          "EVALUATION",
        ],
      ],
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
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { fillColor: [211, 239, 240] },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      willDrawCell: function (data) {
        if (data.column.index === 4 && data.section === "body") {
          if (
            dataReport[data.row.index].Evaluation == "LOW" ||
            dataReport[data.row.index].Evaluation == "HIGH" ||
            dataReport[data.row.index].Evaluation == "NOT PASS" ||
            dataReport[data.row.index].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
        if (data.column.index === 5 && data.section === "body") {
          if (
            data.cell.raw == "LOW" ||
            data.cell.raw == "HIGH" ||
            data.cell.raw == "NOT PASS" ||
            data.cell.raw == "NG"
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
