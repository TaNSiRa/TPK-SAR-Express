const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");
const Pattern_Doc = require("./Pattern_5MasterDoc.js");

exports.HeaderSetTH = async (dataReport, doc) => {
  try {
    var currentY = 10;
    console.log("HEADER Thai");
    //Add Logo
    var picHigh = 18;
    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(bitmap.toString("base64"), "JPG", 87, currentY, 36, picHigh);
    currentY = currentY + picHigh;
    //Add Customer Name
    var custHigh = 20;
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: dataReport[0].CustFull,
            //colSpan: 5,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 25,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: custHigh,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    //text
    currentY = currentY + 6 + custHigh;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.DataSetTH = async (dataReport, doc, currentY) => {
  try {
    console.log("DataSet");

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
    var countRound = 0;
    var startIndex = 0;
    var i = 0;
    for (startIndex = 0; startIndex < dataReport.length; startIndex++) {
      if (countRound != 0) {
        currentY = await Pattern_Doc.addPage(doc);
      }
      doc.setFontSize(20);
      var TextSubJect = dataReport[startIndex].ProcessReportName;
      var widthText = doc.getTextWidth(TextSubJect);
      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: TextSubJect,
              styles: {
                textColor: 0,
                halign: "center",
                valign: "middle",
                fillColor: [3, 244, 252],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: 20,
                cellPadding: 1,
                lineColor: 0,
                lineWidth: 0.1,
                maxCellHeight: 15,
                cellWidth: widthText + 5,
              },
            },
          ],
        ],
        //body: body,
        theme: "grid",
      });

      currentY = doc.lastAutoTable.finalY;
      var fontSize = 15;
      var buffDT = dataReport[startIndex].ResultReport.split("/");
      var posSub = 15;
      var posTime = 45;
      doc.setFontSize(fontSize);

      doc.setFont("THSarabun", "bold");
      doc.text("วันที่เก็บตัวอย่าง", posSub, currentY + 8);
      doc.setFont("THSarabun", "normal");
      doc.text(": " + buffDT[0], posTime, currentY + 8);
      currentY = currentY + fontSize / 2.5 + 4;

      doc.setFont("THSarabun", "bold");
      doc.text("วันที่ทำรายงาน", posSub, currentY + 4);
      doc.setFont("THSarabun", "normal");
      doc.text(
        ": " + dtConv.toDateMonthNameTH(dataReport[1].CreateReportDate),
        posTime,
        currentY + 4
      );
      currentY = currentY + fontSize / 2.5;

      doc.setFont("THSarabun", "bold");
      doc.text("เวลาที่เก็บตัวอย่าง", posSub, currentY + 4);
      doc.setFont("THSarabun", "normal");
      doc.text(": " + buffDT[1], posTime, currentY + 4);
      currentY = currentY + fontSize / 2.5;

      doc.setFont("THSarabun", "bold");
      doc.text("ค่าควบคุมน้ำยา", posSub, currentY + 4);
      currentY = currentY + fontSize / 2.5;

      var dataInTable = [];
      //skip time index 0 (1,21,41)
      startIndex++;
      for (i = startIndex; i < dataReport.length; i++) {
        //merge dupicate
        if (dataReport[i].ReportOrder % 20 == 1) {
          break;
        } else if (i < dataReport.length - 1) {
          if (
            dataReport[i].ProcessReportName ==
            dataReport[i + 1].ProcessReportName
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
        startY: currentY + 4,
        head: [
          [
            "กระบวนการ",
            "หัวข้อควบคุม",
            "ช่วงที่ควบคุม",
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
              dataReport[startIndex + data.row.index].Evaluation == "ต่ำ" ||
              dataReport[startIndex + data.row.index].Evaluation == "สูง" ||
              dataReport[startIndex + data.row.index].Evaluation == "ไม่ผ่าน"
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
      ////////////////////////////////////Comment Set

      dataInTable = [];
      if (countRound == 0) {
        if (dataReport[0].Comment1 != "" && dataReport[0].Comment1 != null) {
          dataInTable.push([dataReport[0].Comment1]);
        }
      } else if (countRound == 1) {
        if (dataReport[0].Comment2 != "" && dataReport[0].Comment2 != null) {
          dataInTable.push([dataReport[0].Comment2]);
        }
      } else if (countRound == 2) {
        if (dataReport[0].Comment3 != "" && dataReport[0].Comment3 != null) {
          dataInTable.push([dataReport[0].Comment3]);
        }
      } else if (countRound == 3) {
        if (dataReport[0].Comment4 != "" && dataReport[0].Comment4 != null) {
          dataInTable.push([dataReport[0].Comment4]);
        }
      } else if (countRound == 4) {
        if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
          console.log("Comment5");
          console.log(dataReport[0].Comment5);
          console.log(dataReport[0].Comment5.split('|')[0]);
          dataInTable.push([[dataReport[0].Comment5].split('|')[0]]);
        }
      } else if (countRound == 5) {
        if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
          console.log("Comment6");
          console.log(dataReport[0].Comment5);
          console.log(dataReport[0].Comment5.split('|')[1]);
          dataInTable.push([[dataReport[0].Comment5].split('|')[0]]);
        }
      } else if (countRound == 6) {
        if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
          console.log("Comment7");
          console.log(dataReport[0].Comment5);
          console.log(dataReport[0].Comment5.split('|')[2]);
          dataInTable.push([[dataReport[0].Comment5].split('|')[0]]);
        }
      } else if (countRound == 7) {
        if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
          console.log("Comment8");
          console.log(dataReport[0].Comment5);
          console.log(dataReport[0].Comment5.split('|')[3]);
          dataInTable.push([[dataReport[0].Comment5].split('|')[0]]);
        }
      }

      var TextSubJect = "สรุปผล";
      var widthText = doc.getTextWidth(TextSubJect);

      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: TextSubJect,
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
                cellWidth: widthText + 5,
              },
            },
          ],
        ],
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
        },

        theme: "plain",
      });

      currentY = doc.lastAutoTable.finalY;
      startIndex = i - 1;
      countRound++;
    }

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.DataSetTHFFS = async (dataReport, doc, currentY) => {
  try {
    console.log("DataSetTHFFS");

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
    var countRound = 0;
    var startIndex = 0;
    var i = 0;
    for (startIndex = 0; startIndex < dataReport.length; startIndex++) {
      if (countRound == 1 || countRound == 3 || countRound == 5) {
        if (dataReport[startIndex].ResultReport != "no") {
          currentY = await Pattern_Doc.addPage(doc);
        }
      }
      doc.setFont("THSarabun", "bold");
      doc.setFontSize(20);
      var TextSubJect = dataReport[startIndex].ProcessReportName;
      var widthText = doc.getTextWidth(TextSubJect);
      if (dataReport[startIndex].ResultReport != "no") {
        doc.autoTable({
          startY: currentY + 4,
          head: [
            [
              {
                content: TextSubJect,
                styles: {
                  textColor: 0,
                  halign: "center",
                  valign: "middle",
                  fillColor: [3, 244, 252],
                  font: "THSarabun",
                  fontStyle: "bold",
                  fontSize: 20,
                  cellPadding: 1,
                  lineColor: 0,
                  lineWidth: 0.1,
                  maxCellHeight: 15,
                  cellWidth: widthText + 5,
                },
              },
            ],
          ],
          //body: body,
          theme: "grid",
        });

        currentY = doc.lastAutoTable.finalY;
        var fontSize = 15;
        var buffDT = dataReport[startIndex].ResultReport.split("/");
        var posSub = 15;
        var posTime = 45;
        doc.setFontSize(fontSize);

        doc.setFont("THSarabun", "bold");
        doc.text("วันที่เก็บตัวอย่าง", posSub, currentY + 8);
        doc.setFont("THSarabun", "normal");
        doc.text(": " + buffDT[0], posTime, currentY + 8);
        currentY = currentY + fontSize / 2.5 + 4;

        doc.setFont("THSarabun", "bold");
        doc.text("วันที่ทำรายงาน", posSub, currentY + 4);
        doc.setFont("THSarabun", "normal");
        doc.text(
          ": " + dtConv.toDateMonthNameTH(dataReport[1].CreateReportDate),
          posTime,
          currentY + 4
        );
        currentY = currentY + fontSize / 2.5;

        doc.setFont("THSarabun", "bold");
        doc.text("เวลาที่เก็บตัวอย่าง", posSub, currentY + 4);
        doc.setFont("THSarabun", "normal");
        doc.text(": " + buffDT[1], posTime, currentY + 4);
        currentY = currentY + fontSize / 2.5;

        doc.setFont("THSarabun", "bold");
        doc.text("ค่าควบคุมน้ำยา", posSub, currentY + 4);
        currentY = currentY + fontSize / 2.5;
      }
      var dataInTable = [];
      //skip time index 0 (1,21,41)
      startIndex++;
      for (i = startIndex; i < dataReport.length; i++) {
        //merge dupicate
        if (dataReport[i].ReportOrder % 20 == 1) {
          break;
        } else if (i < dataReport.length - 1) {
          if (
            dataReport[i].ProcessReportName ==
            dataReport[i + 1].ProcessReportName
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
      if (dataReport[startIndex - 1].ResultReport != "no") {
        doc.autoTable({
          startY: currentY + 4,
          head: [
            [
              "กระบวนการ",
              "หัวข้อควบคุม",
              "ช่วงที่ควบคุม",

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
                dataReport[startIndex + data.row.index].Evaluation == "ต่ำ" ||
                dataReport[startIndex + data.row.index].Evaluation == "สูง" ||
                dataReport[startIndex + data.row.index].Evaluation == "ไม่ผ่าน"
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
        ////////////////////////////////////Comment Set

        dataInTable = [];
        if (countRound == 0) {
          if (dataReport[0].Comment1 != "" && dataReport[0].Comment1 != null) {
            dataInTable.push([dataReport[0].Comment1]);
          }
        } else if (countRound == 1) {
          if (dataReport[0].Comment2 != "" && dataReport[0].Comment2 != null) {
            dataInTable.push([dataReport[0].Comment2]);
          }
        } else if (countRound == 2) {
          if (dataReport[0].Comment3 != "" && dataReport[0].Comment3 != null) {
            dataInTable.push([dataReport[0].Comment3]);
          }
        } else if (countRound == 3) {
          if (dataReport[0].Comment4 != "" && dataReport[0].Comment4 != null) {
            dataInTable.push([dataReport[0].Comment4]);
          }
        } else if (countRound == 4) {
          if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
            console.log("Comment5");
            console.log(dataReport[0].Comment5);
            console.log(dataReport[0].Comment5.split('|')[0]);
            dataInTable.push([[dataReport[0].Comment5].split('|')[0]]);
          }
        } else if (countRound == 5) {
          if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
            console.log("Comment6");
            console.log(dataReport[0].Comment5);
            console.log(dataReport[0].Comment5.split('|')[1]);
            dataInTable.push([[dataReport[0].Comment5].split('|')[0]]);
          }
        } else if (countRound == 6) {
          if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
            console.log("Comment7");
            console.log(dataReport[0].Comment5);
            console.log(dataReport[0].Comment5.split('|')[2]);
            dataInTable.push([[dataReport[0].Comment5].split('|')[0]]);
          }
        } else if (countRound == 7) {
          if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
            console.log("Comment8");
            console.log(dataReport[0].Comment5);
            console.log(dataReport[0].Comment5.split('|')[3]);
            dataInTable.push([[dataReport[0].Comment5].split('|')[0]]);
          }
        }

        var TextSubJect = "สรุปผล";
        var widthText = doc.getTextWidth(TextSubJect);

        doc.autoTable({
          startY: currentY + 4,
          head: [
            [
              {
                content: TextSubJect,
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
                  cellWidth: widthText + 5,
                },
              },
            ],
          ],
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
          },

          theme: "plain",
        });
      }
      currentY = doc.lastAutoTable.finalY;
      startIndex = i - 1;
      countRound++;
    }

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
