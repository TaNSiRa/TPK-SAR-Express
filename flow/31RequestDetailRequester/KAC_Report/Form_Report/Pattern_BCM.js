const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSetYear.js");
const Pattern_MainD = require("./PatternComponent/Pattern_BCM.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSetYear.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");

exports.CreatePDF = async (dataReport) => {
  try {
    //manage data
    var CustFull = dataReport[0].CustFull;
    var monthRequest = dtget.toMonthOnly(dataReport[0].SamplingDate);
    var yearRequest = dtget.toYearOnly(dataReport[0].SamplingDate);
    var dataBuff;
    //console.log(dtget.toDateSQL(dataReport[0].SamplingDate));
    /*  dataBuff = await mssql.qurey(
      `select * from Routine_KACReport where Custfull = '${CustFull}' 
    AND SamplingDate <= '${dtget.toDateSQL(dataReport[0].SamplingDate)}'
    AND MONTH(SamplingDate) = ${monthRequest} 
    AND YEAR(SamplingDate) = ${yearRequest} order by SamplingDate,reportorder`
    ); */
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
    var currentRound = dataBuffSet.length;
    console.log(dataBuffSet.length);
    //add blank data for one per month
    for (var j = 0; j < dataBuffSet.length; j = j + 2) {
      console.log(j);
      //check last data
      if (j + 1 >= dataBuffSet.length) {
        break;
      } else {
        for (let i = 0; i < dataBuffSet[j].length; i++) {
          if (
            dataBuffSet[j][i].ReportOrder != dataBuffSet[j + 1][i].ReportOrder
          ) {
            dataBuffSet[j + 1].splice(i, 0, {
              CreateReportDate: dataBuffSet[j][i].CreateReportDate,
              SamplingDate: dataBuffSet[j][i].SamplingDate,
              ProcessReportName: dataBuffSet[j][i].ProcessReportName,
              ItemReportName: dataBuffSet[j][i].ItemReportName,
              ControlRange: dataBuffSet[j][i].ControlRange,
              ResultReport: "-",
              Evaluation: dataBuffSet[j][i].Evaluation,
            });
          }
        }
      }
    }

    //add blank week data
    for (var j = currentRound; j < 24; j++) {
      dataBuffSet.push([]);
      for (var i = 0; i < dataBuffSet[0].length; i++) {
        dataBuffSet[j].push({
          CreateReportDate: "",
          SamplingDate: "",
          ProcessReportName: "",
          ItemReportName: "",
          ControlRange: "",
          ResultReport: "",
          Evaluation: "",
        });
      }
    }

    var doc = new jsPDF("l", "mm", "a3"); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    console.log("BCM");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSetYearA3(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    buffDoc = await Pattern_MainD.DataSetYearVer2(dataBuffSet, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Comment Set
    buffDoc = await Pattern_MainC.CommentSetYear(
      dataBuffSet[currentRound - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    //currentY = buffDoc[1];

    //Sign set
    buffDoc = await Pattern_MainH.SignSetYear(
      dataBuffSet[currentRound - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];

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

exports.CreatePDFA3 = async (dataReport) => {
  try {
    //manage data
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
    console.log(dataBuffSet.length);
    //add blank data for one per month
    for (var j = 0; j < dataBuffSet.length; j = j + 2) {
      console.log(j);
      //check last data
      if (j + 1 >= dataBuffSet.length) {
        break;
      } else {
        for (let i = 0; i < dataBuffSet[j].length; i++) {
          if (
            dataBuffSet[j][i].ReportOrder != dataBuffSet[j + 1][i].ReportOrder
          ) {
            dataBuffSet[j + 1].splice(i, 0, {
              CreateReportDate: dataBuffSet[j][i].CreateReportDate,
              SamplingDate: dataBuffSet[j][i].SamplingDate,
              ProcessReportName: dataBuffSet[j][i].ProcessReportName,
              ItemReportName: dataBuffSet[j][i].ItemReportName,
              ControlRange: dataBuffSet[j][i].ControlRange,
              ResultReport: "-",
              Evaluation: dataBuffSet[j][i].Evaluation,
            });
          }
        }
      }
    }

    //add blank week data
    for (var j = currentRound; j < 24; j++) {
      dataBuffSet.push([]);
      for (var i = 0; i < dataBuffSet[0].length; i++) {
        dataBuffSet[j].push({
          CreateReportDate: "",
          SamplingDate: "",
          ProcessReportName: "",
          ItemReportName: "",
          ControlRange: "",
          ResultReport: "",
          Evaluation: "",
        });
      }
    }

    var doc = new jsPDF("l", "mm", "a3"); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;

    doc.setFont("THSarabun");
    console.log("Y2TMA3");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSetYearA3(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    buffDoc = await Pattern_MainD.DataSetYearA3(dataBuffSet, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Comment Set
    buffDoc = await Pattern_MainC.CommentSetYearA3(
      dataBuffSet[currentRound - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    //currentY = buffDoc[1];

    //Sign set
    buffDoc = await Pattern_MainH.SignSetYearA3(
      dataBuffSet[currentRound - 1],
      doc,
      currentY
    );
    doc = buffDoc[0];
    currentY = buffDoc[1];

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
