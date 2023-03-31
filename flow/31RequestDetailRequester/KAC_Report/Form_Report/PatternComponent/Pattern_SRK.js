const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.SignSet = async (dataReport, doc, currentY) => {
  try {
    console.log("SignSetSRK");
    //spans();
    var signCount = 0;
    var signWidth = 25;
    var signHeight = 14;
    var fontSize = 10;
    var cellStyle = {
      textColor: 0,
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: fontSize,
      valign: "middle",
      halign: "center",
      cellWidth: signWidth,
      //maxCellHeight: 3,
      cellPadding: 0.1,
      lineColor: 0,
      lineWidth: 0.1,
    };

    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "SRK-ER",
            colSpan: 2,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: 5,
            },
          },
        ],
      ],
      body: [
        [
          {
            content: "PRODUCTION",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              // fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: 5,
            },
          },
          {
            content: "Q.A.",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              // fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: 5,
            },
          },
        ],

        [
          {
            content: "",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: signHeight,
            },
          },
          {
            content: "",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: signHeight,
            },
          },
        ],
      ],
      columnStyles: {
        0: cellStyle,
        1: cellStyle,
      },
      theme: "grid",
      margin: { left: 40 },
    });

    var dataInTable = [
      ["Approved by", "Approved by", "Approved by", "Approved by", "Issued by"],
      [
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
      ],
      [
        dtConv.toDateOnly(dataReport[0].JPTime) || "",
        dtConv.toDateOnly(dataReport[0].DGMTime) || "",
        dtConv.toDateOnly(dataReport[0].GLTime) || "",
        dtConv.toDateOnly(dataReport[0].SubLeaderTime) || "",
        dtConv.toDateOnly(dataReport[0].InchargeTime) || "",
      ],
      [
        dataReport[0].JP || "",
        dataReport[0].DGM || "",
        dataReport[0].GL || "",
        dataReport[0].SubLeader || "",
        dataReport[0].Incharge || "",
      ],
    ];

    if (dataReport[0].Incharge == "" || dataReport[0].Incharge == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(4, 1);
      }
    } else {
      signCount++;
    }
    if (dataReport[0].SubLeader == "" || dataReport[0].SubLeader == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(3, 1);
      }
    } else {
      signCount++;
    }
    if (dataReport[0].GL == "" || dataReport[0].GL == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(2, 1);
      }
    } else {
      signCount++;
    }
    if (dataReport[0].DGM == "" || dataReport[0].DGM == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(1, 1);
      }
    } else {
      signCount++;
    }

    if (dataReport[0].JP == "" || dataReport[0].JP == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(0, 1);
      }
    } else {
      signCount++;
    }

    //Add Sign Table
    var margin = (210 - signCount * signWidth) / 2;
    // magin page left right
    if (signCount <= 2) {
      doc.autoTable({
        startY: currentY,
        head: [
          [
            {
              content: "MARKETING DEPARTMENT",
              colSpan: signCount,
              styles: {
                textColor: 0,
                halign: "center",
                valign: "middle",
                fillColor: [255, 255, 255],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: fontSize,
                cellPadding: 0.1,
                lineColor: 0,
                lineWidth: 0.1,
                minCellHeight: 5,
              },
            },
          ],
        ],
        body: dataInTable,
        columnStyles: {
          0: cellStyle,
          1: cellStyle,
          2: cellStyle,
          3: cellStyle,
          4: cellStyle,
        },
        theme: "grid",
        margin: { left: 120 },
        didDrawCell: function (data) {
          if (data.row.index == [1]) {
            //แถวรูป index 1 ใช้คำสั่งนี้เพื่อดึงค่าพิกัด xy มา plot รุปทับตาราง
            //console.log(data.cell.raw + "|" + data.column.index);
            //console.log(dataInTable[2][data.column.index]);
            //check time sign
            if (dataInTable[2][data.column.index] != "") {
              //console.log(dataInTable[2][data.column.index]);
              //console.log(dataInTable[3][data.column.index]);
              try {
                let bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset_ts\\Sign_Pic\\" +
                    dataInTable[3][data.column.index] +
                    ".jpg"
                );
                doc.addImage(
                  bitmap.toString("base64"),
                  "jpg",
                  data.cell.x + 1,
                  data.cell.y + 1,
                  signWidth - 2,
                  signHeight - 2
                );
              } catch (err) {
                //console.log(err);
              }
              /* doc.addImage(
                coinBase64Img,
                "PNG",
  
                5,
                5
              ); */
            }
          }
        },
      });
    } else {
      doc.autoTable({
        startY: currentY,
        head: [
          [
            {
              content: "MARKETING DEPARTMENT",
              colSpan: signCount,
              styles: {
                textColor: 0,
                halign: "center",
                valign: "middle",
                fillColor: [255, 255, 255],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: fontSize,
                cellPadding: 0.1,
                lineColor: 0,
                lineWidth: 0.1,
                minCellHeight: 5,
              },
            },
          ],
        ],
        body: dataInTable,
        columnStyles: {
          0: cellStyle,
          1: cellStyle,
          2: cellStyle,
          3: cellStyle,
          4: cellStyle,
        },
        theme: "grid",
        margin: { left: 95 },
        didDrawCell: function (data) {
          if (data.row.index == [1]) {
            //แถวรูป index 1 ใช้คำสั่งนี้เพื่อดึงค่าพิกัด xy มา plot รุปทับตาราง
            //console.log(data.cell.raw + "|" + data.column.index);
            //console.log(dataInTable[2][data.column.index]);
            //check time sign
            if (dataInTable[2][data.column.index] != "") {
              //console.log(dataInTable[2][data.column.index]);
              //console.log(dataInTable[3][data.column.index]);
              try {
                let bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset_ts\\Sign_Pic\\" +
                    dataInTable[3][data.column.index] +
                    ".jpg"
                );
                doc.addImage(
                  bitmap.toString("base64"),
                  "jpg",
                  data.cell.x + 1,
                  data.cell.y + 1,
                  signWidth - 2,
                  signHeight - 2
                );
              } catch (err) {
                //console.log(err);
              }
              /* doc.addImage(
              coinBase64Img,
              "PNG",

              5,
              5
            ); */
            }
          }
        },
      });
    }
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.PicSet2Pic = async (dataReport, doc, currentY) => {
  try {
    console.log("PicSet2");
    var foundData = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        foundData++;
      }
    }
    if (foundData > 0) {
      doc.addPage();
      currentY = 10;
      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: "Quality of phosphate film.",
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
          if (dataReport[j].ReportOrder != 106 + countSetPic * 10) {
            countSpan++;
          } else if (dataReport[j].ReportOrder >= 106 + countSetPic * 10) {
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
          } else {
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
          if (dataReport[i].ReportOrder >= 106 + countSetPic * 10) {
            countSetPic++;
            break;
          }
        }
        if (countSetPic != 1) {
          //alway new page
          doc.addPage();
          currentY = 10;
        }
        doc.autoTable({
          startY: currentY + 4,
          head: [
            [
              "MATERIAL",
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
            if (data.row.index >= countSpan - 2 && data.column.index == 2) {
              data.cell.raw = "";
            }
            if (data.column.index === 3 && data.section === "body") {
              if (
                dataBuff[data.row.index].Evaluation == "LOW" ||
                dataBuff[data.row.index].Evaluation == "HIGH" ||
                dataBuff[data.row.index].Evaluation == "NOT PASS" ||
                dataBuff[data.row.index].Evaluation == "NG"
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
          didDrawCell: function (data) {
            if (data.row.index >= countSpan - 2 && data.column.index == 2) {
              //check time sign
              /* console.log(data.row.index);
              console.log(countSpan);
              console.log(dataReport[i].ResultReport); */
              try {
                let bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset\\" +
                    dataBuff[data.row.index].ResultReport
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
                console.log("error pic" + err);
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
