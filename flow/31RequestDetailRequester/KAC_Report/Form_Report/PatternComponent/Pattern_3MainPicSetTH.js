const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.PicSetTH = async (dataReport, doc, currentY) => {
  try {
    console.log("PicSet");
    var foundData = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        foundData++;
      }
    }
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
    if (foundData > 0) {
      /* if (currentY >= 190) { */
      if (currentY >= 170) {
        doc.addPage();
        currentY = 10;
      }
      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: "คุณภาพฟอสเฟสฟิลม์",
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
    }
    currentY = doc.lastAutoTable.finalY;

    var countSetPic = 0;
    var picHeight = 55;
    var picWidht = 90;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        var dataInTable = [];
        var countSpan = 1;
        var dataBuff = [];
        //count data before pic (span)
        for (let j = i; j < dataReport.length; j++) {
          if (dataReport[j].ReportOrder != 105 + countSetPic * 10) {
            countSpan++;
          } else if (dataReport[j].ReportOrder >= 105 + countSetPic * 10) {
            break;
          }
        }
        for (i; i < dataReport.length; i++) {
          //merge dupicate
          dataBuff.push(dataReport[i]);
          if (dataReport[i].ReportOrder == 101 + countSetPic * 10) {
            dataInTable.push([
              {
                rowSpan: countSpan,
                content: dataReport[i].ProcessReportName,
                style: {
                  fontSize: 20,
                },
              },
              dataReport[i].ItemReportName,
              dataReport[i].ControlRange,
              dataReport[i].ResultReport,
              dataReport[i].Evaluation,
            ]);
          } else if (dataReport[i].ReportOrder < 105 + countSetPic * 10) {
            dataInTable.push([
              //dataReport[i].ProcessReportName,
              dataReport[i].ItemReportName,
              dataReport[i].ControlRange,
              dataReport[i].ResultReport,
              dataReport[i].Evaluation,
            ]);
          } else if (dataReport[i].ReportOrder == 105 + countSetPic * 10) {
            dataInTable.push([
              //dataReport[i].ProcessReportName,
              dataReport[i].ItemReportName,
              {
                colSpan: 3,
                content: "",
                styles: {
                  valign: "middle",
                  halign: "center",
                  minCellHeight: picHeight,
                },
              },
              dataReport[i].ControlRange,
              dataReport[i].ResultReport,
              dataReport[i].Evaluation,
            ]);
          }

          //Check end found pic
          if (dataReport[i].ReportOrder >= 105 + countSetPic * 10) {
            if (dataReport[i].ReportOrder != 105 + countSetPic * 10) {
              i--;
            }
            countSetPic++;
            break;
          }
        }

        if (i >= dataReport.length) {
          i--;
        }
        if (dataReport[i].ReportOrder == 105 + countSetPic * 10) {
          /* if (currentY >= 190) { */
          if (currentY >= 170) {
            doc.addPage();
            currentY = 10;
          }
          /*  } else if (currentY >= 230) { */
        } else if (currentY >= 170) {
          doc.addPage();
          currentY = 10;
        }

        doc.autoTable({
          startY: currentY + 4,
          head: [
            [
              "ชิ้นงานทดสอบ",
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
          allSectionHooks: true,
          willDrawCell: function (data) {
            if (data.row.index == countSpan - 1 && data.column.index == 2) {
              //data.cell.raw = "";
            }
            if (data.column.index === 3 && data.section === "body") {
              if (
                dataBuff[data.row.index].Evaluation == "ต่ำ" ||
                dataBuff[data.row.index].Evaluation == "สูง" ||
                dataBuff[data.row.index].Evaluation == "ไม่ผ่าน"
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
          didDrawCell: function (data) {
            if (data.row.index == countSpan - 1 && data.column.index == 2) {
              //check time sign
              /* console.log(data.row.index);
              console.log(countSpan);
              console.log(dataReport[i].ResultReport); */

              try {
                let bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset\\" +
                    dataReport[i].ResultReport
                );
                doc.addImage(
                  bitmap.toString("base64"),
                  "jpg",
                  data.cell.x + 1,
                  data.cell.y + 1,
                  picWidht - 2,
                  picHeight - 2
                );
              } catch (err) {
                console.log(err);
              }
            }
          },

          theme: "grid",
        });
        currentY = doc.lastAutoTable.finalY;
      }
    }

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
