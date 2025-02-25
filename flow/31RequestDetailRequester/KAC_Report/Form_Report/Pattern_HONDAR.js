const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");
const { VarBinary } = require("mssql");
const dtConv = require("../../../../function/dateTime");

exports.CreatePDF = async (dataReport) => {
  try {
    console.log("CreatePDF HONDAP");
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

    //add copy data degreasing
    //
    for (var j = 0; j < dataBuffSet.length; j++) {
      //Why does changing an Array in JavaScript affect copies of the array?
      //.slice return array
      // console.log(dataBuffSet[0].slice(3, 4)); return array
      //console.log(dataBuffSet[0].slice(3, 4)[0]); return object
      // cant
      dataBuffSet[j].splice(5, 0, {
        SamplingDate: dataBuffSet[j][4].SamplingDate,
        ProcessReportName: dataBuffSet[j][4].ProcessReportName,
        ItemReportName: dataBuffSet[j][4].ItemReportName,
        ControlRange: dataBuffSet[j][4].ControlRange,
        ResultReport: dataBuffSet[j][4].ResultReport,
        Evaluation: dataBuffSet[j][4].Evaluation,
      });
      dataBuffSet[j].splice(5, 0, {
        SamplingDate: dataBuffSet[j][3].SamplingDate,
        ProcessReportName: dataBuffSet[j][3].ProcessReportName,
        ItemReportName: dataBuffSet[j][3].ItemReportName,
        ControlRange: dataBuffSet[j][3].ControlRange,
        ResultReport: dataBuffSet[j][3].ResultReport,
        Evaluation: dataBuffSet[j][3].Evaluation,
      });
      dataBuffSet[j].splice(5, 0, {
        SamplingDate: dataBuffSet[j][2].SamplingDate,
        ProcessReportName: dataBuffSet[j][2].ProcessReportName,
        ItemReportName: dataBuffSet[j][2].ItemReportName,
        ControlRange: dataBuffSet[j][2].ControlRange,
        ResultReport: dataBuffSet[j][2].ResultReport,
        Evaluation: dataBuffSet[j][2].Evaluation,
      });
      dataBuffSet[j].splice(5, 0, {
        SamplingDate: dataBuffSet[j][1].SamplingDate,
        ProcessReportName: dataBuffSet[j][1].ProcessReportName,
        ItemReportName: dataBuffSet[j][1].ItemReportName,
        ControlRange: dataBuffSet[j][1].ControlRange,
        ResultReport: dataBuffSet[j][1].ResultReport,
        Evaluation: dataBuffSet[j][1].Evaluation,
      });
      dataBuffSet[j].splice(5, 0, {
        SamplingDate: dataBuffSet[j][0].SamplingDate,
        ProcessReportName: dataBuffSet[j][0].ProcessReportName,
        ItemReportName: dataBuffSet[j][0].ItemReportName,
        ControlRange: dataBuffSet[j][0].ControlRange,
        ResultReport: dataBuffSet[j][0].ResultReport,
        Evaluation: dataBuffSet[j][0].Evaluation,
      });
      dataBuffSet[j][3].ControlRange = "<6.0";
      dataBuffSet[j][5].ProcessReportName = "Degreasing (FC-E2032T)";
      dataBuffSet[j][6].ProcessReportName = "Degreasing (FC-E2032T)";
      dataBuffSet[j][7].ProcessReportName = "Degreasing (FC-E2032T)";
      dataBuffSet[j][8].ProcessReportName = "Degreasing (FC-E2032T)";
      dataBuffSet[j][9].ProcessReportName = "Degreasing (FC-E2032T)";
      dataBuffSet[j][8].ControlRange = "<5.0";

    }

    //add missing data z c f-f
    if (currentRound > 1) {
      for (var j = 1; j < currentRound; j++) {
        dataBuffSet[j].splice(
          22,
          0,
          {
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

    buffDoc = await Pattern_MainC.CommentSet(
      dataBuffSet[currentRound - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Pic Set
    buffDoc = await DataSet2(dataBuffSet, currentRound, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Pic Set
    buffDoc = await PicSetHONDAR(dataBuffSet, currentRound, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    /*    doc.addPage("a4", "portrait");
    currentY = 10; */
    //Set Comment

    //SignSet
    currentY = 235;
    buffDoc = await SignSetHONDAP(dataBuffSet[currentRound - 1], doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1] + 1;

    buffDoc = await SignSet(dataReport, doc, currentY);
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
              fontSize: 10,
              cellPadding: 0.5,
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
            fontSize: 10,
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
            fontSize: 10,
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
            fontSize: 10,
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
            fontSize: 10,
            maxCellHeight: 10,
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
                dataReport[0][i].ResultReport,
                dataReport[1][i].ResultReport,
                dataReport[2][i].ResultReport,
                dataReport[3][i].ResultReport,
                dataReport[CurrentRound - 1][i].Evaluation,
              ]);
            } else {
              dataInTable.push([
                //dataReport[i + j].ProcessReportName,
                dataReport[0][i + j].ItemReportName,
                dataReport[0][i + j].ControlRange,
                dataReport[0][i + j].ResultReport,
                dataReport[1][i + j].ResultReport,
                dataReport[2][i + j].ResultReport,
                dataReport[3][i + j].ResultReport,
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
            dataReport[0][i].ResultReport,
            dataReport[1][i].ResultReport,
            dataReport[2][i].ResultReport,
            dataReport[3][i].ResultReport,
            dataReport[CurrentRound - 1][i].Evaluation,
          ]);
        }
      } else {
        dataInTable.push([
          dataReport[0][i].ProcessReportName,
          dataReport[0][i].ItemReportName,
          dataReport[0][i].ControlRange,
          dataReport[0][i].ResultReport,
          dataReport[1][i].ResultReport,
          dataReport[2][i].ResultReport,
          dataReport[3][i].ResultReport,
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
        cellPadding: 0.5,
        fontSize: 10,
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
        fontSize: 10,
        cellPadding: 0.5,
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
      /*       willDrawCell: function (data) {
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[data.row.index].Evaluation == "LOW" ||
            dataReport[data.row.index].Evaluation == "HIGH" ||
            dataReport[data.row.index].Evaluation == "NOT PASS" ||
            dataReport[data.row.index].Evaluation == "NG"
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
      }, */
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

async function DataSet2(dataReport, CurrentRound, doc, currentY) {
  /* let DataSet = async (dataReport, CurrentRound, doc, currentY) => { */
  console.log("hondaDataSet2");
  try {
    doc.addPage("a4");
    currentY = 10;
    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: `MESSRS : ${dataReport[0][0].CustFull}`,
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 10,
              cellPadding: 1,
              //lineColor: 0,
              //lineWidth: 0.1,
              //maxCellHeight: 12,
              //cellWidth: 20,
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
            //fontSize: 10,
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
            // fontSize: 10,
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
            // fontSize: 10,
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
            // fontSize: 10,
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
            // fontSize: 8,
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
            // fontSize: 10,
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
            //   fontSize: 10,
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
            //  fontSize: 10,
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
            //  fontSize: 10,
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
            //    fontSize: 10,
          },
        },
      ],
    ];

    var dataInTable = [];
    var dataEvaluation = [];
    dataEvaluation.push(dataReport[0][3].Evaluation);
    dataEvaluation.push(dataReport[1][3].Evaluation);
    dataEvaluation.push(dataReport[2][3].Evaluation);
    dataEvaluation.push(dataReport[3][3].Evaluation);
    dataEvaluation.push(dataReport[CurrentRound - 1][3].Evaluation);

    dataEvaluation.push(dataReport[0][9].Evaluation);
    dataEvaluation.push(dataReport[1][9].Evaluation);
    dataEvaluation.push(dataReport[2][9].Evaluation);
    dataEvaluation.push(dataReport[3][9].Evaluation);
    dataEvaluation.push(dataReport[CurrentRound - 1][9].Evaluation);

    dataEvaluation.push(dataReport[0][8].Evaluation);
    dataEvaluation.push(dataReport[1][8].Evaluation);
    dataEvaluation.push(dataReport[2][8].Evaluation);
    dataEvaluation.push(dataReport[3][8].Evaluation);
    dataEvaluation.push(dataReport[CurrentRound - 1][8].Evaluation);

    dataEvaluation.push(dataReport[0][34].Evaluation);
    dataEvaluation.push(dataReport[1][34].Evaluation);
    dataEvaluation.push(dataReport[2][34].Evaluation);
    dataEvaluation.push(dataReport[3][34].Evaluation);
    dataEvaluation.push(dataReport[CurrentRound - 1][34].Evaluation);

    dataEvaluation.push(dataReport[0][35].Evaluation);
    dataEvaluation.push(dataReport[1][35].Evaluation);
    dataEvaluation.push(dataReport[2][35].Evaluation);
    dataEvaluation.push(dataReport[3][35].Evaluation);
    dataEvaluation.push(dataReport[CurrentRound - 1][35].Evaluation);

    dataInTable.push([
      "Pre-Degreasing",
      "Oil Content (g/l)",
      "Less than 6.0",
      dataReport[0][3].ResultReport,
      dataReport[1][3].ResultReport,
      dataReport[2][3].ResultReport,
      dataReport[3][3].ResultReport,
      dataReport[CurrentRound - 1][3].Evaluation,
    ]);
    dataInTable.push([
      { rowSpan: 2, content: "Degreasing" },
      "Surfactant (%)",
      "100 - 150 %",
      dataReport[0][9].ResultReport,
      dataReport[1][9].ResultReport,
      dataReport[2][9].ResultReport,
      dataReport[3][9].ResultReport,
      dataReport[CurrentRound - 1][9].Evaluation,
    ]);
    dataInTable.push([
      "Oil Content (g/l)",
      "Less than 5.0",
      dataReport[0][8].ResultReport,
      dataReport[1][8].ResultReport,
      dataReport[2][8].ResultReport,
      dataReport[3][8].ResultReport,
      dataReport[CurrentRound - 1][8].Evaluation,
    ]);
    dataInTable.push([
      "SPCC-HONDA",
      "Coating weight (g/m²)",
      "1.50 - 2.50",
      dataReport[0][34].ResultReport,
      dataReport[1][34].ResultReport,
      dataReport[2][34].ResultReport,
      dataReport[3][34].ResultReport,
      dataReport[CurrentRound - 1][34].Evaluation,
    ]);
    dataInTable.push([
      "GA-HONDA",
      "Coating weight (g/m²)",
      "2.30 - 5.00",
      dataReport[0][35].ResultReport,
      dataReport[1][35].ResultReport,
      dataReport[2][35].ResultReport,
      dataReport[3][35].ResultReport,
      dataReport[CurrentRound - 1][35].Evaluation,
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      head: dataInHeader,
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 0.5,
        lineColor: 0,
        lineWidth: 0.1,
        //minCellHeight: 10,
        //maxCellHeight: 10,
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
            dataEvaluation[data.row.index * 5 + (data.column.index - 3)] ==
            "LOW" ||
            dataEvaluation[data.row.index * 5 + (data.column.index - 3)] ==
            "HIGH" ||
            dataEvaluation[data.row.index * 5 + (data.column.index - 3)] ==
            "NOT PASS" ||
            dataEvaluation[data.row.index * 5 + (data.column.index - 3)] == "NG"
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
async function PicSetHONDAR(dataReport, CurrentRound, doc, currentY) {
  try {
    console.log("PicSetHONDAR");
    doc.autoTable({
      startY: currentY + 2,
      head: [
        [
          {
            content: "PERFORMANCE OF PHOSPHATE COATING (SEM picture (X 1,000))",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 10,
              cellPadding: 1,
              //lineColor: 0,
              //lineWidth: 0.1,
              maxCellHeight: 12,
              //cellWidth: 100,
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
            //fontSize: 10,
          },
        },
        {
          content: dataReport[0][picStartIndex].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            //fontSize: 10,
          },
        },
        {
          content: dataReport[0][1 + picStartIndex].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            //fontSize: 10,
          },
        },
        {
          content: dataReport[0][2 + picStartIndex].ProcessReportName,
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            //fontSize: 10,
            maxCellHeight: 12,
          },
        },
      ],
      [
        {
          content: "Material",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            maxCellHeight: 12,
            //fontSize: 10,
          },
        },
        {
          content: "(Thai Parkerizing Co., Ltd.)",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            maxCellHeight: 12,
            // fontSize: 10,
          },
        },
        {
          content: "(Honda Automobile(Thailand )Co., Ltd)",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            maxCellHeight: 12,
            //   fontSize: 10,
          },
        },
        {
          content: "(Honda Automobile(Thailand )Co., Ltd)",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "normal",
            maxCellHeight: 12,
            //  fontSize: 10,
          },
        },
      ],
    ];
    var dataInTable = [];
    var picSetData = [];
    var picHeight = 30;
    var picWidht = 50;
    var runningPic = 0;
    //SET PIC Report order 101 102 103

    for (j = 0; j < CurrentRound; j++) {
      for (i = 0; i < dataReport[0].length; i++) {
        if (dataReport[j][i].ReportOrder >= 100) {
          picStartIndex = i;
          break;
        }
      }
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
        if (dataReport[j][i].ReportOrder == 107) {
          dataInTable.push([
            {
              content: dataReport[j][i].ItemReportName,
              styles: {
                valign: "middle",
                halign: "center",
                maxCellHeight: 12,
                //fontSize: checkFontSize(dataReport[j][i].ItemReportName),
              },
            },
            {
              content: "-",
              styles: {
                valign: "middle",
                halign: "center",
                maxCellHeight: 12,
              },
            },
            /* {
              content:
                dataReport[j][i].ResultReport +
                " (Specification : " +
                dataReport[j][i].ControlRange +
                ")",
              styles: {
                valign: "middle",
                halign: "center",
                maxCellHeight: 14,
              },
            }, */
            {
              content: dataReport[j][i].ResultReport,
              styles: {
                valign: "middle",
                halign: "center",
                maxCellHeight: 14,
              },
            },
            {
              content: "-",
              styles: {
                valign: "middle",
                halign: "center",
                maxCellHeight: 12,
              },
            },
          ]);
          i = i + 1;
        } else {
          dataInTable.push([
            {
              content: dataReport[j][i].ItemReportName,
              styles: {
                valign: "middle",
                halign: "center",
                maxCellHeight: 12,
              }, //fontSize: checkFontSize(dataReport[j][i].ItemReportName),
            },
            {
              content: dataReport[j][i].ResultReport,
              styles: {
                valign: "middle",
                halign: "center",
                maxCellHeight: 12,
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
                maxCellHeight: 12,
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
                maxCellHeight: 12,
              },
            },
          ]);
          i = i + 3;
        }
      }
    }

    doc.autoTable({
      startY: currentY,
      head: dataInHeader,
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 0.5,
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
        fontSize: 8,
        cellPadding: 0.5,
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
          data.column.index >= 1 &&
          (data.row.index == 0 ||
            data.row.index == 3 ||
            data.row.index == 6 ||
            data.row.index == 9)
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

/* SignSetHONDAP = async (dataReport, doc, currentY) => {
 */
async function SignSetHONDAP(dataReport, doc, currentY) {
  try {
    var signWidth = 32;
    var signHeight = 10;
    var fontSize = 8;
    var margin = (210 - signWidth) / 2;
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
            content: "HATC Acknowledgement",
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
      margin: { left: margin },
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
      //maxCellHeight: 3,
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
        margin: { left: margin },
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
        margin: { left: margin },
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
