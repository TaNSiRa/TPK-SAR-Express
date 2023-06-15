const express = require("express");
const router = express.Router();
const mssql = require("../../../function/mssql.js");
const dtget = require("../../../function/dateTime.js");
const createReport = require("../function/createReport.js");

const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const Jimp = require("jimp");

router.post("/KACReportData_searchKACReportData", async (req, res) => {
  console.log("in searchKACReportData");
  //console.log(req.body.reqNo);
  try {
    var dt = dtget.DateTimeNow();
    var reqNo = req.body.reqNo;
    var query = `if exists (select ReqNo from [Routine_KACReport] where reqNo = '${reqNo}')
    begin 
        select * from [Routine_KACReport] where reqNo = '${reqNo}' order by ReportOrder asc
    end
    else
    begin 
    select
           [CustFull]
          ,[ReqNo]
          ,[PatternReport]
          ,[ReportOrder]
          ,[SampleNo]
          ,[GroupNameTS]
          ,[SampleGroup]
          ,[SampleType]
          ,[SampleTank]
          ,[SampleName]
          ,[ProcessReportName]
          ,[SamplingDate]
          ,[ItemNo]
          ,[ItemName]
          ,[ItemReportName]
          ,[StdFactor]
          ,[StdMax]
          ,[StdSymbol]
          ,[StdMin]
          ,[ControlRange]
          ,[Result] as [ResultIn]
          ,'' as [ResultReport]
          ,'' as [Incharge]
          ,[SubLeader]
          ,[GL]
          ,[JP]
          ,[DGM]
          ,'' as Std1
          ,'' as Std2
          ,'' as Std3
          ,'' as Std4
          ,'' as Std5
          ,'' as Std6
          ,'' as Std7
          ,'' as Std8
          ,'' as Std9
          from Routine_ManualDataInput WHERE reqNo = '${reqNo}' 
          and ReportOrder != '0' UNION 
    select  
           [CustFull]
          ,[ReqNo]
          ,''
          ,[ReportOrder]
          ,[SampleNo]
          ,[GroupNameTS]
          ,[SampleGroup]
          ,[SampleType]
          ,[SampleTank]
          ,[SampleName]
          ,[ProcessReportName]
          ,''
          ,[ItemNo]
          ,[ItemName]
          ,[ItemReportName]
          ,[StdFactor]
          ,[StdMax]
          ,[StdSymbol]
          ,[StdMin]
          ,[ControlRange]
          ,[ResultComplete]
          ,''
          ,[Incharge]
          ,''
          ,''
          ,''
          ,''
          ,[Std1]
          ,[Std2]
          ,[Std3]
          ,[Std4]
          ,[Std5]
          ,[Std6]
          ,[Std7]
          ,[Std8]
          ,[Std9]
    from Routine_RequestLab where reqNo = '${reqNo}' and ReportOrder != '0' 
    order by ReportOrder asc end;`;
    var data = await mssql.qurey(query);

    res.send(data.recordset);
  } catch (error) {
    console.log(error);
    res.json("ERROR");
  }
});

router.post("/KACReportData_saveKACReportData", async (req, res) => {
  console.log("in _saveKACReportData");
  //console.log(req.body);
  try {
    var data = JSON.parse(req.body.data);
    var dt = dtget.DateTimeNow();
    //console.log(data);
    //console.log(data[0].ReqNo);

    var query = `
  Delete from [Routine_KACReport] where reqNo = '${data[0].ReqNo}';`;
    var queryInsert = `
  Insert into Routine_KACReport (
        [ReqNo]
        ,[CustFull]
        ,[PatternReport]
        ,[ReportOrder]
        ,[SampleNo]
        ,[GroupNameTS]
        ,[SampleGroup]
        ,[SampleType]
        ,[SampleTank]
        ,[SampleName]
        ,[ProcessReportName]
        ,[SamplingDate]
        ,[CreateReportDate]
        ,[ItemNo]
        ,[ItemName]
        ,[ItemReportName]
        ,[StdFactor]
        ,[StdMax]
        ,[StdSymbol]
        ,[StdMin]
        ,[ControlRange]
        ,[ResultIn]
        ,[ResultReport]
        ,[Evaluation]
        ,[Incharge]
        ,[SubLeader]
        ,[GL]
        ,[JP]
        ,[DGM]
        ,[NextApprover]
        ,[Comment1]
        ,[Comment2]
        ,[Comment3]
        ,[Comment4]
        ,[Comment5]
        ,[Comment6]
        ,[Comment7]
        ,[Comment8]
        ,[Comment9]
        ,[Comment10]
  ) values `;

    for (i = 0; i < data.length; i++) {
      queryInsert =
        queryInsert +
        `( '${data[i].ReqNo}'
      ,'${data[i].CustFull}'
      ,'${data[i].PatternReport}'
      ,'${data[i].ReportOrder}'
      ,'${data[i].SampleNo}'
      ,'${data[i].GroupNameTS}'
      ,'${data[i].SampleGroup}'
      ,'${data[i].SampleType}'
      ,'${data[i].SampleTank}'
      ,'${data[i].SampleName}'
      ,'${data[i].ProcessReportName}'
      ,'${data[i].SamplingDate}'
      ,'${data[i].CreateReportDate}'
      ,'${data[i].ItemNo}'
      ,'${data[i].ItemName}'
      ,'${data[i].ItemReportName}'
      ,'${data[i].StdFactor}'
      ,'${data[i].StdMax}'
      ,'${data[i].StdSymbol}'
      ,'${data[i].StdMin}'
      ,'${data[i].ControlRange}'
      ,'${data[i].ResultIn}'
      ,'${data[i].ResultReport}'
      ,'${data[i].Evaluation}'
      ,'${data[i].Incharge}'
      ,'${data[i].SubLeader}'
      ,'${data[i].GL}'
      ,'${data[i].JP}'
      ,'${data[i].DGM}'
      ,'${data[i].NextApprover}'
      ,'${data[i].Comment1}'
      ,'${data[i].Comment2}'
      ,'${data[i].Comment3}'
      ,'${data[i].Comment4}'
      ,'${data[i].Comment5}'
      ,'${data[i].Comment6}'
      ,'${data[i].Comment7}'
      ,'${data[i].Comment8}'
      ,'${data[i].Comment9}'
      ,'${data[i].Comment10}'
      )`;
      if (i !== data.length - 1) {
        queryInsert = queryInsert + ",";
      }
    }
    query = query + queryInsert + ";";
    await mssql.qurey(query);
    for (let i = 0; i < 3; i++) {
      var report = await createReport.CreateReport(data[0].ReqNo);
      const stringLength = report.length;
      const sizeInBytes = stringLength * (3 / 4) - 2;
      const sizeInKb = sizeInBytes / 1000;
      console.log(sizeInKb);
      if (sizeInKb < 10000) {
        break;
      }
    }
    res.send(report);
  } catch (error) {
    console.log(error);
    res.json("ERROR");
  }
});

router.post("/KACReportData_createKACReport", async (req, res) => {
  console.log("in _createKACReport");
  //console.log(req.body);
  try {
    var data = JSON.parse(req.body.data);
    var dt = dtget.DateTimeNow();
    //console.log(data);
    //console.log(data[0].ReqNo);

    var query = `
  Delete from [Routine_KACReport] where reqNo = '${data[0].ReqNo}';`;
    var queryInsert = `
  Insert into Routine_KACReport (
        [ReqNo]
        ,[CustFull]
        ,[ReviseNo]
        ,[PatternReport]
        ,[ReportOrder]
        ,[SampleNo]
        ,[GroupNameTS]
        ,[SampleGroup]
        ,[SampleType]
        ,[SampleTank]
        ,[SampleName]
        ,[ProcessReportName]
        ,[SamplingDate]
        ,[CreateReportDate]
        ,[ItemNo]
        ,[ItemName]
        ,[ItemReportName]
        ,[StdFactor]
        ,[StdMax]
        ,[StdSymbol]
        ,[StdMin]
        ,[ControlRange]
        ,[ResultIn]
        ,[ResultReport]
        ,[Evaluation]
        ,[Incharge]
        ,[InchargeTime]
        ,[SubLeader]
        ,[GL]
        ,[JP]
        ,[DGM]
        ,[NextApprover]
        ,[Comment1]
        ,[Comment2]
        ,[Comment3]
        ,[Comment4]
        ,[Comment5]
        ,[Comment6]
        ,[Comment7]
        ,[Comment8]
        ,[Comment9]
        ,[Comment10]
        ,[ReportRemark]
        ,[InchargeTime_0]
  ) values `;

    for (i = 0; i < data.length; i++) {
      queryInsert =
        queryInsert +
        `( '${data[i].ReqNo}'
      ,'${data[i].CustFull}'
      ,'${data[i].ReviseNo}'
      ,'${data[i].PatternReport}'
      ,'${data[i].ReportOrder}'
      ,'${data[i].SampleNo}'
      ,'${data[i].GroupNameTS}'
      ,'${data[i].SampleGroup}'
      ,'${data[i].SampleType}'
      ,'${data[i].SampleTank}'
      ,'${data[i].SampleName}'
      ,'${data[i].ProcessReportName}'
      ,'${data[i].SamplingDate}'
      ,'${dt}'
      ,'${data[i].ItemNo}'
      ,'${data[i].ItemName}'
      ,'${data[i].ItemReportName}'
      ,'${data[i].StdFactor}'
      ,'${data[i].StdMax}'
      ,'${data[i].StdSymbol}'
      ,'${data[i].StdMin}'
      ,'${data[i].ControlRange}'
      ,'${data[i].ResultIn}'
      ,'${data[i].ResultReport}'
      ,'${data[i].Evaluation}'
      ,'${data[i].Incharge}'
      ,'${dt}'
      ,'${data[i].SubLeader}'
      ,'${data[i].GL}'
      ,'${data[i].JP}'
      ,'${data[i].DGM}'
      ,'${data[i].NextApprover}'
      ,'${data[i].Comment1}'
      ,'${data[i].Comment2}'
      ,'${data[i].Comment3}'
      ,'${data[i].Comment4}'
      ,'${data[i].Comment5}'
      ,'${data[i].Comment6}'
      ,'${data[i].Comment7}'
      ,'${data[i].Comment8}'
      ,'${data[i].Comment9}'
      ,'${data[i].Comment10}'
      ,'${data[i].ReportRemark}'
      ,'${dt}'
      )`;
      if (i !== data.length - 1) {
        queryInsert = queryInsert + ",";
      }
    }
    query = query + queryInsert + ";";
    await mssql.qurey(query);
    for (let i = 0; i < 3; i++) {
      var report = await createReport.CreateReport(data[0].ReqNo);
      const stringLength = report.length;
      const sizeInBytes = stringLength * (3 / 4) - 2;
      const sizeInKb = sizeInBytes / 1000;
      console.log(sizeInKb);
      if (sizeInKb < 10000) {
        break;
      }
    }
    res.send(report);
  } catch (error) {
    console.log(error);
    res.json("ERROR");
  }
});

router.post("/KACReportData_reviseKACReport", async (req, res) => {
  console.log("in _reviseKACReport");
  //console.log(req.body);
  try {
    var data = JSON.parse(req.body.data);
    var dt = dtget.DateTimeNow();
    //console.log(data);
    ///console.log(data[0].ReqNo);
    var query = "";
    /*     var query = `
    Delete from [Routine_KACReport] where reqNo = '${data[0].ReqNo}';`; */

    var queryUpdate = "";

    for (let i = 0; i < data.length; i++) {
      queryUpdate =
        queryUpdate +
        `
    update Routine_KACReport set
    [ResultReport] = '${data[i].ResultReport}'
    ,[ReviseNo] = '${data[i].ReviseNo}'
    ,[Evaluation] = '${data[i].Evaluation}'
    ,[ReportRemark] = '${data[i].ReportRemark}'
    ,[NextApprover] = '${data[i].NextApprover}'
    ,[Comment1] = '${data[i].Comment1}'
    ,[Comment2] = '${data[i].Comment2}'
    ,[Comment3] = '${data[i].Comment3}'
    ,[Comment4] = '${data[i].Comment4}'
    ,[Comment5] = '${data[i].Comment5}'
    ,[Comment6] = '${data[i].Comment6}'
    ,[Comment7] = '${data[i].Comment7}'
    ,[Comment8] = '${data[i].Comment8}'
    ,[Comment9] = '${data[i].Comment9}'
    ,[Comment10] ='${data[i].Comment10}'
    ,[InchargeTime] = '${dt}'
    ,[SubLeaderTime] = null
    ,[GLTime] = null
    ,[DGMTime] = null
    ,[JPTime] = null
    ,[InchargeTime_${data[i].ReviseNo}] = '${dt}'
    ,[SubLeaderTime_${data[i].ReviseNo}] = null
    ,[GLTime_${data[i].ReviseNo}] = null
    ,[DGMTime_${data[i].ReviseNo}] = null
    ,[JPTime_${data[i].ReviseNo}] = null
    where id = ${data[i].ID} ; 
    `;
    }


    query = queryUpdate;
    //console.log(query);
    await mssql.qurey(query);
    for (let i = 0; i < 3; i++) {
      var report = await createReport.CreateReport(data[0].ReqNo);
      const stringLength = report.length;
      const sizeInBytes = stringLength * (3 / 4) - 2;
      const sizeInKb = sizeInBytes / 1000;
      console.log(sizeInKb);
    
      if (sizeInKb < 10000) {
        break;
      }
    }

    

    res.send(report);
  } catch (error) {
    console.log(error);
    res.json("ERROR");
  }
});

router.post("/KACReportData_LoadReport", async (req, res) => {
  console.log("in _LoadReport");
  //console.log(req.body.ReqNo);
  try {
    for (let i = 0; i < 3; i++) {
      var report = await createReport.CreateReport(req.body.ReqNo);
      const stringLength = report.length;
      const sizeInBytes = stringLength * (3 / 4) - 2;
      const sizeInKb = sizeInBytes / 1000;
      console.log(sizeInKb);
      if (sizeInKb < 10000) {
        break;
      }
    }
    res.send(report);
    /* var path =
      "C:\\AutomationProject\\SAR\\asset_ts\\Report\\KAC\\" +
      req.body.ReqNo +
      ".pdf";
    if (fs.existsSync(path)) {//check file
      console.log("ok");
      var bitmap = fs.readFileSync(path);
      res.send(bitmap.toString("base64"));
    } else {
      var report = await createReport.CreateReport(req.body.ReqNo);
      res.send(report);
    } */

    /*  try {
    var checkFile = new File("/data/logs/today.log");
    // See if the file exists
    if (checkFile.exists()) {
      write("The file exists");
    } else {
      write("The file does not exist");
    }
 */

    /* var buffDataIn = await mssql.qurey(
      `select * from Routine_KACReport where reqno = 'RTR-MKT-22-0208' and reportorder != 0 order by reportorder asc`
    );
    //console.log(dataReport);
    //var dataReport = new ReportData_Structure();
    dataReport = buffDataIn.recordset;
    var pdf = await createpdf.SelectPattern(dataReport);
    res.send(pdf); */
  } catch (error) {
    console.log(error);
    res.send("ERROR");
    return error;
  }
});

router.post("/KACReportData_TestGraph", async (req, res) => {
  console.log("KACReportData_TestGraph");
  try {
    let bitmap = await fs.readFileSync(
      `C:\\AutomationProject\\SAR\\asset\\bufferPiC\\bufferGraph5.png`
    );
    console.log("000000000000000");
    var buff;
    await Jimp.read(Buffer.from(bitmap, "base64"))
      .then((lenna) => {
        lenna
          .resize(100, 100) // resize
          .quality(10); // set JPEG quality
        lenna.getBase64(Jimp.AUTO, (err, res) => {
          buff = res;
        });
      })
      .catch((err) => {
        console.error(err);
      });
    console.log("111111111111111");
    console.log(buff);
    res.send(bitmap.toString("base64"));
    //res.send(buff.replace(/^data:image\/png;base64,/, ""));
  } catch (error) {
    console.log(error);
    res.send("bitmap");
    return error;
  }
});

router.post("/KACReportData_TestGraph222", async (req, res) => {
  console.log("KACReportData_TestGraph2222");
  try {
    const width = 400; //px
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
    console.log(configuration.data.labels);
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl;
    var base64Data = await base64Image.replace(/^data:image\/png;base64,/, "");
    /* 
    var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    console.log("aaaaa");
    fs.writeFile("out.png", base64Data, "base64", function (err) {
      if (err) {
        console.log(err);
      }
    }); */
    res.send(base64Data);
    return base64Image;
  } catch (error) {
    console.log(error);
    res.send("bitmap");
    return error;
  }
});

router.post("/KACReportData_TestResize", async (req, res) => {
  console.log("KACReportData_TestSize");
  try {
    const width = 400; //px
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
    //console.log(configuration.data.labels);
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl;
    var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    var buff;
    await Jimp.read(Buffer.from(base64Data, "base64"))
      .then((lenna) => {
        lenna
          .resize(256, 256) // resize
          .quality(10); // set JPEG quality
        lenna.getBase64(Jimp.AUTO, (err, res) => {
          buff = res;
        });
      })
      .catch((err) => {
        console.error(err);
      });
    console.log(buff);
    res.send(buff.replace(/^data:image\/png;base64,/, ""));
    return base64Image;
  } catch (error) {
    console.log(error);
    res.send("bitmap");
    return error;
  }
});

module.exports = router;
