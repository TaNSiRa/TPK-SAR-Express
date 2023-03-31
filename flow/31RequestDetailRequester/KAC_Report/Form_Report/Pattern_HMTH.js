const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");

async function FindPercent(x1, x2) {
  try {
    return Math.round((x1 / x2) * 100);
  } catch (e) {
    return "N/A";
  }
}
async function FindEvaluate(x1, SP) {
  try {
    if (x1 > SP) {
      return "PASS";
    } else {
      return "NOT PASS";
    }
  } catch (e) {
    return "N/A";
  }
}

exports.CreatePDF = async (dataReport) => {
  try {
    console.log("HMTH");
    // add data %
    var indexReportOrderCheck = [8, 20, 32, 44, 56, 68, 80, 92, 104];
    for (var i = 0; i < dataReport.length - 2; i) {
      //- 2 data last
      if (indexReportOrderCheck.includes(dataReport[i].ReportOrder)) {
        //splice แทรกค่าไปเรื่อยๆเลยเริ่มตัวสุดท้ายก่อน
        for (let j = 0; j < 4; j++) {
          let reBuff = 0;
          reBuff = await FindPercent(
            dataReport[i - j].ResultReport,
            dataReport[i - j - 4].ResultReport
          );
          let evaBuff = 0;
          if (j <= 1) {
            //V Coating > 50
            evaBuff = await FindEvaluate(reBuff, 50);
          } else {
            //Zr Coating > 90
            evaBuff = await FindEvaluate(reBuff, 90);
          }
          dataReport.splice(i + 1, 0, {
            ResultReport: reBuff,
            Evaluation: evaBuff,
          });
        }
        i = i + 4;
      } else {
        i++;
      }
    }

    var dataAvg = [0, 0, 0, 0, 0, 0];

    for (let i = 0; i < dataReport.length - 2; i++) {
      if (i % 12 == 0 || i % 12 == 1) {
        dataAvg[0] =
          parseFloat(dataAvg[0]) + parseFloat(dataReport[i].ResultReport);
      } else if (i % 12 == 2 || i % 12 == 3) {
        dataAvg[1] =
          parseFloat(dataAvg[1]) + parseFloat(dataReport[i].ResultReport);
      } else if (i % 12 == 4 || i % 12 == 5) {
        dataAvg[2] =
          parseFloat(dataAvg[2]) + parseFloat(dataReport[i].ResultReport);
      } else if (i % 12 == 6 || i % 12 == 7) {
        dataAvg[3] =
          parseFloat(dataAvg[3]) + parseFloat(dataReport[i].ResultReport);
      } else if (i % 12 == 8 || i % 12 == 9) {
        dataAvg[4] =
          parseFloat(dataAvg[4]) + parseFloat(dataReport[i].ResultReport);
      } else if (i % 12 == 10 || i % 12 == 11) {
        dataAvg[5] =
          parseFloat(dataAvg[5]) + parseFloat(dataReport[i].ResultReport);
      }
    }

    var doc = new jsPDF("l", "mm", "a4"); // defualt unit mm.
    var currentY = 0;
    var buffDoc;
    //Header Set
    buffDoc = await HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //P1 Set
    buffDoc = await P1(dataReport, doc, currentY, dataAvg);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //P2
    buffDoc = await P2(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //P3
    buffDoc = await P3(dataReport, doc, currentY, dataAvg);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    // signset
    currentY = 155;
    buffDoc = await SignSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Document Code
    doc = await Pattern_Doc.MasterWeeklyDocument(doc);

    await doc.save(
      "C:\\AutomationProject\\SAR\\asset_ts\\Report\\KAC\\" +
        dataReport[0].ReqNo +
        ".pdf"
    );

    console.log("end SavePDF");

    //console.log(doc.output('datauristring'));
    var bitmap = fs.readFileSync(
      "C:\\AutomationProject\\SAR\\asset_ts\\Report\\KAC\\" +
        dataReport[0].ReqNo +
        ".pdf"
    );
    // convert binary data to base64 encoded string
    //console.log(doc.output());
    //return doc.output();
    //doc.output("dataurlstring", "name");
    return bitmap.toString("base64");
  } catch (err) {
    console.log(err);
    return err;
  }
};

async function HeaderSet(dataReport, doc) {
  try {
    var currentY = 10;
    console.log("HEADER MARELLI");

    //Add Customer Name
    var custHigh = 20;
    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "MESSRS : " + dataReport[0].CustFull,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "top",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 15,
              cellPadding: 0.5,
            },
          },
        ],
        [
          {
            content: "(Single Coating Process)",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "top",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 15,
              cellPadding: 0.5,
            },
          },
        ],
        [
          {
            content:
              "We would like to report you about the results of quality checking of your pretreatment line (initial and after water resistance 72 Hrs.)The checked results were shown as table below.",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "top",
              font: "THSarabun",
              fontStyle: "normal",
              fontSize: 12,
              cellPadding: 0.5,
            },
          },
        ],
        [
          {
            content:
              "Sampling Date        :   " +
              dtget.toDateOnly(dataReport[0].SamplingDate),
            styles: {
              textColor: 0,
              halign: "center",
              valign: "top",
              font: "THSarabun",
              fontStyle: "normal",
              fontSize: 12,
              cellPadding: 0.2,
            },
          },
        ],
        [
          {
            content:
              "Report Making Date :   " +
              dtget.toDateOnly(dataReport[0].SamplingDate),
            styles: {
              textColor: 0,
              halign: "center",
              valign: "top",
              font: "THSarabun",
              fontStyle: "normal",
              fontSize: 12,
              cellPadding: 0.2,
            },
          },
        ],
      ],
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;

    //Add Logo
    var picHigh = 12;
    var picWidth = 25;
    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(bitmap.toString("base64"), "JPG", 220, 10, picWidth, picHigh);
    //currentY = currentY + picHigh;

    doc.autoTable({
      startY: 10,
      head: [
        [
          {
            content: "THAI PARKERIZING CO.,LTD.",
            styles: {
              textColor: 0,
              halign: "right",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.2,
              maxCellHeight: 12,
            },
          },
        ],
        [
          {
            content: "TECHNICAL DEPT.",
            styles: {
              textColor: 0,
              halign: "right",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.2,
              maxCellHeight: 12,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    //text
    //currentY = doc.lastAutoTable.finalY;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function P1(dataReport, doc, currentY, dataAvg) {
  /* let DataSet = async (dataReport, CurrentRound, doc, currentY) => { */
  console.log("HMTHDataSet");
  try {
    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "1. Coating weight result",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 1,
              maxCellHeight: 12,
            },
          },
        ],
      ],
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;
    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content:
              "Result of Zr and V Coating Weight on Tube Samples Initial and after water resistance 72 Hrs",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "normal",
              fontSize: 12,
              cellPadding: 1,
              maxCellHeight: 12,
            },
          },
        ],
      ],
      theme: "plain",
    });

    var dataInHeader = [];

    var headerStyle = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 16,
    };
    dataInHeader = [
      [
        {
          rowSpan: 3,
          content: "Model",
        },
        {
          rowSpan: 3,
          content: "Tube\n(A-B-C)",
        },
        {
          rowSpan: 3,
          content: "Position",
        },
        {
          colSpan: 4,
          content: "Initial evaporator",
        },
        {
          colSpan: 4,
          content: "After water resistance",
        },
        {
          colSpan: 4,
          content: "% Remain",
        },
      ],
      [
        {
          colSpan: 2,
          content: "Zr coating\n[STD:20-118 mg/m²]",
        },
        {
          colSpan: 2,
          content: "V coating\n[STD:8-44 mg/m²]",
        },
        {
          colSpan: 2,
          content: "Zr coating",
        },
        {
          colSpan: 2,
          content: "V coating",
        },
        {
          colSpan: 2,
          content: "Zr coating\n[STD : >90%]",
        },
        {
          colSpan: 2,
          content: "V coating\n[STD : >50%]",
        },
      ],
      [
        "A side",
        "B side",
        "A side",
        "B side",
        "A side",
        "B side",
        "A side",
        "B side",
        "A side",
        "B side",
        "A side",
        "B side",
      ],
    ];

    var dataInTable = [];
    var rowIndex = 0;
    var positionRow = [
      "Top",
      "Center",
      "Bottom",
      "Top",
      "Center",
      "Bottom",
      "Top",
      "Center",
      "Bottom",
    ];
    for (let i = 0; i < dataReport.length - 2; i) {
      if (i == 0) {
        dataInTable.push([
          {
            rowSpan: 9,
            /* content: dataReport[0].ProcessReportName, */
            content: "H60A",
          },
          {
            rowSpan: 3,
            content: "A",
          },
          {
            content: positionRow[rowIndex],
          },
        ]);
        for (let j = 0; j < 12; j++) {
          if (j < 8) {
            //init-after

            dataInTable[rowIndex].push(
              Math.round(dataReport[i + j].ResultReport)
            );
          } else {
            //%remain
            dataInTable[rowIndex].push(dataReport[i + j].ResultReport + "%");
          }
        }
        rowIndex++;
        i = i + 12;
      } else if (rowIndex % 3 == 0) {
        if (rowIndex == 3) {
          dataInTable.push([
            {
              rowSpan: 3,
              content: "B",
            },
            {
              content: positionRow[rowIndex],
            },
          ]);
        } else if (rowIndex == 6) {
          dataInTable.push([
            {
              rowSpan: 3,
              content: "C",
            },
            {
              content: positionRow[rowIndex],
            },
          ]);
        }
        for (let j = 0; j < 12; j++) {
          if (j < 8) {
            //init-after

            dataInTable[rowIndex].push(
              Math.round(dataReport[i + j].ResultReport)
            );
          } else {
            //%remain
            dataInTable[rowIndex].push(dataReport[i + j].ResultReport + "%");
          }
        }
        rowIndex++;
        i = i + 12;
      } else {
        dataInTable.push([
          {
            content: positionRow[rowIndex],
          },
        ]);
        for (let j = 0; j < 12; j++) {
          if (j < 8) {
            //init-after

            dataInTable[rowIndex].push(
              Math.round(dataReport[i + j].ResultReport)
            );
          } else {
            //%remain
            dataInTable[rowIndex].push(dataReport[i + j].ResultReport + "%");
          }
        }
        rowIndex++;
        i = i + 12;
      }
    }

    // average data

    dataInTable.push([
      {
        colSpan: 3,
        content: "Average",
        styles: {
          fillColor: [211, 239, 240],
        },
      },
    ]);

    for (let i = 0; i < 6; i++) {
      dataAvg[i] = Math.round(dataAvg[i] / 18);
      if (i < 4) {
        dataInTable[dataInTable.length - 1].push({
          colSpan: 2,
          content: dataAvg[i],
          styles: {
            fillColor: [211, 239, 240],
          },
        });
      } else {
        {
          dataInTable[dataInTable.length - 1].push({
            colSpan: 2,
            content: dataAvg[i] + "%",
            styles: {
              fillColor: [211, 239, 240],
            },
          });
        }
      }
    }

    var cellDataWidth = 18;
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: dataInHeader,
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 13,
        lineColor: 0,
        lineWidth: 0.1,
        //minCellHeight: 10,
        maxCellHeight: 10,
      },
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 11,
        cellPadding: 0.9,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        //0: { fillColor: [211, 239, 240] },
        1: { cellWidth: 18 },
        2: { cellWidth: 18 },

        3: { cellWidth: cellDataWidth },
        4: { cellWidth: cellDataWidth },
        5: { cellWidth: cellDataWidth },
        6: { cellWidth: cellDataWidth },
        7: { cellWidth: cellDataWidth },
        8: { cellWidth: cellDataWidth },
        9: { cellWidth: cellDataWidth },
        10: { cellWidth: cellDataWidth },
        11: { cellWidth: cellDataWidth },
        12: { cellWidth: cellDataWidth },
        13: { cellWidth: cellDataWidth },
        14: { cellWidth: cellDataWidth },
        15: { cellWidth: cellDataWidth },
      },
      willDrawCell: function (data) {
        if (
          data.column.index >= 3 &&
          data.section === "body" &&
          data.row.index < 9
        ) {
          let indexData = data.column.index - 3 + data.row.index * 12;
          if (
            dataReport[indexData].Evaluation == "LOW" ||
            dataReport[indexData].Evaluation == "HIGH" ||
            dataReport[indexData].Evaluation == "NOT PASS" ||
            dataReport[indexData].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
      },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content:
              "* (This sample is Evaporator’s tube and was checked by XRF method.)",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "normal",
              fontSize: 12,
              cellPadding: 1,
              maxCellHeight: 12,
            },
          },
        ],
      ],
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    conso;
    le.log(err);
    return err;
  }
}

async function P2(dataReport, doc, currentY) {
  try {
    console.log("P2HNTH");
    doc.addPage("a4", "landscape");
    currentY = 10;
    var dataInTable = [];
    var indexStart = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        indexStart = i;
        break;
      }
    }

    dataInTable.push([
      { rowSpan: 2, content: dataReport[indexStart].ProcessReportName },
      dataReport[indexStart].ItemReportName,
      dataReport[indexStart].ControlRange,
      dataReport[indexStart].ResultReport,
      dataReport[indexStart].Evaluation,
    ]);
    dataInTable.push([
      dataReport[indexStart + 1].ItemReportName,
      dataReport[indexStart + 1].ControlRange,
      dataReport[indexStart + 1].ResultReport,
      dataReport[indexStart + 1].Evaluation,
    ]);

    doc.autoTable({
      startY: currentY + 4,
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
        0: { cellWidth: 40, fillColor: [211, 239, 240] },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      margin: { left: 60 },
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
    currentY = doc.lastAutoTable.finalY + 4;

    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "Remark: Position of prepared sample",
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
            },
          },
        ],
      ],
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;

    var bitmap = fs.readFileSync("C:\\SAR\\asset\\HMTH.jpg");
    doc.addImage(bitmap.toString("base64"), "JPG", 70, currentY + 10, 150, 120);

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function P3(dataReport, doc, currentY, dataAvg) {
  try {
    console.log("P3HNTH");
    doc.addPage("a4", "landscape");
    currentY = 10;

    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "2. Conclusion",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 1,
              maxCellHeight: 12,
            },
          },
        ],
      ],
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;

    var dataInHeader = [];

    dataInHeader = [
      [
        {
          rowSpan: 2,
          content: "",
        },
        {
          rowSpan: 2,
          colSpan: 2,
          content: "Model",
        },
        {
          colSpan: 2,
          content: "Zirconium-Coating",
        },
        {
          colSpan: 2,
          content: "Vanadium-Coating",
        },
      ],
      [
        "Initial evaporator\n(Std.: 20-118 mg/m²)",
        "% Remain\nAfter Water resistance\n72 Hrs.(Std.: >90%)",
        "Initial evaporator\n(Std.: 8-44 mg/m²)",
        "% Remain\nAfter Water resistance\n72 Hrs.(Std.: >50%)",
      ],
    ];

    var dataInTable = [];
    var evaSet1 = ["Pass", "Pass", "Pass", "Pass"];
    if (dataAvg[0] > 20 && dataAvg[0] < 118) {
      evaSet1[0] = "Pass";
    } else {
      evaSet1[0] = "Not Pass";
    }
    if (dataAvg[4] > 90) {
      evaSet1[1] = "Pass";
    } else {
      evaSet1[1] = "Not Pass";
    }
    if (dataAvg[1] > 8 && dataAvg[1] < 44) {
      evaSet1[2] = "Pass";
    } else {
      evaSet1[2] = "Not Pass";
    }
    if (dataAvg[5] > 50) {
      evaSet1[3] = "Pass";
    } else {
      evaSet1[3] = "Not Psss";
    }
    var evaSet2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < dataReport.length - 2; i++) {
      if (i % 12 == 0 || i % 12 == 1) {
        if (dataReport[i].ResultReport < 20) {
          //low
          evaSet2[0] = evaSet2[0] + 1;
        } else if (dataReport[i].ResultReport > 188) {
          //high
          evaSet2[8] = evaSet2[8] + 1;
        } else {
          //pass
          evaSet2[4] = evaSet2[4] + 1;
        }
      } else if (i % 12 == 8 || i % 12 == 9) {
        if (dataReport[i].ResultReport < 90) {
          //low
          evaSet2[1] = evaSet2[1] + 1;
        } else {
          //pass
          evaSet2[5] = evaSet2[5] + 1;
        }
      } else if (i % 12 == 2 || i % 12 == 3) {
        if (dataReport[i].ResultReport < 8) {
          //low
          evaSet2[2] = evaSet2[2] + 1;
        } else if (dataReport[i].ResultReport > 44) {
          //high
          evaSet2[10] = evaSet2[10] + 1;
        } else {
          //pass
          evaSet2[6] = evaSet2[6] + 1;
        }
      } else if (i % 12 == 10 || i % 12 == 11) {
        if (dataReport[i].ResultReport < 50) {
          //low
          evaSet2[3] = evaSet2[3] + 1;
        } else {
          //pass
          evaSet2[7] = evaSet2[7] + 1;
        }
      }
    }

    for (let j = 0; j < 12; j++) {
      if (evaSet2[j] == 0) {
        evaSet2[j] = "-";
      } else {
        evaSet2[j] = evaSet2[j].toString() + "/18";
      }
    }

    dataInTable.push([
      {
        rowSpan: 2,
        content: "By Coating weight\n(Average)",
      },
      {
        rowSpan: 2,
        colSpan: 2,
        content: "H60A",
      },
      dataAvg[0],
      dataAvg[4] + "%",
      dataAvg[1],
      dataAvg[5] + "%",
    ]);
    dataInTable.push([evaSet1[0], evaSet1[1], evaSet1[2], evaSet1[3]]);

    dataInTable.push([
      {
        rowSpan: 3,
        content: "By Position of sample",
      },
      {
        rowSpan: 3,
        content: "H60A",
      },
      "Low",
      evaSet2[0],
      evaSet2[1],
      evaSet2[2],
      evaSet2[3],
    ]);
    dataInTable.push(["Pass", evaSet2[4], evaSet2[5], evaSet2[6], evaSet2[7]]);
    dataInTable.push([
      "High",
      evaSet2[8],
      evaSet2[9],
      evaSet2[10],
      evaSet2[11],
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: dataInHeader,
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 13,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
      },
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 11,
        cellPadding: 0.9,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 40, fillColor: [211, 239, 240] },
        //1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
        5: { cellWidth: 40 },
        6: { cellWidth: 40 },
      },
      //margin: { left: 60 },
      willDrawCell: function (data) {
        if (data.row.index === 1 && data.section === "body") {
          if (
            data.cell.raw == "LOW" ||
            data.cell.raw == "HIGH" ||
            data.cell.raw == "NOT PASS" ||
            data.cell.raw == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
        if (
          (data.row.index === 2 || data.row.index === 4) &&
          data.section === "body" &&
          data.column.index > 2
        ) {
          if (data.cell.raw != "-") {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
      },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    dataInTable = [];
    if (dataReport[0].Comment1 != "" && dataReport[0].Comment1 != null) {
      dataInTable.push([dataReport[0].Comment1]);
    }
    if (dataReport[0].Comment2 != "" && dataReport[0].Comment2 != null) {
      dataInTable.push([dataReport[0].Comment2]);
    }
    if (dataReport[0].Comment3 != "" && dataReport[0].Comment3 != null) {
      dataInTable.push([dataReport[0].Comment3]);
    }
    if (dataReport[0].Comment4 != "" && dataReport[0].Comment4 != null) {
      dataInTable.push([dataReport[0].Comment4]);
    }
    if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
      dataInTable.push([dataReport[0].Comment5]);
    }
    if (dataReport[0].Comment6 != "" && dataReport[0].Comment6 != null) {
      dataInTable.push([dataReport[0].Comment6]);
    }
    if (dataReport[0].Comment7 != "" && dataReport[0].Comment7 != null) {
      dataInTable.push([dataReport[0].Comment7]);
    }
    if (dataReport[0].Comment8 != "" && dataReport[0].Comment8 != null) {
      dataInTable.push([dataReport[0].Comment8]);
    }
    if (dataReport[0].Comment9 != "" && dataReport[0].Comment9 != null) {
      dataInTable.push([dataReport[0].Comment9]);
    }
    if (dataReport[0].Comment10 != "" && dataReport[0].Comment10 != null) {
      dataInTable.push([dataReport[0].Comment10]);
    }
    if (dataInTable.length > 0) {
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
          //cellWidth: 17,
        },

        theme: "plain",
      });
    }

    currentY = doc.lastAutoTable.finalY;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function SignSet(dataReport, doc, currentY) {
  try {
    console.log("SignSetHMTH");
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
      cellPadding: 0.1,
      lineColor: 0,
      lineWidth: 0.1,
    };
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
        dtget.toDateOnly(dataReport[0].JPTime) || "",
        dtget.toDateOnly(dataReport[0].DGMTime) || "",
        dtget.toDateOnly(dataReport[0].GLTime) || "",
        dtget.toDateOnly(dataReport[0].SubLeaderTime) || "",
        dtget.toDateOnly(dataReport[0].InchargeTime) || "",
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
    var margin = (297 - signCount * signWidth) / 2;
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
        margin: { left: margin },
        didDrawCell: function (data) {
          if (data.row.index == [1]) {
            if (dataInTable[2][data.column.index] != "") {
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
              } catch (err) {}
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
        margin: { left: margin },
        didDrawCell: function (data) {
          if (data.row.index == [1]) {
            if (dataInTable[2][data.column.index] != "") {
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
              } catch (err) {}
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
}
