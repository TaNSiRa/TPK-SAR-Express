const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.DataSetTH = async (dataReport, doc, currentY) => {
  try {
    console.log("DataSet");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "ค่าควบคุมน้ำยา",
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

    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].Evaluation == "LOW") {
        dataReport[i].Evaluation = "ต่ำ";
      } else if (dataReport[i].Evaluation == "HIGH") {
        dataReport[i].Evaluation = "สูง";
      } else if (dataReport[i].Evaluation == "PASS") {
        dataReport[i].Evaluation = "ผ่าน";
      } else if (
        dataReport[i].Evaluation == "NOT PASS" ||
        dataReport[i].Evaluation == "NG"
      ) {
        dataReport[i].Evaluation = "ไม่ผ่าน";
      }
    }

    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
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
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        [
          "กระบวนการ",
          "หัวข้อควบคุม",
          {
            content: "ช่วงที่ควบคุม",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 11,
            },
          },
          "ผลการตรวจสอบ",
          "หมายเหตุ",
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
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
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
};
