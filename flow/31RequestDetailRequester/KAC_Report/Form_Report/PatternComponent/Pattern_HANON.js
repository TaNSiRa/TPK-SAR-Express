const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");
const Pattern_Doc = require("./Pattern_5MasterDoc");

exports.CoatingPre = async (dataReport, doc, currentY) => {
  try {
    console.log("Coat_PreHANON");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Coating weight performance of Hydrophilic",
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
              cellWidth: 65,
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
    var indexStart = 0;
    //find data
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        indexStart = i;
        break;
      }
    }
    console.log(indexStart);

    for (i = indexStart; i < dataReport.length; i) {
      if (dataReport[i].ResultReport != "N/A") {
        dataInTable.push([
          dataReport[i].ProcessReportName,
          dataReport[i].ResultReport,
          dataReport[i + 1].ResultReport,
          dataReport[i + 2].ResultReport,
          dataReport[i + 3].ResultReport,
          dataReport[i + 4].ResultReport,
          dataReport[i + 5].ResultReport,
        ]);
      }
      i = i + 6;
    }

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            rowSpan: 4,
            content: "Model",
          },
          { colSpan: 6, content: "Coating on evaporator (g/m²)" },
        ],
        [
          { colSpan: 3, content: "Front" },
          { colSpan: 3, content: "Back" },
        ],
        [
          dataReport[indexStart].ItemReportName,
          dataReport[indexStart + 1].ItemReportName,
          dataReport[indexStart + 2].ItemReportName,
          dataReport[indexStart + 3].ItemReportName,
          dataReport[indexStart + 4].ItemReportName,
          dataReport[indexStart + 5].ItemReportName,
        ],
        [
          dataReport[indexStart].ControlRange,
          dataReport[indexStart + 1].ControlRange,
          dataReport[indexStart + 2].ControlRange,
          dataReport[indexStart + 3].ControlRange,
          dataReport[indexStart + 4].ControlRange,
          dataReport[indexStart + 5].ControlRange,
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
        cellPadding: 0.5,
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
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      columnStyles: {
        0: { fillColor: [211, 239, 240] },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
      willDrawCell: function (data) {
        if (data.column.index != 0 && data.section === "body") {
          indexCheck =
            indexStart + data.row.index * 6 + (data.column.index - 1);
          if (
            dataReport[indexCheck].Evaluation == "LOW" ||
            dataReport[indexCheck].Evaluation == "HIGH" ||
            dataReport[indexCheck].Evaluation == "NOT PASS" ||
            dataReport[indexCheck].Evaluation == "NG"
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
};
