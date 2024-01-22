const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
/* const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSetYear.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSetYear.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSetYear.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js"); */
const mssql = require("../../../../function/mssql.js");
const dtConv = require("../../../../function/dateTime.js");
const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const Jimp = require("jimp");
/* const { isGeneratorFunction } = require("util/types");
const { start } = require("repl");
const { count } = require("console");
 */
exports.CreatePDF = async (dataReport) => {
  try {
    //manage data
    var CustFull = dataReport[0].CustFull;
    var dataBuff;
    dataBuff = await mssql.qurey(
      `select * from Routine_KACReport where Custfull = '${CustFull}' 
    AND SamplingDate <= '${dtConv.toDateSQL(dataReport[0].SamplingDate)}'
    order by SamplingDate,reportorder`
    );
    dataBuff = dataBuff.recordset;

    //manageData
    //Separate by sampling date
    var dataBuffSet = [];
    var j = 0; //set data
    for (var i = 0; i < dataBuff.length; i++) {
      if (i == 0) {
        dataBuffSet.push([]);
      }
      if (
        i != 0 &&
        dtConv.toDateOnly(dataBuff[i].SamplingDate) !=
          dtConv.toDateOnly(dataBuff[i - 1].SamplingDate)
      ) {
        j++;
        dataBuffSet.push([]);
      }
      dataBuffSet[j].push(dataBuff[i]);
    }
    //remove data over 24 round
    if (dataBuffSet.length > 14) {
      dataBuffSet.splice(0, dataBuffSet.length - 14);
    }
    /*     for (let i = 0; i < 3; i++) {
      console.log(dataBuffSet[i].length);
    } */
    var currentRound = dataBuffSet.length;

    var doc = new jsPDF("l", "mm", "a3", true); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    //console.log(pageHeight, pageWidth);
    var currentY = 0;

    doc.setFont("THSarabun");
    console.log("MMTH4");
    var buffDoc;
    //Header Set
    buffDoc = await HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1] - 4;

    //Sign set
    buffDoc = await SignSet(dataBuffSet[dataBuffSet.length - 1], doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    buffDoc = await DataSetYear(dataBuffSet, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    var buffYforComment = currentY;
    //Data PicSet
    buffDoc = await PicSet(dataBuffSet[dataBuffSet.length - 1], doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1] - 3;

    //Comnet Set
    buffDoc = await CommentSet(
      dataBuffSet[dataBuffSet.length - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];

    doc.addPage("l", "mm", "a3", true);
    currentY = 10;

    //Set Graph Degreasing
    buffDoc = await SetGraph(dataBuffSet, doc, [5, 6, 7, 8], 10);
    //Set Graph Surface
    buffDoc = await SetGraph(dataBuffSet, doc, [12, 11], 110);
    //Set Graph Phosphate
    buffDoc = await SetGraph(dataBuffSet, doc, [13, 14, 15, 18, 17], 210);
    //Set Graph WR
    buffDoc = await SetGraphWR(dataBuffSet, doc, 310);
    //buffDoc = await SetGraph(dataBuffSet, doc, [5, 6, 7, 8], 310);

    /* 
   //Comment Set
    buffDoc = await Pattern_MainC.CommentSetYear(
      dataBuffSet[currentRound - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    //currentY = buffDoc[1];

 */
    //console.log(dataBuffSet);

    await doc.save(
      "C:\\AutomationProject\\SAR\\asset_ts\\Report\\KAC\\" +
        dataReport[0].ReqNo +
        ".pdf"
    );

    //console.log("end SavePDF");

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
    var currentY = 5;
    console.log("HEADER MMTH4");
    //Add Logo
    var picHigh = 10;
    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(
      bitmap.toString("base64"),
      "JPEG",
      (420 - 20) / 2,
      currentY,
      20,
      picHigh,
      undefined,
      "SLOW"
    );
    currentY = currentY + picHigh;
    //Add Customer Name
    doc.autoTable({
      startY: currentY + 2,
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
              fontSize: 18,
              cellPadding: 0.5,
              lineColor: 0,
              lineWidth: 0.1,
              cellWidth: 125,
            },
          },
        ],
      ],
      margin: { left: (420 - 125) / 2 },
      //body: body,
      theme: "grid",
    });
    //text
    currentY = doc.lastAutoTable.finalY + 4;
    var fontSize = 10;
    doc.setFont("THSarabun", "normal");
    doc.setFontSize(fontSize);
    var Text =
      "We would like to report you about the conclusion of pretreatment line checking .The result is as below";
    var widthText = doc.getTextWidth(Text);

    doc.text(Text, (420 - widthText) / 2, currentY);

    currentY = currentY + fontSize / 2.5;

    doc.text("Sampling Date", 185, currentY);
    doc.text(
      dtConv.toDateOnlyMonthName(dataReport[0].SamplingDate),
      215,
      currentY
    );

    currentY = currentY + fontSize / 2.5;
    doc.text("Report Making Date", 185, currentY);
    doc.text(
      dtConv.toDateOnlyMonthName(dataReport[0].CreateReportDate),
      215,
      currentY
    );
    currentY = currentY + fontSize / 2.5;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function DataSetYear(dataReport, doc, currentY) {
  console.log("DataSetYear");
  try {
    doc.autoTable({
      startY: currentY - 5,
      head: [{ content: "1. Chemical Condition" }],
      headStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 10,
        maxCellHeight: 9,
        cellPadding: 0.2,
        cellWidth: 50,
      },
      theme: "plain",
    });

    var dataInHeader = [];
    var columnAllCount = 2 + dataReport[0].length; //,samplingdate,time,
    var cellHWidth = 390 / 34;
    console.log(cellHWidth);
    //manage header
    //row 1
    var styleRowHeadBlue = {
      textColor: 0,
      halign: "center",
      fillColor: [3, 244, 252],
      valign: "middle",
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 10,
      //cellPadding: 0.2,
    };

    dataInHeader.push([
      {
        content: "DATE",
        styles: styleRowHeadBlue,
        rowSpan: 3,
      },
      {
        content: "TIME",
        styles: styleRowHeadBlue,
        rowSpan: 3,
      },
    ]);

    for (let i = 1; i < dataReport[0].length; i++) {
      let countColSpan = 1;
      let k = 0;
      for (k = i; k < dataReport[0].length; k++) {
        if (k + 1 < dataReport[0].length) {
          if (
            dataReport[0][k].ProcessReportName ==
            dataReport[0][k + 1].ProcessReportName
          ) {
            countColSpan++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      if (dataReport[0][i].ReportOrder < 100) {
        dataInHeader[0].push({
          colSpan: countColSpan,
          content: dataReport[0][i].ProcessReportName,
          styles: styleRowHeadBlue,
        });
      } else {
        break;
      }
      i = k;
    }

    let indexCwt = 0;
    for (let i = 15; i < dataReport[0].length; i++) {
      if (dataReport[0][i].ReportOrder == 115) {
        indexCwt = i;
        break;
      }
    }
    dataInHeader[0].push(
      {
        content: dataReport[0][indexCwt].ProcessReportName,
        styles: styleRowHeadBlue,
      },
      {
        content: dataReport[0][indexCwt + 1].ProcessReportName,
        styles: styleRowHeadBlue,
      },
      {
        content: dataReport[0][indexCwt + 2].ProcessReportName,
        styles: styleRowHeadBlue,
      },
      {
        content: dataReport[0][indexCwt + 3].ProcessReportName,
        styles: styleRowHeadBlue,
      }
    );

    //row 3 item check
    var colorRow3 = [140, 255, 219];
    colorRow3 = [3, 244, 252];
    var cellDWidth = 400 / 34;
    var styleRow3H = {
      textColor: 0,
      halign: "center",
      fillColor: colorRow3,
      valign: "middle",
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 9,
    };
    var styleRow3D = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      fillColor: colorRow3,
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: 8,
    };

    dataInHeader.push([]);
    /* dataInHeader.push([
      {
        content: "ITEM check",
        styles: styleRow3H,
      },
    ]); */

    for (let i = 1; i < dataReport[0].length; i++) {
      // i = 1 Not include time
      if (dataReport[0][i].ReportOrder < 100) {
        dataInHeader[1].push({
          content: dataReport[0][i].ItemReportName,
          styles: styleRow3D,
        });
      } else {
        break;
      }
    }
    dataInHeader[1].push(
      {
        content: dataReport[0][indexCwt].ItemReportName,
        styles: styleRow3D,
      },
      {
        content: dataReport[0][indexCwt + 1].ItemReportName,
        styles: styleRow3D,
      },
      {
        content: dataReport[0][indexCwt + 2].ItemReportName,
        styles: styleRow3D,
      },
      {
        content: dataReport[0][indexCwt + 3].ItemReportName,
        styles: styleRow3D,
      }
    );

    //row 4 range comtrol
    var colorRow4 = [255, 254, 83];
    colorRow4 = [3, 244, 252];
    var styleRow4H = {
      textColor: 0,
      halign: "center",
      fillColor: colorRow4,
      valign: "middle",
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 9,
    };
    var styleRow4D = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      fillColor: colorRow4,
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: 8,
      //cellWidth: cellDWidth,
    };
    var styleRow4Date = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      fillColor: [255, 255, 255], //white
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: 5,
    };

    dataInHeader.push([]);
    /* 
    dataInHeader.push([
      {
        content: "Range Control",
        styles: styleRow4H,
      },
    ]); */

    /*     dataInHeader.push([
      {
        content: "Samplinig Date",
        styles: styleRow4Date,
      },
      {
        content: "Making Report Date",
        styles: styleRow4Date,
      },
    ]); */

    for (let i = 1; i < dataReport[0].length; i++) {
      // i = 1 Not include time
      if (dataReport[0][i].ReportOrder < 100) {
        dataInHeader[2].push({
          content: dataReport[0][i].ControlRange,
          styles: styleRow4D,
        });
      } else {
        break;
      }
    }
    dataInHeader[2].push(
      {
        content: dataReport[0][indexCwt].ControlRange,
        styles: styleRow4D,
      },
      {
        content: dataReport[0][indexCwt + 1].ControlRange,
        styles: styleRow4D,
      },
      {
        content: dataReport[0][indexCwt + 2].ControlRange,
        styles: styleRow4D,
      },
      {
        content: dataReport[0][indexCwt + 3].ControlRange,
        styles: styleRow4D,
      }
    );

    //data Set

    var dataInTable = [];
    var styleDIntable = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      font: "THSarabun",
      fontStyle: "normal",
      //cellWidth: cellDWidth,
      fontSize: 8,
    };
    var colorError = [254, 184, 171];
    var styleDIntableError = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      fillColor: colorError,
      font: "THSarabun",
      fontStyle: "normal",
      //cellWidth: cellDWidth,
      fontSize: 8,
    };
    var styleRowHeadDBlue = {
      textColor: 0,
      halign: "center",
      fillColor: [3, 244, 252],
      valign: "middle",
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 9,
    };

    // j = index month
    // i = index item in month
    for (let j = 0; j < dataReport.length; j++) {
      dataInTable.push([]);
      dataInTable[j].push({
        content: dtConv.toDateOnlyMonthName(dataReport[j][0].SamplingDate),
        styles: styleDIntable,
      });

      //add data in row month
      for (let i = 0; i < dataReport[j].length; i++) {
        if (dataReport[j][i].ReportOrder < 100) {
          let checkErrorOk = true;
          if (
            dataReport[j][i].Evaluation != "PASS" &&
            dataReport[j][i].Evaluation != "-" &&
            dataReport[j][i].Evaluation != ""
          ) {
            checkErrorOk = false;
          }
          dataInTable[j].push({
            content: dataReport[j][i].ResultReport,
            styles: checkErrorOk ? styleDIntable : styleDIntableError,
          });
        } else {
          break;
        }
      }
      for (let k = 0; k < 4; k++) {
        let checkErrorOk = true;
        if (
          dataReport[j][indexCwt + k].Evaluation != "PASS" &&
          dataReport[j][indexCwt + k].Evaluation != "-" &&
          dataReport[j][indexCwt + k].Evaluation != ""
        ) {
          checkErrorOk = false;
        }
        dataInTable[j].push({
          content: dataReport[j][indexCwt + k].ResultReport,
          styles: checkErrorOk ? styleDIntable : styleDIntableError,
        });
      }
    }

    doc.autoTable({
      startY: currentY,
      head: dataInHeader,
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 13,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 9,
        cellPadding: 0.2,
      },
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 9,
        cellPadding: 0.2,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 9,
      },
      columnStyles: {
        0: { cellWidth: 14 }, //blank for auto
        2: { cellWidth: cellHWidth },
        3: { cellWidth: cellHWidth },
        4: { cellWidth: cellHWidth },
        5: { cellWidth: cellHWidth },
        6: { cellWidth: cellHWidth },
        6: { cellWidth: cellHWidth },
        7: { cellWidth: cellHWidth },
        8: { cellWidth: cellHWidth },
        9: { cellWidth: cellHWidth },
        10: { cellWidth: cellHWidth },
        11: { cellWidth: cellHWidth },
        12: { cellWidth: cellHWidth },
        13: { cellWidth: cellHWidth },
        14: { cellWidth: cellHWidth },
        15: { cellWidth: cellHWidth },
        16: { cellWidth: cellHWidth },
        17: { cellWidth: cellHWidth },
        18: { cellWidth: cellHWidth },
        19: { cellWidth: cellHWidth },
        20: { cellWidth: cellHWidth },
        21: { cellWidth: cellHWidth },
        22: { cellWidth: cellHWidth },
        23: { cellWidth: cellHWidth },
        24: { cellWidth: cellHWidth },
        25: { cellWidth: cellHWidth },
        26: { cellWidth: cellHWidth },
        27: { cellWidth: cellHWidth },
        28: { cellWidth: cellHWidth },
        29: { cellWidth: cellHWidth },
        30: { cellWidth: cellHWidth },
        31: { cellWidth: cellHWidth },
        32: { cellWidth: cellHWidth },
        33: { cellWidth: cellHWidth },
        34: { cellWidth: cellHWidth },
      },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function PicSet(dataReport, doc, currentY) {
  try {
    doc.autoTable({
      startY: currentY + 4,
      head: [
        { content: "2. Coating Performance" },
        /*         {
          content:
            "Date  :  " +
            dtConv.toDateOnlyMonthName(dataReport[0].SamplingDate),
        }, */
      ],
      headStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 10,
        cellPadding: 0.1,
        cellWidth: 50,
      },
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY;
    console.log("PicSet");

    var picHeight = 40;
    var picWidht = 53.2;
    var startIndex = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        startIndex = i;
        break;
      }
    }
    var buffpicResize = [];
    console.log("------->>>>><<")
    for (let i = 0; i < 8; i++) {
      let bitmap = fs.readFileSync(
        "C:\\AutomationProject\\SAR\\asset\\" +
          dataReport[startIndex + i].ResultReport
      );
      var picResize = await ResizeBase64(bitmap);
      buffpicResize.push(picResize);
    }

    var dataInTable = [];
    dataInTable.push([
      {
        rowSpan: 6,
        content: dtConv.toDateOnlyMonthName(
          dataReport[startIndex].SamplingDate
        ),
      },
      dataReport[startIndex].ItemReportName,
      dataReport[startIndex].ControlRange,
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
    ]);
    dataInTable.push([
      dataReport[startIndex + 4].ItemReportName,
      dataReport[startIndex + 4].ControlRange,
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
    ]);

    dataInTable.push([
      dataReport[startIndex + 8].ItemReportName,
      dataReport[startIndex + 8].ControlRange,
      dataReport[startIndex + 8].ResultReport,
      dataReport[startIndex + 9].ResultReport,
      dataReport[startIndex + 10].ResultReport,
      dataReport[startIndex + 11].ResultReport,
    ]);
    dataInTable.push([
      dataReport[startIndex + 12].ItemReportName,
      dataReport[startIndex + 12].ControlRange,
      dataReport[startIndex + 12].ResultReport,
      dataReport[startIndex + 13].ResultReport,
      dataReport[startIndex + 14].ResultReport,
      dataReport[startIndex + 15].ResultReport,
    ]);
    dataInTable.push([
      dataReport[startIndex + 16].ItemReportName,
      dataReport[startIndex + 16].ControlRange,
      dataReport[startIndex + 16].ResultReport,
      dataReport[startIndex + 17].ResultReport,
      dataReport[startIndex + 18].ResultReport,
      dataReport[startIndex + 19].ResultReport,
    ]);
    dataInTable.push([
      dataReport[startIndex + 20].ItemReportName,
      dataReport[startIndex + 20].ControlRange,
      dataReport[startIndex + 20].ResultReport,
      dataReport[startIndex + 21].ResultReport,
      dataReport[startIndex + 22].ResultReport,
      dataReport[startIndex + 23].ResultReport,
    ]);

    var countPic = 0;
    doc.autoTable({
      startY: currentY + 1,
      head: [
        [
          {
            content: "DATE",
            rowSpan: 2,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 9,
            },
          },
          {
            content: "ITEM",
            rowSpan: 2,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 9,
            },
          },
          {
            content: "CONTROLED RANGE",
            rowSpan: 2,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 9,
            },
          },
          {
            content: "MATERIAL",
            colSpan: 4,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 9,
            },
          },
        ],
        [
          dataReport[startIndex].ProcessReportName,
          dataReport[startIndex + 1].ProcessReportName,
          dataReport[startIndex + 2].ProcessReportName,
          dataReport[startIndex + 3].ProcessReportName,
        ],
      ],
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        //fillColor: [140, 255, 219],
        fillColor: [3, 244, 252],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
      },
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 8,
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 15 /* fillColor: [211, 239, 240] */ },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: picWidht },
        4: { cellWidth: picWidht },
        5: { cellWidth: picWidht },
        6: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: async function (data) {
        if (
          (data.row.index == 0 || data.row.index == 1) &&
          data.column.index > 2 &&
          data.section === "body"
        ) {
          try {
            doc.addImage(
              buffpicResize[countPic].toString("base64"),
              "JPEG",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2,
              "",
              "SLOW"
            );
            countPic++;
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
}

async function CommentSet(dataReport, doc, currentY) {
  try {
    console.log("CommentSet");

    var dataInTable = [];
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
    //console.log(dataInTable);

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "3. Conclusion",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 10,
              cellPadding: 0.5,
            },
          },
        ],
      ],
      //margin: { left: 297 / 2 },
      //body: body,
      theme: "grid",
    });
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 9,
        cellPadding: 0.5,
        //cellWidth: 17,
      },
      //margin: { left: 297 / 2 },
      theme: "plain",
    });

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function SignSet(dataReport, doc, currentY) {
  try {
    console.log("SignSet");
    //spans();
    var signCount = 0;
    var signWidth = 20;
    var signHeight = 10;
    var fontSize = 8;
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
        dtConv.toDateOnlyMonthName(dataReport[0].JPTime) || "",
        dtConv.toDateOnlyMonthName(dataReport[0].DGMTime) || "",
        dtConv.toDateOnlyMonthName(dataReport[0].GLTime) || "",
        dtConv.toDateOnlyMonthName(dataReport[0].SubLeaderTime) || "",
        dtConv.toDateOnlyMonthName(dataReport[0].InchargeTime) || "",
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

    doc.autoTable({
      startY: currentY + 2,
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
      //      margin: { left: 406 / 2 - (signWidth * 5) / 2 },
      margin: { left: 160 },
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
                "JPEG",
                data.cell.x + 1,
                data.cell.y + 1,
                signWidth - 2,
                signHeight - 2,
                undefined,
                "SLOW"
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

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function SetGraph(dataReport, doc, indexGraph, xPosition) {
  try {
    console.log("SetGraph");
    var picWidht = 100;
    var picHeight = 33.5;
    var currentY = 5;
    //var indexGraph = [5, 6, 7, 8];
    var countGraph = 0;
    var picGraph = [];
    var dataBody = [];
    //prepare pic
    for (let i = 0; i < indexGraph.length; i++) {
      picGraph.push(await GraphPic(dataReport, indexGraph[i]));
      dataBody.push(
        [
          {
            content:
              dataReport[0][indexGraph[i]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[i]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ]
      );
    }

    doc.autoTable({
      startY: 30,
      head: [
        [
          {
            content: dataReport[0][indexGraph[0]].ProcessReportName,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 18,
              cellPadding: 0.5,
              lineColor: 0,
              lineWidth: 0.1,
              cellWidth: picWidht,
            },
          },
        ],
      ],
      body: dataBody,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 8,
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: picWidht },
      },
      margin: { left: xPosition },
      allSectionHooks: true,
      didDrawCell: async function (data) {
        if (
          (data.row.index == 1 ||
            data.row.index == 3 ||
            data.row.index == 5 ||
            data.row.index == 7 ||
            data.row.index == 9 ||
            data.row.index == 11) &&
          data.section === "body"
        ) {
          try {
            doc.addImage(
              picGraph[countGraph],
              "JPEG",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2,
              undefined,
              "SLOW"
            );
            countGraph++;
          } catch (err) {
            console.log("error pic" + err);
          }
        }
      },
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY + 4;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function SetGraphWR(dataReport, doc, xPosition) {
  try {
    console.log("Graph Dereasing");
    var picWidht = 100;
    var picHeight = 33.5;
    var currentY = 5;
    var indexGraph = [9, 10, 21, 22, 23, 24];
    var countGraph = 0;
    var picGraph = [];

    //prepare pic
    for (let i = 0; i < indexGraph.length; i++) {
      picGraph.push(await GraphPic(dataReport, indexGraph[i]));
    }

    doc.autoTable({
      startY: 30,
      head: [
        [
          {
            content: "Water rinse",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 18,
              cellPadding: 0.5,
              lineColor: 0,
              lineWidth: 0.1,
              cellWidth: picWidht,
            },
          },
        ],
      ],
      body: [
        [
          {
            content:
              "Water rinse 1 " +
              dataReport[0][indexGraph[0]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[0]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
        [
          {
            content:
              "Water rinse 2 " +
              dataReport[0][indexGraph[1]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[1]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
        [
          {
            content:
              "Water rinse 3 " +
              dataReport[0][indexGraph[2]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[2]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
        [
          {
            content:
              "Water rinse 4 " +
              dataReport[0][indexGraph[3]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[3]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
        [
          {
            content:
              "Water rinse 5 " +
              dataReport[0][indexGraph[4]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[4]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
        [
          {
            content:
              "Fresh DI " +
              dataReport[0][indexGraph[4]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[4]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
      ],

      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 8,
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: picWidht },
      },
      margin: { left: xPosition },
      allSectionHooks: true,
      didDrawCell: async function (data) {
        if (
          (data.row.index == 1 ||
            data.row.index == 3 ||
            data.row.index == 5 ||
            data.row.index == 7 ||
            data.row.index == 9 ||
            data.row.index == 11) &&
          data.section === "body"
        ) {
          try {
            doc.addImage(
              picGraph[countGraph],
              "JPEG",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2,
              undefined,
              "SLOW"
            );
            countGraph++;
          } catch (err) {
            console.log("error pic" + err);
          }
        }
      },
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY + 4;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

/* async function SetGraphWR(dataReport, doc) {
  try {
    console.log("Graph Dereasing");
    var picWidht = 100;
    var picHeight = 33.5;
    var currentY = 5;
    var indexGraph = [9, 10, 21, 22, 23, 24];
    var countGraph = 0;
    var picGraph = [];

    //prepare pic
    picGraph.push(await GraphPic2(dataReport, indexGraph[0]));
    picGraph.push(await GraphPic(dataReport, indexGraph[2]));
    picGraph.push(await GraphPic(dataReport, indexGraph[3]));
    picGraph.push(await GraphPic2(dataReport, indexGraph[4]));

    doc.autoTable({
      startY: currentY + 2,
      head: [
        [
          {
            content: "Water rinse",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 18,
              cellPadding: 0.5,
              lineColor: 0,
              lineWidth: 0.1,
              cellWidth: picWidht,
            },
          },
        ],
      ],
      body: [
        [
          {
            content:
              "Water rinse 1,2\n" +
              dataReport[0][indexGraph[0]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[0]].ControlRange +
              ")\n" +
              dataReport[0][indexGraph[1]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[1]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
        [
          {
            content:
              "Water rinse 3\n" +
              dataReport[0][indexGraph[2]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[2]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
        [
          {
            content:
              "Water rinse 4\n" +
              dataReport[0][indexGraph[3]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[3]].ControlRange +
              ")",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
        [
          {
            content:
              "Water rinse 5,Fresh DI\n" +
              dataReport[0][indexGraph[4]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[4]].ControlRange +
              ")" +
              dataReport[0][indexGraph[5]].ItemReportName +
              " (" +
              dataReport[0][indexGraph[5]].ControlRange +
              ")\n",
          },
        ],
        [
          {
            content: "",
            styles: {
              valign: "middle",
              halign: "center",
              minCellHeight: picHeight,
            },
          },
        ],
      ],

      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 8,
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: async function (data) {
        if (
          data.row.index == 1 ||
          data.row.index == 3 ||
          data.row.index == 5 ||
          (data.row.index == 7 && data.section === "body")
        ) {
          try {
            doc.addImage(
              picGraph[countGraph],
              "png",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
            countGraph++;
          } catch (err) {
            console.log("error pic" + err);
          }
        }
      },
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY + 4;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
} */

async function GraphPic(dataReport, indexData) {
  try {
    const width = 750; //px
    const height = 225; //px
    const backgroundColour = "white"; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour,
    });

    let buffDate = [];
    let buffUpper = [];
    let buffLower = [];
    let bufData = [];
    for (let i = 0; i < dataReport.length; i++) {
      buffDate.push(
        dtConv.toDateOnlyMonthName(dataReport[i][indexData].SamplingDate)
      );
      buffUpper.push(dataReport[i][indexData].StdMax);
      buffLower.push(dataReport[i][indexData].StdMin);
      bufData.push(dataReport[i][indexData].ResultReport);
    }
    let StdMin = dataReport[0][indexData].StdMax;
    let StdMax = dataReport[0][indexData].StdMin;
    let chartMin = Math.round(StdMin * 0.85);
    let chartMax = Math.round(StdMax * 1.15);
    if (Math.min(...StdMin) < 5) {
      chartMin = 0;
    }
    /* for (let i = 0; i < 24; i++) {
      bufData.push(5);
      buffDate.push(dtConv.toDateOnlyMonthName(dataReport[0][0].SamplingDate));
    } */
    const configuration = {
      type: "line", // for line chart
      data: {
        labels: buffDate,
        datasets: [
          {
            data: buffUpper,
            pointStyle: "false",
            borderColor: ["red"],
            borderDash: [10, 10],
            pointBorderWidth: 0,
            pointRadius: 0,
          },
          {
            data: buffLower,
            pointStyle: "false",
            borderColor: ["red"],
            borderDash: [10, 10],
            pointBorderWidth: 0,
            pointRadius: 0,
          },
          {
            data: bufData,
            pointStyle: "circle",
            backgroundColor: ["black"],
            borderColor: false,
            borderDash: [10000, 10000],
            pointBorderWidth: 1,
            pointRadius: 3,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          layout: {
            padding: 100,
          },
        },

        scales: {
          y: {
            suggestedMax: chartMax,
            suggestedMin: chartMin,
          },
        },
      },
    };

    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl;
    var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    return base64Data;
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function GraphPicBackup(dataReport, indexData) {
  const width = 600; //px
  const height = 200; //px
  const backgroundColour = "white"; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour,
  });

  const configuration = {
    type: "line", // for line chart
    data: {
      labels: [2018, 2019, 2020, 2021],
      datasets: [
        {
          label: "Sample 1",
          data: [10, 15, -20, 15],
          fill: false,
          borderColor: ["rgb(51, 204, 204)"],
          borderWidth: 1,
          xAxisID: "xAxis1", //define top or bottom axis ,modifies on scale
        },
        {
          label: "Sample 2",
          data: [10, 30, 20, 10],
          fill: false,
          borderColor: ["rgb(255, 102, 255)"],
          borderWidth: 1,
          xAxisID: "xAxis1",
        },
      ],
    },
    options: {
      scales: {
        y: {
          suggestedMin: 0,
        },
      },
    },
  };
  const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
  const base64Image = dataUrl;

  var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
  fs.writeFile("out.png", base64Data, "base64", function (err) {
    if (err) {
      console.log(err);
    }
  });
  return base64Image;
}

async function ResizeBase64(pic64In) {
  try {
    var buff;
    await Jimp.read(Buffer.from(pic64In, "base64"))
      .then(async (lenna) => {
        lenna
          .resize(820, 400) // resize
          .quality(100); // set JPEG quality
        await lenna.getBase64(Jimp.AUTO, (err, res) => {
          buff = res;
        });
      })
      .catch((err) => {
        console.log(err);
      });
    return buff.replace(/^data:image\/png;base64,/, "");
  } catch (err) {
    console.log(err);
    return "error";
  }
}
