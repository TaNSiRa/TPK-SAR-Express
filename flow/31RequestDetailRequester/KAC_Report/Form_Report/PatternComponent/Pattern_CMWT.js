const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.DataSet = async (dataReport, doc, currentY) => {
  try {
    console.log("DataSet CMWT");
    //spec toyota
    var dataInTable = [];
    var indexStart = 0;
    var setProcessNmae = [
      "SPHC 440",
      "SPHC 590",
      "SPHC 440",
      "SPHC 590",
      "SPHC 440",
      "SPHC 590",
    ];

    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        indexStart = i;
        break;
      }
    }

    var countSet = 0;
    for (let i = indexStart; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 110) {
        break;
      }
      if (countSet == 0 || countSet == 2 || countSet == 4) {
        dataInTable.push([
          {
            rowSpan: 2,
            content: dataReport[i].ItemReportName,
          },
          setProcessNmae[countSet],
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
          dataReport[i].Evaluation,
        ]);
      } else {
        dataInTable.push([
          setProcessNmae[countSet],
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
          dataReport[i].Evaluation,
        ]);
      }
      countSet++;
    }

    doc.autoTable({
      startY: currentY + 5,
      head: [
        [
          {
            colSpan: 2,
            content: "Check Item of TOYOTA spec",
          },
          "Standard",
          "Result",
          "Evaluation",
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
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 40, fillColor: [211, 239, 240] },
        //1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
      },
      willDrawCell: function (data) {
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[indexStart + data.row.index].Evaluation == "LOW" ||
            dataReport[indexStart + data.row.index].Evaluation == "HIGH" ||
            dataReport[indexStart + data.row.index].Evaluation == "NOT PASS" ||
            dataReport[indexStart + data.row.index].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
        if (data.column.index === 4 && data.section === "body") {
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

    dataInTable = [];

    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 110) {
        indexStart = i;
        break;
      }
    }

    countSet = 0;
    for (let i = indexStart; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 120) {
        break;
      }
      if (countSet == 0 || countSet == 2) {
        dataInTable.push([
          {
            rowSpan: 2,
            content: dataReport[i].ItemReportName,
          },
          setProcessNmae[countSet],
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
          dataReport[i].Evaluation,
        ]);
      } else {
        dataInTable.push([
          setProcessNmae[countSet],
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
          dataReport[i].Evaluation,
        ]);
      }
      countSet++;
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      head: [
        [
          {
            colSpan: 2,
            content: "Check Item of HONDA spec",
          },
          "Standard",
          "Result",
          "Evaluation",
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
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 40, fillColor: [211, 239, 240] },

        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
      },
      willDrawCell: function (data) {
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[indexStart + data.row.index].Evaluation == "LOW" ||
            dataReport[indexStart + data.row.index].Evaluation == "HIGH" ||
            dataReport[indexStart + data.row.index].Evaluation == "NOT PASS" ||
            dataReport[indexStart + data.row.index].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
        if (data.column.index === 4 && data.section === "body") {
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

    //pic set
    dataInTable = [];
    indexStart = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 121) {
        indexStart = i;
        break;
      }
    }

    var picHeight = 45;
    var picWidth = 71;
    dataInTable.push([
      {
        content: dataReport[indexStart].ItemReportName,
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      head: [["TEST PIECES", "SPHC 440", "SPHC 590"]],
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
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 40, fillColor: [211, 239, 240] },
      },
      didDrawCell: function (data) {
        if (data.column.index == 1 && data.section === "body") {
          try {
            var bitmap;
            try {
              bitmap = fs.readFileSync(
                "C:\\AutomationProject\\SAR\\asset\\" +
                  dataReport[indexStart].ResultReport
              );
            } catch (err) {
              console.log("error pic" + err);
              bitmap = fs.readFileSync("C:\\SAR\\asset\\NotFoundPic.jpg");
            }
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidth - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log("error pic" + err);
          }
        }
        if (data.column.index == 2 && data.section === "body") {
          try {
            var bitmap;
            try {
              bitmap = fs.readFileSync(
                "C:\\AutomationProject\\SAR\\asset\\" +
                  dataReport[indexStart + 1].ResultReport
              );
            } catch (err) {
              bitmap = fs.readFileSync("C:\\SAR\\asset\\NotFoundPic.jpg");
            }
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidth - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log("error pic" + err);
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
