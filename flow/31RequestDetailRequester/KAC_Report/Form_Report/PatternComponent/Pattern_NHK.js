const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.ZincNoPic = async (dataReport, doc, currentY) => {
  try {
    console.log("ZincNoPic");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Zinc phosphate coating",
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

    var dataInTable = [];
    var i = 0;
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        //find start index
        break;
      }
    }
    var dataBuff = [];
    for (i; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 105) {
        break;
      }
      dataBuff.push(dataReport[i]);
      //merge dupicate
      if (i < dataReport.length - 1 && dataReport[i + 1].ReportOrder < 105) {
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
        ["PROCESS", "CHECK ITEM", "CONTROLED RANGE", "RESULT", "EVALUATION"],
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
        maxCellHeight: 12,
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

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.ZincSet16Pic = async (dataReport, doc, currentY) => {
  try {
    console.log("ZincSet16Pic");

    doc.addPage();
    currentY = 10;

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Zinc phosphate coating",
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
    // add position pic
    currentY = doc.lastAutoTable.finalY;
    try {
      let bitmap = fs.readFileSync("C:\\SAR\\ASSET\\HNKPosPic.jpg");
      runningPic++;
      doc.addImage(
        bitmap.toString("base64"),
        "jpg",
        210 / 2 - 60 / 2,
        currentY,
        60,
        30
      );
    } catch (err) {
      console.log("error pic" + err);
    }

    currentY = currentY + 30; // add position high

    var dataInTable = [];
    var picSetData = [];
    var picHeight = 30;
    var picWidht = 40;
    var runningPic = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 110) {
        //picuter data start => 110 - 125
        picSetData.push(dataReport[i].ResultReport);
      }
    }
    //console.log(picSetData);
    //SET PIC
    dataInTable.push([
      {
        content: "A",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
      "",
    ]);
    dataInTable.push([
      {
        content: "B",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
      "",
    ]);
    dataInTable.push([
      {
        content: "C",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
      "",
    ]);
    dataInTable.push([
      {
        content: "D",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
      "",
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: [["Position", "Upper", "Outter", "Lower", "Inner"]],
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
        maxCellHeight: 12,
        //cellWidth: 17,
      },
      columnStyles: {
        0: { cellWidth: 20, fillColor: [211, 239, 240] },
        1: { cellWidth: picWidht },
        2: { cellWidth: picWidht },
        3: { cellWidth: picWidht },
        4: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (data.column.index != 0 && data.section === "body") {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" + picSetData[runningPic]
            );
            runningPic++;
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
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.ZincSet3Pic = async (dataReport, doc, currentY) => {
  try {
    console.log("ZincSet3Pic");

    if (currentY > 297 - 80) {
      doc.addPage();
      currentY = 10;
    }

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Position on spring for evaluate",
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
    // add position pic
    currentY = doc.lastAutoTable.finalY;

    var dataInTable = [];
    var picSetData = [];
    var picHeight = 30;
    var picWidht = 40;
    var runningPic = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 110) {
        //picuter data start => 110 - 125
        picSetData.push(dataReport[i].ResultReport);
      }
    }
    //console.log(picSetData);
    //SET PIC
    dataInTable.push([
      {
        content: "",
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
      startY: currentY + 4,
      head: [["TOP", "CENTER", "BOTTOM"]],
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
        maxCellHeight: 12,
        //cellWidth: 17,
      },
      columnStyles: {
        0: { cellWidth: picWidht },
        1: { cellWidth: picWidht },
        2: { cellWidth: picWidht },
        3: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (data.section === "body") {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" + picSetData[runningPic]
            );
            runningPic++;
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            runningPic++;
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
