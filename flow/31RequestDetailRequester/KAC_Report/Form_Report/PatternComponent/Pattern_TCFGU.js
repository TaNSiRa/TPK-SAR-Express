const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.DataSet = async (dataReport, doc, currentY) => {
  try {
    console.log("DataSet");
    doc.autoTable({
      startY: currentY + 4,
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

    //

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        [
          {
            content: "UPPER CASE LINE",
            styles: {
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
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    var dataInTable = [];
    var i = 0;
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 11) {
        break;
      }

      //merge dupicate
      if (i < dataReport.length - 1) {
        if (
          dataReport[i].ProcessReportName == dataReport[i + 1].ProcessReportName
        ) {
          let countSpan = 2;
          for (let j = 1; i + j < dataReport.length; j++) {
            if (i + j < dataReport.length - 1) {
              if (
                dataReport[i].ProcessReportName ==
                dataReport[i + j + 1].ProcessReportName
              ) {
                countSpan++;
              } else {
                break;
              }
            } else {
              break;
            }
          }
          for (let j = 0; j < countSpan; j++) {
            if (j == 0) {
              dataInTable.push([
                {
                  rowSpan: countSpan,
                  content: dataReport[i].ProcessReportName,
                },
                //dataReport[i].ProcessReportName,
                dataReport[i].ItemReportName,
                dataReport[i].ControlRange,
                dataReport[i].ResultReport,
                dataReport[i].Evaluation,
              ]);
            } else {
              dataInTable.push([
                //dataReport[i + j].ProcessReportName,
                dataReport[i + j].ItemReportName,
                dataReport[i + j].ControlRange,
                dataReport[i + j].ResultReport,
                dataReport[i + j].Evaluation,
              ]);
            }
          }
          i = i + countSpan - 1;
        } else {
          dataInTable.push([
            dataReport[i].ProcessReportName,
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        }
      } else {
        dataInTable.push([
          dataReport[i].ProcessReportName,
          dataReport[i].ItemReportName,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
          dataReport[i].Evaluation,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      head: [
        [
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
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[data.row.index].Evaluation == "LOW" ||
            dataReport[data.row.index].Evaluation == "HIGH" ||
            dataReport[data.row.index].Evaluation == "NOT PASS" ||
            dataReport[data.row.index].Evaluation == "NG"
          ) {
            doc.setTextColor(0, 0, 0); // Red
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

    ///////////////////

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        [
          {
            content: "MAIN CASE LINE",
            styles: {
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
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    dataInTable = [];

    for (i; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 21) {
        break;
      }

      //merge dupicate
      if (i < dataReport.length - 1) {
        if (
          dataReport[i].ProcessReportName == dataReport[i + 1].ProcessReportName
        ) {
          let countSpan = 2;
          for (let j = 1; i + j < dataReport.length; j++) {
            if (i + j < dataReport.length - 1) {
              if (
                dataReport[i].ProcessReportName ==
                dataReport[i + j + 1].ProcessReportName
              ) {
                countSpan++;
              } else {
                break;
              }
            } else {
              break;
            }
          }
          for (let j = 0; j < countSpan; j++) {
            if (j == 0) {
              dataInTable.push([
                {
                  rowSpan: countSpan,
                  content: dataReport[i].ProcessReportName,
                },
                //dataReport[i].ProcessReportName,
                dataReport[i].ItemReportName,
                dataReport[i].ControlRange,
                dataReport[i].ResultReport,
                dataReport[i].Evaluation,
              ]);
            } else {
              dataInTable.push([
                //dataReport[i + j].ProcessReportName,
                dataReport[i + j].ItemReportName,
                dataReport[i + j].ControlRange,
                dataReport[i + j].ResultReport,
                dataReport[i + j].Evaluation,
              ]);
            }
          }
          i = i + countSpan - 1;
        } else {
          dataInTable.push([
            dataReport[i].ProcessReportName,
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        }
      } else {
        dataInTable.push([
          dataReport[i].ProcessReportName,
          dataReport[i].ItemReportName,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
          dataReport[i].Evaluation,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      head: [
        [
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
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[data.row.index].Evaluation == "LOW" ||
            dataReport[data.row.index].Evaluation == "HIGH" ||
            dataReport[data.row.index].Evaluation == "NOT PASS" ||
            dataReport[data.row.index].Evaluation == "NG"
          ) {
            doc.setTextColor(0, 0, 0); // Red
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

    //////////////////////

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        [
          {
            content: "SHELL LINE",
            styles: {
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
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    /////////

    dataInTable = [];
    for (i; i < dataReport.length; i++) {
      //merge dupicate
      if (i < dataReport.length - 1) {
        if (
          dataReport[i].ProcessReportName == dataReport[i + 1].ProcessReportName
        ) {
          let countSpan = 2;
          for (let j = 1; i + j < dataReport.length; j++) {
            if (i + j < dataReport.length - 1) {
              if (
                dataReport[i].ProcessReportName ==
                dataReport[i + j + 1].ProcessReportName
              ) {
                countSpan++;
              } else {
                break;
              }
            } else {
              break;
            }
          }
          for (let j = 0; j < countSpan; j++) {
            if (j == 0) {
              dataInTable.push([
                {
                  rowSpan: countSpan,
                  content: dataReport[i].ProcessReportName,
                },
                //dataReport[i].ProcessReportName,
                dataReport[i].ItemReportName,
                dataReport[i].ControlRange,
                dataReport[i].ResultReport,
                dataReport[i].Evaluation,
              ]);
            } else {
              dataInTable.push([
                //dataReport[i + j].ProcessReportName,
                dataReport[i + j].ItemReportName,
                dataReport[i + j].ControlRange,
                dataReport[i + j].ResultReport,
                dataReport[i + j].Evaluation,
              ]);
            }
          }
          i = i + countSpan - 1;
        } else {
          dataInTable.push([
            dataReport[i].ProcessReportName,
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        }
      } else {
        dataInTable.push([
          dataReport[i].ProcessReportName,
          dataReport[i].ItemReportName,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
          dataReport[i].Evaluation,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      head: [
        [
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
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[data.row.index].Evaluation == "LOW" ||
            dataReport[data.row.index].Evaluation == "HIGH" ||
            dataReport[data.row.index].Evaluation == "NOT PASS" ||
            dataReport[data.row.index].Evaluation == "NG"
          ) {
            doc.setTextColor(0, 0, 0); // Red
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

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.CommentSet = async (dataReport, doc, currentY) => {
  try {
    console.log("CommentSetTCFGU");

    doc.addPage();
    currentY = 10;

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Comment",
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

    var fontSize = 12;
    var dataInTable = [];
    if (dataReport[0].Comment1 != "" && dataReport[0].Comment1 != null) {
      dataInTable.push([dataReport[0].Comment1]);
    }

    if (dataInTable.length > 0) {
      doc.setFont("THSarabun", "bold");
      doc.setFontSize(fontSize);
      doc.text("1. UPPER CASE LINE", 15, currentY + 10);

      currentY = currentY + 10 + fontSize / 2.5;

      doc.autoTable({
        startY: currentY,

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
      currentY = doc.lastAutoTable.finalY;
    }

    dataInTable = [];

    if (dataReport[0].Comment2 != "" && dataReport[0].Comment2 != null) {
      dataInTable.push([dataReport[0].Comment2]);
    }

    if (dataInTable.length > 0) {
      doc.setFont("THSarabun", "bold");
      doc.setFontSize(fontSize);
      doc.text("2. MAIN CASE LINE", 15, currentY + 10);

      currentY = currentY + 10 + fontSize / 2.5;

      doc.autoTable({
        startY: currentY,

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
      currentY = doc.lastAutoTable.finalY;
    }
    dataInTable = [];

    if (dataReport[0].Comment3 != "" && dataReport[0].Comment3 != null) {
      dataInTable.push([dataReport[0].Comment3]);
    }

    if (dataInTable.length > 0) {
      doc.setFont("THSarabun", "bold");
      doc.setFontSize(fontSize);
      doc.text("3. SHELL LINE", 15, currentY + 10);

      currentY = currentY + 10 + fontSize / 2.5;

      doc.autoTable({
        startY: currentY,

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
    dataInTable = [];
    //console.log(dataInTable);

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
