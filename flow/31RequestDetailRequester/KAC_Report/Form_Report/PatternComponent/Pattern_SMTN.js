const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");
const Pattern_Doc = require("./Pattern_5MasterDoc");

exports.CoatingPre = async (dataReport, doc, currentY) => {
  try {
    console.log("Coat_PreSMTN");
    currentY = Pattern_Doc.addPage(doc);
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Coating performance",
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
              cellWidth: 33,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    var dataInTable = [];
    var i = 0;
    //find data
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        break;
      }
    }
    console.log(i);
    console.log(dataReport.length);
    dataInTable.push([
      dataReport[i].ProcessReportName,
      dataReport[i].ResultReport,
      dataReport[i + 1].ResultReport,
      dataReport[i + 2].ResultReport,
      dataReport[i + 3].ResultReport,
    ]);
    dataInTable.push([
      dataReport[i + 4].ProcessReportName,
      dataReport[i + 4].ResultReport,
      dataReport[i + 5].ResultReport,
      dataReport[i + 6].ResultReport,
      dataReport[i + 7].ResultReport,
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            rowSpan: 3,
            content: "Materia",
          },
          { colSpan: 4, content: "Coating Weight (g/m²)" },
        ],
        [
          {
            content: "Phosphate",
          },
          {
            colSpan: 3,
            content: "(Phosphate + Palube-235T)",
          },
        ],
        [
          {
            content: "Phosphate Film",
          },
          {
            content: "Phosphate Film",
          },
          {
            content: "Metal Soap Film",
          },
          {
            content: "Stearate Film",
          },
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
        0: { fillColor: [211, 239, 240], cellWidth: 35 },
        1: {
          cellWidth: 35,
        },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
      },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
