const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");
const Pattern_Doc = require("./Pattern_5MasterDoc");
const { isFloat32Array } = require("util/types");

exports.SamBefore = async (dataReport, doc, currentY) => {
  try {
    var i = 0;
    var countData = 0;
    var countSetData = 0;
    var indexEnd = 0;
    for (var i = 0; i < dataReport.length; i++) {
      countData++;
      if (
        dataReport[i].ReportOrder == 18 ||
        dataReport[i].ResultReport == "N/A"
      ) {
        indexEnd = i;
        break;
      }
    }
    countSetData = countData / 3;

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Sample before drawing",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 1,
              maxCellHeight: 12,
              //cellWidth: 33,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;
    console.log(indexEnd);
    var dataInTable = [];

    for (i = 0; i < indexEnd; i = i + 3) {
      try {
        var countSum = 0;
        var sumData = 0;
        if (dataReport[i].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i].ResultReport);
          countSum++;
        }
        if (dataReport[i + 1].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 1].ResultReport);
          countSum++;
        }
        if (dataReport[i + 2].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 2].ResultReport);
          countSum++;
        }

        var buff;
        buff = (sumData / countSum).toFixed(2);
        // can mean
        if (isNaN(buff) == false) {
          if (i == 0) {
            dataInTable.push([
              {
                rowSpan: 3,
                content: dataReport[i].ProcessReportName,
              },
              {
                rowSpan: countData,
                content: dataReport[0].ControlRange,
              },
              dataReport[i].ResultReport,
              {
                rowSpan: 3,
                content: buff,
              },
              {
                rowSpan: 3,
                content: dataReport[i].Evaluation,
              },
            ]);
            dataInTable.push([dataReport[i + 1].ResultReport]);
            dataInTable.push([dataReport[i + 2].ResultReport]);
          } else {
            dataInTable.push([
              {
                rowSpan: 3,
                content: dataReport[i].ProcessReportName,
              },
              dataReport[i].ResultReport,
              {
                rowSpan: 3,
                content: buff,
              },
              {
                rowSpan: 3,
                content: dataReport[i].Evaluation,
              },
            ]);
            dataInTable.push([dataReport[i + 1].ResultReport]);
            dataInTable.push([dataReport[i + 2].ResultReport]);
          }
        }
        //can't
        else {
          if (i == 0) {
            dataInTable.push([
              {
                rowSpan: 3,
                content: dataReport[i].ProcessReportName,
              },
              {
                rowSpan: countData,
                content: dataReport[0].ControlRange,
              },
              dataReport[i].ResultReport,
              {
                rowSpan: 3,
                content: "-",
              },
              {
                rowSpan: 3,
                content: dataReport[i].Evaluation,
              },
            ]);
            dataInTable.push([dataReport[i + 1].ResultReport]);
            dataInTable.push([dataReport[i + 2].ResultReport]);
          } else {
            dataInTable.push([
              {
                rowSpan: 3,
                content: dataReport[i].ProcessReportName,
              },
              dataReport[i].ResultReport,
              {
                rowSpan: 3,
                content: "-",
              },
              {
                rowSpan: 3,
                content: dataReport[i].Evaluation,
              },
            ]);
            dataInTable.push([dataReport[i + 1].ResultReport]);
            dataInTable.push([dataReport[i + 2].ResultReport]);
          }
        }
      } catch (err) {
        console.log(i);
        console.log(err);
      }
    }
    doc.autoTable({
      startY: currentY,
      head: [
        [
          "Sample",
          "Control range (g/m²)",
          "Result (g/m²)",
          "Result Average (g/m²)",
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
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
        cellPadding: 0.3,
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
        maxCellHeight: 10,
        cellPadding: 0.3,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { fillColor: [211, 239, 240] /* cellWidth: 25 */ },
        1: {
          /*  cellWidth: 25  */
        },
        /* 2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 }, */
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

exports.SamAfter = async (dataReport, doc, currentY) => {
  try {
    var i = 0;
    var indexEnd = 0;
    var indexStart = 0;
    for (var i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder == 51) {
        indexStart = i;
      }
      if (
        dataReport[i].ReportOrder >= 51 &&
        (dataReport[i].ReportOrder == 104 ||
          dataReport[i].ResultReport == "N/A")
      ) {
        indexEnd = i;
        break;
      }
    }

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Sample after drawing",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 1,
              maxCellHeight: 12,
              //cellWidth: 33,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;

    var dataInTable = [];

    for (i = indexStart; i < indexEnd; i = i + 9) {
      try {
        /* var buff, buff2, buff3;
        buff = (
          (parseFloat(dataReport[i].ResultReport) +
            parseFloat(dataReport[i + 3].ResultReport) +
            parseFloat(dataReport[i + 6].ResultReport)) /
          3
        ).toFixed(2);
        buff2 = (
          (parseFloat(dataReport[i + 1].ResultReport) +
            parseFloat(dataReport[i + 4].ResultReport) +
            parseFloat(dataReport[i + 7].ResultReport)) /
          3
        ).toFixed(2);
        buff3 = (
          (parseFloat(dataReport[i + 2].ResultReport) +
            parseFloat(dataReport[i + 5].ResultReport) +
            parseFloat(dataReport[i + 8].ResultReport)) /
          3
        ).toFixed(2); */
        var countSum = 0;
        var sumData = 0;
        if (dataReport[i].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i].ResultReport);
          countSum++;
        }
        if (dataReport[i + 3].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 3].ResultReport);
          countSum++;
        }
        if (dataReport[i + 6].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 6].ResultReport);
          countSum++;
        }
        var buff;
        buff = (sumData / countSum).toFixed(2);

        countSum = 0;
        sumData = 0;
        if (dataReport[i + 1].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 1].ResultReport);
          countSum++;
        }
        if (dataReport[i + 4].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 4].ResultReport);
          countSum++;
        }
        if (dataReport[i + 7].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 7].ResultReport);
          countSum++;
        }
        var buff2;
        buff2 = (sumData / countSum).toFixed(2);

        countSum = 0;
        sumData = 0;
        if (dataReport[i + 2].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 2].ResultReport);
          countSum++;
        }
        if (dataReport[i + 5].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 5].ResultReport);
          countSum++;
        }
        if (dataReport[i + 8].ResultReport != "-") {
          sumData = sumData + parseFloat(dataReport[i + 8].ResultReport);
          countSum++;
        }
        var buff3;
        buff3 = (sumData / countSum).toFixed(2);

        // can mean
        if (isNaN(buff) == false) {
          dataInTable.push([
            {
              rowSpan: 3,
              content: dataReport[i].ProcessReportName,
            },

            dataReport[i].ResultReport,

            {
              rowSpan: 3,
              content: buff,
            },
            dataReport[i + 1].ResultReport,
            {
              rowSpan: 3,
              content: buff2,
            },
            dataReport[i + 2].ResultReport,
            {
              rowSpan: 3,
              content: buff3,
            },
          ]);
          dataInTable.push([
            dataReport[i + 3].ResultReport,
            dataReport[i + 4].ResultReport,
            dataReport[i + 5].ResultReport,
          ]);
          dataInTable.push([
            dataReport[i + 6].ResultReport,
            dataReport[i + 7].ResultReport,
            dataReport[i + 8].ResultReport,
          ]);
        }
        //can't
        else {
          dataInTable.push([
            {
              rowSpan: 3,
              content: dataReport[i].ProcessReportName,
            },

            dataReport[i].ResultReport,

            {
              rowSpan: 3,
              content: "-",
            },
            dataReport[i + 1].ResultReport,
            {
              rowSpan: 3,
              content: "-",
            },
            dataReport[i + 2].ResultReport,
            {
              rowSpan: 3,
              content: "-",
            },
          ]);
          dataInTable.push([
            dataReport[i + 3].ResultReport,
            dataReport[i + 4].ResultReport,
            dataReport[i + 5].ResultReport,
          ]);
          dataInTable.push([
            dataReport[i + 6].ResultReport,
            dataReport[i + 7].ResultReport,
            dataReport[i + 8].ResultReport,
          ]);
        }
      } catch (err) {
        console.log(i);
        console.log(err);
      }
    }
    doc.autoTable({
      startY: currentY,
      head: [
        [
          { rowSpan: 2, content: "Sample" },
          { colSpan: 6, content: "Control range (g/m²)" },
        ],
        [
          "Stearate Film",
          "Average",
          "Metal soap Film ",
          "Average",
          "Phosphate Film ",
          "Average",
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
        maxCellHeight: 10,
        cellPadding: 0.3,
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
        maxCellHeight: 10,
        cellPadding: 0.3,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { fillColor: [211, 239, 240] /* cellWidth: 25 */ },
        1: {
          /*  cellWidth: 25  */
        },
        /* 2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 }, */
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

exports.Sem = async (dataReport, doc, currentY) => {
  try {
    if (currentY >= 150) {
      currentY = await Pattern_Doc.addPage(doc);
    }
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Result SEM",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 1,
              maxCellHeight: 12,
              cellWidth: 20,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;
    var dataInTable = [];
    var i = 0;
    //find data
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder == 111) {
        break;
      }
    }
    var picHeight = 60;
    var picWidth = 75;

    dataInTable.push([
      dataReport[i].ProcessReportName,
      {
        content: "",
        styles: {
          minCellHeight: picHeight,
        },
      },
      {
        content: "",
        styles: {
          minCellHeight: picHeight,
        },
      },
    ]);
    if (dataReport[i + 1].ResultReport != "N/A") {
      dataInTable.push([
        dataReport[i + 1].ProcessReportName,
        {
          content: "",
          styles: {
            minCellHeight: picHeight,
          },
        },
        {
          content: "",
          styles: {
            minCellHeight: picHeight,
          },
        },
      ]);
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        [
          { rowSpan: 2, content: "Sample" },
          { colSpan: 2, content: "Result SEM" },
        ],
        ["Sample before drawing", "Sample after drawing"],
      ],
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 15,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
        cellPadding: 0.3,
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
      },
      columnStyles: {
        1: { cellWidth: picWidth },
        2: { cellWidth: picWidth },
      },

      didDrawCell: function (data) {
        if (data.column.index == 1 && data.section === "body") {
          try {
            var bitmap;
            try {
              bitmap = fs.readFileSync(
                "C:\\AutomationProject\\SAR\\asset\\" +
                dataReport[i + data.row.index].ResultReport
              );
              // console.log(dataReport[i + data.row.index].ResultReport);
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
        if (data.column.index == 2 && data.section === "body") {
          try {
            var bitmap;
            try {
              // รอบแรกจะใช้ i + data.row.index เพื่อให้ค่า index ตรงกับลำดับแถวที่ถูกต้อง
              // รอบที่สองจะใช้ i + 1 + data.row.index เพื่อดึงรูปจาก index ที่ต่างออกไป
              if (data.row.index % 2 == 0) {
                // รอบแรก
                bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset\\" +
                  dataReport[i + 2 + data.row.index].ResultReport
                );
                console.log(dataReport[i + 2 + data.row.index].ResultReport);
              } else {
                // รอบที่สอง
                bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset\\" +
                  dataReport[i + 2 + data.row.index].ResultReport
                );
                console.log(dataReport[i + 2 + data.row.index].ResultReport);
              }
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
            console.log("error pic: " + err);
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
