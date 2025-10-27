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
    console.log("CreatePDF BESTEX");
    var CustFull = dataReport[0].CustFull;
    var monthRequest = dtget.toMonthOnly(dataReport[0].SamplingDate);
    var yearRequest = dtget.toYearOnly(dataReport[0].SamplingDate);
    var dataBuff;
    //console.log(dtget.toDateSQL(dataReport[0].SamplingDate));
    dataBuff = await mssql.qurey(
      `select * from Routine_KACReport where Custfull = '${CustFull}' 
    AND SamplingDate <= '${dtget.toDateSQL(dataReport[0].SamplingDate)}'
    AND MONTH(SamplingDate) = ${monthRequest} 
    AND YEAR(SamplingDate) = ${yearRequest} order by SamplingDate,reportorder`
    );
    dataBuff = dataBuff.recordset;
    // console.log(dataBuff.recordset);
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
    var currentRound = dataBuffSet.length;
    console.log(dataBuffSet);
    //add missing data Mn ,Ni ,T-Cr
    if (currentRound > 1) {
      for (let j = 1; j < currentRound; j++) {
        // ✅ ตรวจว่ามี ReportOrder = 17 หรือไม่
        const hasReportOrder17 = dataBuffSet[j].some(item => item.ReportOrder === 17);

        if (!hasReportOrder17) {
          dataBuffSet[j].splice(
            17,
            0,
            {
              ReportOrder: 17,
              SamplingDate: "-",
              ProcessReportName: "-",
              ItemReportName: "-",
              ControlRange: "-",
              ResultReport: "-",
              Evaluation: "-",
            },
            {
              SamplingDate: "-",
              ProcessReportName: "-",
              ItemReportName: "-",
              ControlRange: "-",
              ResultReport: "-",
              Evaluation: "-",
            }
          );
        }
      }
    }

    // add missing data Mn ,Ni ,T-Cr
    if (currentRound > 1) {
      for (let j = 1; j < currentRound; j++) {
        // ✅ ตรวจว่ามี ReportOrder = 20 หรือไม่
        const hasReportOrder20 = dataBuffSet[j].some(item => item.ReportOrder === 20);

        if (!hasReportOrder20) {
          dataBuffSet[j].splice(
            20,
            0,
            {
              ReportOrder: 20,
              SamplingDate: "-",
              ProcessReportName: "-",
              ItemReportName: "-",
              ControlRange: "-",
              ResultReport: "-",
              Evaluation: "-",
            }
          );
        }
      }
    }


    //add blank week data
    for (var i = currentRound; i < 4; i++) {
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
    //console.log(dataBuffSet.length);
    /* console.log(dataBuffSet[10]); */
    var doc = new jsPDF(); // defualt unit mm.
    var currentY = 0;
    doc.setFont("THSarabun");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    console.log("1");
    buffDoc = await DataSet(dataBuffSet, currentRound, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Pic Set
    buffDoc = await PicSetAPM(dataBuffSet, currentRound, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    doc.addPage("a4", "portrait");
    currentY = 10;
    //Set Comment

    buffDoc = await Pattern_MainC.CommentSet(
      dataBuffSet[currentRound - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //SignSet
    currentY = 200;
    buffDoc = await Pattern_MainH.SignSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Document Code
    doc = await MasterWeeklyDocument(doc);

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

async function DataSet(dataReport, CurrentRound, doc, currentY) {
  /* let DataSet = async (dataReport, CurrentRound, doc, currentY) => { */
  console.log("hondaDataSet");
  try {
    console.log("DataSet");
    doc.autoTable({
      startY: currentY,
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

    var dataInHeader = [];

    dataInHeader = [
      [
        {
          rowSpan: 2,
          content: "PROCESS",
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
          content: "CHECK ITEM",
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
          content: "CONTROLED RANGE",
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
          colSpan: 4,
          content: "RESULT",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
            maxCellHeight: 12,
          },
        },
        {
          content: "EVALUATION",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 8,
          },
        },
      ],
      [
        {
          content: dtget.toDateOnly(dataReport[0][0].SamplingDate),
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            maxCellHeight: 12,
            fontSize: 10,
          },
        },
        {
          content: dtget.toDateOnly(dataReport[1][0].SamplingDate),
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            fontSize: 10,
          },
        },
        {
          content: dtget.toDateOnly(dataReport[2][0].SamplingDate),
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            fontSize: 10,
          },
        },
        {
          content: dtget.toDateOnly(dataReport[3][0].SamplingDate),
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            fontSize: 10,
          },
        },
        {
          content: dtget.toDateOnly(
            dataReport[CurrentRound - 1][0].SamplingDate
          ),
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            fontSize: 10,
          },
        },
      ],
    ];

    var dataInTable = [];
    //main is first round request
    for (let i = 0; i < dataReport[0].length; i++) {
      if (dataReport[0][i].ReportOrder >= 100) {
        break;
      }
      //merge dupicate
      //check data not last
      if (i < dataReport[0].length - 1) {
        if (
          dataReport[0][i].ProcessReportName ==
          dataReport[0][i + 1].ProcessReportName
        ) {
          let countSpan = 2;
          for (let j = 1; i + j < dataReport[0].length; j++) {
            if (i + j < dataReport[0].length - 1) {
              if (
                dataReport[0][i].ProcessReportName ==
                dataReport[0][i + j + 1].ProcessReportName
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
                  content: dataReport[0][i].ProcessReportName,
                },
                //dataReport[i].ProcessReportName,
                dataReport[0][i].ItemReportName,
                dataReport[0][i].ControlRange,
                dataReport[0][i].ResultReport && !isNaN(parseFloat(dataReport[0][i].ResultReport)) ? parseFloat(dataReport[0][i].ResultReport).toFixed(1) : dataReport[0][i].ResultReport,
                dataReport[1][i].ResultReport && !isNaN(parseFloat(dataReport[1][i].ResultReport)) ? parseFloat(dataReport[1][i].ResultReport).toFixed(1) : dataReport[1][i].ResultReport,
                dataReport[2][i].ResultReport && !isNaN(parseFloat(dataReport[2][i].ResultReport)) ? parseFloat(dataReport[2][i].ResultReport).toFixed(1) : dataReport[2][i].ResultReport,
                dataReport[3][i].ResultReport && !isNaN(parseFloat(dataReport[3][i].ResultReport)) ? parseFloat(dataReport[3][i].ResultReport).toFixed(1) : dataReport[3][i].ResultReport,
                dataReport[CurrentRound - 1][i].Evaluation,
              ]);
            } else {
              dataInTable.push([
                //dataReport[i + j].ProcessReportName,
                dataReport[0][i + j].ItemReportName,
                dataReport[0][i + j].ControlRange,
                dataReport[0][i + j].ResultReport && !isNaN(parseFloat(dataReport[0][i + j].ResultReport)) ? parseFloat(dataReport[0][i + j].ResultReport).toFixed(1) : dataReport[0][i + j].ResultReport,
                dataReport[1][i + j].ResultReport && !isNaN(parseFloat(dataReport[1][i + j].ResultReport)) ? parseFloat(dataReport[1][i + j].ResultReport).toFixed(1) : dataReport[1][i + j].ResultReport,
                dataReport[2][i + j].ResultReport && !isNaN(parseFloat(dataReport[2][i + j].ResultReport)) ? parseFloat(dataReport[2][i + j].ResultReport).toFixed(1) : dataReport[2][i + j].ResultReport,
                dataReport[3][i + j].ResultReport && !isNaN(parseFloat(dataReport[3][i + j].ResultReport)) ? parseFloat(dataReport[3][i + j].ResultReport).toFixed(1) : dataReport[3][i + j].ResultReport,
                dataReport[CurrentRound - 1][i + j].Evaluation,
              ]);
            }
          }
          i = i + countSpan - 1;
        } else {
          dataInTable.push([
            dataReport[0][i].ProcessReportName,
            dataReport[0][i].ItemReportName,
            dataReport[0][i].ControlRange,
            dataReport[0][i].ResultReport && !isNaN(parseFloat(dataReport[0][i].ResultReport)) ? parseFloat(dataReport[0][i].ResultReport).toFixed(1) : dataReport[0][i].ResultReport,
            dataReport[1][i].ResultReport && !isNaN(parseFloat(dataReport[1][i].ResultReport)) ? parseFloat(dataReport[1][i].ResultReport).toFixed(1) : dataReport[1][i].ResultReport,
            dataReport[2][i].ResultReport && !isNaN(parseFloat(dataReport[2][i].ResultReport)) ? parseFloat(dataReport[2][i].ResultReport).toFixed(1) : dataReport[2][i].ResultReport,
            dataReport[3][i].ResultReport && !isNaN(parseFloat(dataReport[3][i].ResultReport)) ? parseFloat(dataReport[3][i].ResultReport).toFixed(1) : dataReport[3][i].ResultReport,
            dataReport[CurrentRound - 1][i].Evaluation,
          ]);
        }
      } else {
        dataInTable.push([
          dataReport[0][i].ProcessReportName,
          dataReport[0][i].ItemReportName,
          dataReport[0][i].ControlRange,
          dataReport[0][i].ResultReport && !isNaN(parseFloat(dataReport[0][i].ResultReport)) ? parseFloat(dataReport[0][i].ResultReport).toFixed(1) : dataReport[0][i].ResultReport,
          dataReport[1][i].ResultReport && !isNaN(parseFloat(dataReport[1][i].ResultReport)) ? parseFloat(dataReport[1][i].ResultReport).toFixed(1) : dataReport[1][i].ResultReport,
          dataReport[2][i].ResultReport && !isNaN(parseFloat(dataReport[2][i].ResultReport)) ? parseFloat(dataReport[2][i].ResultReport).toFixed(1) : dataReport[2][i].ResultReport,
          dataReport[3][i].ResultReport && !isNaN(parseFloat(dataReport[3][i].ResultReport)) ? parseFloat(dataReport[3][i].ResultReport).toFixed(1) : dataReport[3][i].ResultReport,
          dataReport[CurrentRound - 1][i].Evaluation,
        ]);
      }
    }

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
        0: { fillColor: [211, 239, 240] },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 },
      },
      willDrawCell: function (data) {
        if (
          data.column.index >= 3 &&
          data.section === "body" &&
          data.column.index < 7
        ) {
          if (
            dataReport[data.column.index - 3][data.row.index].Evaluation ==
            "LOW" ||
            dataReport[data.column.index - 3][data.row.index].Evaluation ==
            "HIGH" ||
            dataReport[data.column.index - 3][data.row.index].Evaluation ==
            "NOT PASS" ||
            dataReport[data.column.index - 3][data.row.index].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
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
}

/* PicSetHONDAP = async (dataReport, CurrentRound, doc, currentY) => { */
async function PicSetAPM(dataReport, CurrentRound, doc, currentY) {
  try {
    console.log("PicSetAPM");
    doc.addPage("a4", "landscape");
    currentY = 15;
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "PERFORMANCE OF PHOSPHATE COATING (SEM picture (X 1,000))",
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
              cellWidth: 100,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    // add position pic
    currentY = doc.lastAutoTable.finalY;
    //find start i set
    var i = 0;
    for (i; i < dataReport[0].length; i++) {
      if (dataReport[0][i].ReportOrder >= 100) {
        break;
      }
    }
    var picStartIndex = i;
    var dataInHeader = [];
    dataInHeader = [
      [
        {
          content: "Kind of",
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
          content: dataReport[0][i].ProcessReportName,
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
          content: dataReport[0][i + 1].ProcessReportName,
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
          content: dataReport[0][i + 2].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 15,
            maxCellHeight: 12,
          },
        },
      ],
    ];
    var dataInTable = [];
    var picSetData = [];
    var picHeight = 62;
    var picWidht = 80;
    var runningPic = 0;

    //SET PIC Report order 101 102 103

    for (j = 0; j < CurrentRound; j++) {
      dataInTable.push([
        {
          content: dtget.toDateOnly(dataReport[j][picStartIndex].SamplingDate),
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: picHeight,
          },
        },
        "",
        "",
        "",
      ]);
      picSetData.push(dataReport[j][picStartIndex].ResultReport);
      picSetData.push(dataReport[j][picStartIndex + 1].ResultReport);
      picSetData.push(dataReport[j][picStartIndex + 2].ResultReport);

      for (i = picStartIndex + 3; i < dataReport[j].length; i) {
        dataInTable.push([
          {
            content: dataReport[j][i].ItemReportName,
            styles: {
              valign: "middle",
              halign: "center",
              maxCellHeight: 14,
              fontSize: checkFontSize(dataReport[j][i].ItemReportName),
            },
          },
          {
            content: dataReport[j][i].ResultReport,
            styles: {
              valign: "middle",
              halign: "center",
              maxCellHeight: 14,
            },
          },
          {
            content:
              dataReport[j][i + 1].ResultReport +
              " (Specification : " +
              dataReport[j][i + 1].ControlRange +
              ")",
            styles: {
              valign: "middle",
              halign: "center",
              maxCellHeight: 14,
            },
          },
          {
            content:
              dataReport[j][i + 2].ResultReport +
              " (Specification : " +
              dataReport[j][i + 2].ControlRange +
              ")",
            styles: {
              valign: "middle",
              halign: "center",
              maxCellHeight: 14,
            },
          },
        ]);
        i = i + 3;
      }
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
      margin: { bottom: 20 },
      columnStyles: {
        0: {
          /* cellWidth: 75 */
        },
        1: { cellWidth: picWidht },
        2: { cellWidth: picWidht },
        3: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (
          data.section === "body" &&
          data.row.index % 2 === 0 &&
          data.column.index >= 1
        ) {

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
}

function checkFontSize(name) {
  if (name == "Coating weight (g/m2)") {
    return 10;
  } else {
    return 13;
  }
}


async function MasterWeeklyDocument(doc) {
  try {
    console.log("MasterDocument");
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 0; i < pageCount; i++) {
      doc.setPage(i);
      var pageWidth = doc.internal.pageSize.width;
      doc.setFont("THSarabun", "normal");
      doc.setFontSize(12);
      doc.text("FR-CTS-02/008-00-10/02/22", pageWidth - 50, 10);
    }
    return doc;
  } catch (err) {
    console.log(err);
    return err;
  }
}