const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSetYear.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSetYear.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSetYear.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const mssql = require("../../../../function/mssql.js");
const dtConv = require("../../../../function/dateTime.js");
const fs = require("fs");

exports.CreatePDF = async (dataReport) => {
  try {
    //manage data
    var CustFull = dataReport[0].CustFull;
    var monthRequest = dtConv.toMonthOnly(dataReport[0].SamplingDate);
    var yearRequest = dtConv.toYearOnly(dataReport[0].SamplingDate);
    var dataBuff;
    //console.log(dtConv.toDateSQL(dataReport[0].SamplingDate));
    dataBuff = await mssql.qurey(
      `select * from Routine_KACReport where Custfull = '${CustFull}' 
    AND SamplingDate <= '${dtConv.toDateSQL(dataReport[0].SamplingDate)}'
    AND YEAR(SamplingDate) = ${yearRequest} order by SamplingDate,reportorder`
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
    var currentRound = dataBuffSet.length;

    var doc = new jsPDF("l", "mm", "a4"); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    console.log("TSPKC");
    var buffDoc;
    //Header Set
    buffDoc = await HeaderSet(dataReport, doc);
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
    currentY = buffDoc[1];

    //Comnet Set
    buffDoc = await CommentSet(
      dataBuffSet[dataBuffSet.length - 1],
      doc,
      buffYforComment
    );
    doc = buffDoc[0];
    currentY = buffDoc[1] + 5;
    //Sign set
    buffDoc = await SignSet(dataBuffSet[dataBuffSet.length - 1], doc, currentY);
    doc = buffDoc[0];

    buffDoc = await SignSetTSPKC(
      dataBuffSet[dataBuffSet.length - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];

    //currentY = buffDoc[1];
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
    var currentY = 5;
    console.log("HEADER TSPKC");
    //Add Logo
    var picHigh = 10;
    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(
      bitmap.toString("base64"),
      "JPG",
      (297 - 20) / 2,
      currentY,
      20,
      picHigh
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
              cellWidth: 100,
            },
          },
        ],
      ],
      margin: { left: (297 - 100) / 2 },
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

    doc.text(Text, (297 - widthText) / 2, currentY);

    currentY = currentY + fontSize / 2.5;

    doc.text("Sampling Date", 127, currentY);
    doc.text(dtConv.toDateOnly(dataReport[0].SamplingDate), 150, currentY);

    currentY = currentY + fontSize / 2.5;
    doc.text("Report Making Date", 127, currentY);
    doc.text(dtConv.toDateOnly(dataReport[0].CreateReportDate), 150, currentY);
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
      head: [{ content: "Chemical Control" }],
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
    var columnAllCount = 3 + dataReport[0].length; //3 month,samplingdate,create,
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
      cellPadding: 0.2,
    };

    dataInHeader.push([
      {
        content: "Process ",
        styles: styleRowHeadBlue,
      },
    ]);

    for (let i = 1; i < dataReport[0].length - 5; i++) {
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
      dataInHeader[0].push({
        colSpan: countColSpan,
        content: dataReport[0][i].ProcessReportName,
        styles: styleRowHeadBlue,
      });
      i = k;
    }

    //row 3 item check
    var colorRow3 = [140, 255, 219];
    var cellHWidth = 30;
    var cellDWidth = 420 / dataReport[0].length - 4;
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
      cellWidth: cellDWidth,
    };

    dataInHeader.push([
      {
        content: "ITEM check",
        styles: styleRow3H,
      },
    ]);

    for (let i = 1; i < dataReport[0].length - 5; i++) {
      dataInHeader[1].push({
        content: dataReport[0][i].ItemReportName,
        styles: styleRow3D,
      });
    }

    //row 4 range comtrol
    var colorRow4 = [255, 254, 83];
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

    dataInHeader.push([
      {
        content: "Range Control",
        styles: styleRow4H,
      },
    ]);

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

    for (let i = 1; i < dataReport[0].length - 5; i++) {
      dataInHeader[2].push({
        content: dataReport[0][i].ControlRange,
        styles: styleRow4D,
      });
    }

    //data Set

    var dataInTable = [];
    var styleDIntable = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      font: "THSarabun",
      fontStyle: "normal",
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
      //add data in row month
      for (let i = 0; i < dataReport[j].length - 5; i++) {
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
        //0: { cellWidth: 20 }, //blank for auto
        /* 3: { cellWidth: 15 },
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
}

async function PicSet(dataReport, doc, currentY) {
  try {
    doc.autoTable({
      startY: currentY + 4,
      head: [
        { content: "Quality of Zinc Phosphate film." },
        {
          content:
            "Date  :  " +
            dtConv.toDateOnlyMonthName(dataReport[0].SamplingDate),
        },
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

    var countSetPic = 0;
    var picHeight = 40;
    var picWidht = 82;
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
                  fontSize: 10,
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
          startY: currentY + 1,
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
                  fontSize: 9,
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
            0: { cellWidth: 20, fillColor: [211, 239, 240] },
            1: { cellWidth: 25 },
            2: { cellWidth: 27 },
            3: { cellWidth: 27 },
            4: { cellWidth: 27 },
          },
          allSectionHooks: true,
          willDrawCell: function (data) {
            if (data.row.index == countSpan - 1 && data.column.index == 2) {
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
            content: "Comment",
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
      margin: { left: 297 / 2 },
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
      margin: { left: 297 / 2 },
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
      margin: { left: 221 },
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

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function SignSetTSPKC(dataReport, doc, currentY) {
  try {
    console.log("SignSetTSPKC");
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
      ["Approved by", "Checked by"],
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
      ],
    ];

    doc.autoTable({
      startY: currentY + 2,
      head: [
        [
          {
            content: "THAI SUMMIT CORPOTATION LTD.",
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
      margin: { left: 175 },
    });

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}
