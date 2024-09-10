const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");
const { VarBinary } = require("mssql");

exports.CreatePDF = async (dataReport) => {
  try {
    console.log("CreatePDF HONDAPNOX");
    var CustFull = dataReport[0].CustFull;
    var monthRequest = dtget.toMonthOnly(dataReport[0].SamplingDate);
    var yearRequest = dtget.toYearOnly(dataReport[0].SamplingDate);
    var dataBuff;
    //console.log(dtget.toDateSQL(dataReport[0].SamplingDate));
    dataBuff = await mssql.qurey(
      `select * from Routine_KACReport where Custfull = '${CustFull}' 
    AND SamplingDate <= '${dtget.toDateSQL(dataReport[0].SamplingDate)}'
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
        dtget.toDateOnly(dataBuff[i].SamplingDate) !=
        dtget.toDateOnly(dataBuff[i - 1].SamplingDate)
      ) {
        j++;
        dataBuffSet.push([]);
      }
      dataBuffSet[j].push(dataBuff[i]);
    }

    var currentRound = 0;
    currentRound = dataBuffSet.length;
    //add blank week data
    for (var i = currentRound; i < 12; i++) {
      dataBuffSet.push([]);
      for (var j = 0; j < dataBuffSet[0].length; j++) {
        dataBuffSet[i].push({
          SamplingDate: "",
          ProcessReportName: "",
          ItemReportName: "",
          ControlRange: "",
          ResultReport: "",
          Evaluation: "",
        });
      }
    }

    var doc = new jsPDF(); // defualt unit mm.
    var currentY = 0;
    doc.setFont("THSarabun");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //sign set
    buffDoc = await Pattern_MainH.SignSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    buffDoc = await DataSet(dataBuffSet, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Pic Set
    buffDoc = await PicFilter(dataBuffSet[currentRound - 1], doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    currentY = currentY + 4;

    //comment Set
    buffDoc = await CommentSetNOX(
      dataBuffSet[currentRound - 1],
      doc,
      currentY
    );
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

function DataSet(dataReport, doc, currentY) {
  console.log("HONDAPNOX");
  try {
    /*     console.log("DataSet");
    doc.autoTable({
      startY: currentY - 10,
      head: [
        [
          {
            content: "Condition",
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
              cellWidth: 20,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
 */
    var dataInHeader = [];

    dataInHeader = [
      [
        {
          rowSpan: 3,
          content: "NO.",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
        {
          rowSpan: 2,
          content: "Sampling Date",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            maxCellHeight: 12,
            fontSize: 9,
          },
        },
        {
          rowSpan: 2,
          content: "Reported Date",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            maxCellHeight: 12,
            fontSize: 9,
          },
        },

        {
          colSpan: dataReport[0].length, //+ remark - filter pic = 0
          content: "Property check",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
      ],
      [],
      [
        {
          colSpan: 2,
          content: "Control spec",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            maxCellHeight: 12,
            fontSize: 9,
          },
        },
      ],
    ];
    //dataReport[0].length-1 =< not include filter pic
    for (let i = 0; i < dataReport[0].length - 1; i++) {
      //row 1 add itemname
      dataInHeader[1].push({
        content: dataReport[0][i].ItemReportName,
        styles: {
          textColor: 0,
          halign: "center",
          valign: "middle",
          font: "THSarabun",
          fontStyle: "normal",
          maxCellHeight: 12,
          fontSize: 9,
        },
      });
      dataInHeader[2].push({
        content: dataReport[0][i].ControlRange,
        styles: {
          textColor: 0,
          halign: "center",
          valign: "middle",
          font: "THSarabun",
          fontStyle: "normal",
          maxCellHeight: 12,
          fontSize: 9,
        },
      });
    }

    // add remark column
    dataInHeader[1].push({
      rowSpan: 2,
      content: "Remark",
      styles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        font: "THSarabun",
        fontStyle: "normal",
        maxCellHeight: 12,
        fontSize: 9,
      },
    });
    var dataInTable = [];

    // i = index month
    // j = index item in month
    for (let i = 0; i < dataReport.length; i++) {
      //add row month
      dataInTable.push([
        i + 1,
        dtget.toDateOnlyMonthName(dataReport[i][0].SamplingDate),
        dtget.toDateOnlyMonthName(dataReport[i][0].CreateReportDate),
      ]);
      //add data in row month
      for (let j = 0; j < dataReport[i].length; j++) {
        if (dataReport[i][j].ReportOrder == 101) {
          break;
        }
        dataInTable[i].push(dataReport[i][j].ResultReport);
      }
      //add remark
      dataInTable[i].push(dataReport[i][0].Evaluation);
    }

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
        cellPadding: 0.9,
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
        cellPadding: 0.9,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 10 },
        1: { cellWidth: 20 },
        /*         2: { cellWidth: 30 },
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
}

/* PicFilter = async (dataReport, doc, currentY) => { */
function PicFilter(dataReport, doc, currentY) {
  try {
    var dataInTable = [];
    var picSetData = [];
    var picHeight = 40;
    var picWidht = 65;
    var runningPic = 0;

    //SET PIC Report order 101
    var dataInHeader = [];

    dataInHeader = [
      [
        {
          content: "NOX-RUST PI-LUBE 350 H-C",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
          },
        },
      ],
    ];
    dataInTable.push([
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
      {
        content: dtget.toDateOnlyMonthName(dataReport[3].SamplingDate),
        styles: {
          valign: "middle",
          halign: "center",
        },
      },
    ]);
    dataInTable.push([
      {
        content: "Solid content = " + dataReport[3].ResultReport + " mg/50ml",
        styles: {
          valign: "middle",
          halign: "center",
        },
      },
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: dataInHeader,
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 9,
        cellPadding: 0.7,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
      },
      margin: { left: 93 / 2 - picWidht / 2 },
      columnStyles: {
        0: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (data.row.index == 0 && data.section === "body") {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" +
              dataReport[dataReport.length - 1].ResultReport
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
}
function CommentSetNOX (dataReport, doc, currentY) {
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
    if (dataInTable.length > 0) {
      let dataHeight = 40 + (dataInTable.length * 15);
      /* console.log(currentY);
      console.log(dataHeight);
      console.log(297 - dataHeight); */
      if (currentY >= 297 - dataHeight) {
        // doc.addPage();
        currentY = 192;
      }
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
                fillColor: [3, 244, 252],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: 12,
                cellPadding: 1,
                lineColor: 0,
                lineWidth: 0.1,
                maxCellHeight: 12,
                cellWidth: 18,
              },
            },
          ],
        ],
        margin: {left : 90},
        //body: body,
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
          //cellWidth: 17,
        },
        margin: {left : 90},
        theme: "plain",
      });
    }

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
