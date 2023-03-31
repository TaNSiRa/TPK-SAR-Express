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
    console.log("CreatePDF UCC");
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

    var doc = new jsPDF(); // defualt unit mm.
    var currentY = 0;
    doc.setFont("THSarabun");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    buffDoc = await DataSet(dataBuffSet, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //comment Set
    buffDoc = await Pattern_MainC.CommentSet(
      dataBuffSet[dataBuffSet.length - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Pic Set
    buffDoc = await PicFilter(
      dataBuffSet[dataBuffSet.length - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];
    currentY = currentY + 4;
    //sign set
    buffDoc = await Pattern_MainH.SignSet(dataReport, doc, currentY);
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
  console.log("UCC");
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
          colSpan: 2,
          content: "NOX-RUST 320H",
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
      [
        {
          content: "Sampling date",
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
          content: "Issued date",
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
      console.log("1234" + dataReport[i][0].Evaluation);
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
        0: { cellWidth: 20 },
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
        content: dtget.toDateOnlyMonthName(dataReport[4].SamplingDate),
        styles: {
          valign: "middle",
          halign: "center",
        },
      },
    ]);
    dataInTable.push([
      {
        content: "Solid content = " + dataReport[4].ResultReport + " mg/50ml",
        styles: {
          valign: "middle",
          halign: "center",
        },
      },
    ]);

    doc.autoTable({
      startY: currentY + 4,
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
      margin: { left: 210 / 2 - picWidht / 2 },
      columnStyles: {
        0: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (data.row.index == 0) {
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
