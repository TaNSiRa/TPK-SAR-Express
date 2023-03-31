const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");
const Pattern_Doc = require("./Pattern_5MasterDoc");
const { isFloat32Array } = require("util/types");

exports.CoatingPre = async (dataReport, doc, currentY) => {
  try {
    console.log("Coat_PreSIW");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Coating performance",
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
              cellWidth: 33,
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
    //find data
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        break;
      }
    }
    startIndex = i;
    /* dataInTable.push([
      {
        rowSpan: 2,
        content: "Worpieces",
      },
      { rowSpan: 2, content: "Check Item" },
      { rowSpan: 2, content: "Control Range" },
      {
        colSpan: 4,
        content: "Results",
      },
      { rowSpan: 2, content: "Evalutation" },
    ]);
    dataInTable.push([
      {
        content: "N1",
      },
      {
        content: "N2",
      },
      {
        content: "N3",
      },
      {
        content: "Average",
      },
    ]); */
    for (i; i < dataReport.length; i = i + 3) {
      try {
        var buff;

        buff = (
          (parseFloat(dataReport[i].ResultReport) +
            parseFloat(dataReport[i + 1].ResultReport) +
            parseFloat(dataReport[i + 2].ResultReport)) /
          3
        ).toFixed(2);
        if (isNaN(buff) == false) {
          dataInTable.push([
            dataReport[i].ProcessReportName,
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i + 1].ResultReport,
            dataReport[i + 2].ResultReport,
            buff,
            dataReport[i].Evaluation,
          ]);
        } else {
          dataInTable.push([
            dataReport[i].ProcessReportName,
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i + 1].ResultReport,
            dataReport[i + 2].ResultReport,
            "N/A",
            "N/A",
          ]);
        }
        buffEva.push();
      } catch (err) {
        console.log(i);
        console.log(err);
      }
    }
    /* 
    dataInTable.push([
      {
        rowSpan: 2,
        content: dataReport[i + 1].ItemReportName,
      },
      {
        content: "Top",
      },
      {
        rowSpan: 2,
        content: dataReport[i + 1].ControlRange,
      },
      {
        content: dataReport[i + 1].ResultReport,
      },
      {
        content: dataReport[i + 1].Evaluation,
      },
    ]);

    dataInTable.push([
      {
        content: "Bottom",
      },
      {
        content: dataReport[i + 2].ResultReport,
      },
      {
        content: dataReport[i + 2].Evaluation,
      },
    ]); */

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            rowSpan: 2,
            content: "Worpieces",
          },
          { rowSpan: 2, content: "Check Item" },
          { rowSpan: 2, content: "Control Range" },
          {
            colSpan: 4,
            content: "Results",
          },
          {
            rowSpan: 2,
            content: "Evalutation",
            styles: { fontSize: 8 },
          },
        ],
        [
          {
            content: "N1",
          },
          {
            content: "N2",
          },
          {
            content: "N3",
          },
          {
            content: "Average",
            styles: { fontSize: 12 },
          },
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
        0: { fillColor: [211, 239, 240], cellWidth: 45 },
        1: {
          cellWidth: 35,
        },
        /* 2: { cellWidth: 20 }, */
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 },
      },
      willDrawCell: function (data) {
        if (data.column.index === 7 && data.section === "body") {
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

exports.Big2Sem = async (dataReport, doc, currentY) => {
  try {
    console.log("Big2Sem");

    currentY = await Pattern_Doc.addPage(doc);

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Flim quality",
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
              cellWidth: 20,
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
    //find data
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder == 105) {
        break;
      }
    }
    var picHeight = 65;
    var picWidth = 91;

    dataInTable.push([
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

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [["TOP X 500", "BOTTOM X 500"]],
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
      },
      columnStyles: {
        0: { cellWidth: picWidth },
        1: { cellWidth: picWidth },
      },
      didDrawCell: function (data) {
        if (
          data.column.index == 0 &&
          data.row.index === 0 &&
          data.section === "body"
        ) {
          try {
            var bitmap;
            try {
              bitmap = fs.readFileSync(
                "C:\\AutomationProject\\SAR\\asset\\" +
                  dataReport[i].ResultReport
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
        if (
          data.column.index == 1 &&
          data.row.index == 0 &&
          data.section === "body"
        ) {
          try {
            var bitmap;
            try {
              bitmap = fs.readFileSync(
                "C:\\AutomationProject\\SAR\\asset\\" +
                  dataReport[i + 1].ResultReport
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

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      head: [["**REMARK : " + dataReport[i + 2].ResultReport]],
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        //fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 12,
        cellPadding: 1,
        /*         lineColor: 0,
        lineWidth: 0.1, */
        maxCellHeight: 12,
      },

      theme: "plain",
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
    var countHeader = 0;
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
