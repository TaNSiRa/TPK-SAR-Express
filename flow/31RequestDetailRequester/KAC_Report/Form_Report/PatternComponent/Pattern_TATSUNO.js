const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.PicSet = async (dataReport, doc, currentY) => {
  try {
    console.log("TATSUNO");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Nano coating preformance",
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
              cellWidth: 40,
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
      if (dataReport[i].ReportOrder >= 100) {
        //find start index
        break;
      }
    }

    var picHeight = 35;
    var picWidth = 50;
    dataInTable.push([
      dataReport[i].ProcessReportName,
      "",
      "",
      dataReport[i + 2].ResultReport,
    ]);
    console.log("dataInTable " + dataInTable);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        ["MATERIAL", "Apperance", "Adhesion test", "Coating weight(mg/m2)"],
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
        minCellHeight: picHeight,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: {},
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: {},
      },
      didDrawCell: function (data) {
        if (data.column.index == 1 && data.section === "body") {
          const resultVal = dataReport[i].ResultReport;
          if (!resultVal || resultVal.trim() === "") {
            // วาดข้อความ - แทน
            doc.setFont("THSarabun", "normal");
            doc.setFontSize(13);
            doc.text(
              "-",
              data.cell.x + data.cell.width / 2,
              data.cell.y + data.cell.height / 2,
              { align: "center", baseline: "middle" }
            );
          } else {
            try {
              var bitmap;
              try {
                bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset\\" + resultVal
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
        }

        if (data.column.index == 2 && data.section === "body") {
          const resultVal = dataReport[i + 1].ResultReport;
          if (!resultVal || resultVal.trim() === "") {
            // วาดข้อความ - แทน
            doc.setFont("THSarabun", "normal");
            doc.setFontSize(13);
            doc.text(
              "-",
              data.cell.x + data.cell.width / 2,
              data.cell.y + data.cell.height / 2,
              { align: "center", baseline: "middle" }
            );
          } else {
            try {
              var bitmap;
              try {
                bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset\\" + resultVal
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
        }
      },
      // didDrawCell: function (data) {
      //   if (data.column.index == 1 && data.section === "body") {
      //     try {
      //       var bitmap;
      //       try {
      //         bitmap = fs.readFileSync(
      //           "C:\\AutomationProject\\SAR\\asset\\" +
      //             dataReport[i].ResultReport
      //         );
      //       } catch (err) {
      //         console.log("error pic" + err);
      //         bitmap = fs.readFileSync("C:\\SAR\\asset\\NotFoundPic.jpg");
      //       }
      //       doc.addImage(
      //         bitmap.toString("base64"),
      //         "jpg",
      //         data.cell.x + 1,
      //         data.cell.y + 1,
      //         picWidth - 2,
      //         picHeight - 2
      //       );
      //     } catch (err) {
      //       console.log("error pic" + err);
      //     }
      //   }
      //   if (data.column.index == 2 && data.section === "body") {
      //     try {
      //       var bitmap;
      //       try {
      //         bitmap = fs.readFileSync(
      //           "C:\\AutomationProject\\SAR\\asset\\" +
      //             dataReport[i + 1].ResultReport
      //         );
      //       } catch (err) {
      //         bitmap = fs.readFileSync("C:\\SAR\\asset\\NotFoundPic.jpg");
      //       }
      //       doc.addImage(
      //         bitmap.toString("base64"),
      //         "jpg",
      //         data.cell.x + 1,
      //         data.cell.y + 1,
      //         picWidth - 2,
      //         picHeight - 2
      //       );
      //     } catch (err) {
      //       console.log("error pic" + err);
      //     }
      //   }
      // },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
