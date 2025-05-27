const fs = require("fs");
const express = require("express");
const router = express.Router();
var { ReportManager } = require("mssql-ssrs");

var ssrs = new ReportManager();

exports.loginServer = async () => {
  try {
    console.log("login2");
    // must set server url
    //var serverUrl = '172.23.10.51:ReportServer';
    var url = "172.23.10.51/ReportServer";
    //var path = `C:\\Program Files\\Microsoft SQL Server Reporting Services\\SSRS\\ReportServer`;

    var serverConfig = {
      server: "172.23.10.51",
      instance: "SAR",
      isHttps: false, // optional, default: false
      port: 80, // optional, default: 80
    };
    /* var soapConfig = {
      username: "administrator",
      password: "Report1234",
    }; */
    var soapConfig = {
      username: "sa",
      password: "Automatic",
    };
    ssrs.start(url, soapConfig, null, serverConfig);

    /*     var format = "pdf";
    var reportPath = "/folder/reportname";
    //var params = { paramName: paramValue };
    var auth = { userName: "Administrator", password: "Report1234" };

    var report = await ssrs.reportExecution.getReportByUrl(
      reportPath,
      format,
      params,
      auth
    ); */

    //fs.writeFile(path, report);
  } catch (error) {
    console.log(error);
  }
};

/* exports.downloadPDF = async(pdfURL, outputFilename) =>{
    console.log('in222');
    let pdfBuffer = await request.get({uri: pdfURL, encoding: null});
    console.log("Writing downloaded PDF file to " + outputFilename + "...");
    fs.writeFileSync(outputFilename, pdfBuffer);
}
 */
//downloadPDF("https://www.ieee.org/content/dam/ieee-org/ieee/web/org/pubs/ecf_faq.pdf", "c:/temp/somePDF.pdf");
/* const request = require("request-promise-native");

var { ReportManager } = require('mssql-ssrs');

var ssrs = new ReportManager([cacheReports]);
await ssrs.start(url/path/serverConfig, soapConfig [, options] [, security]);

const list = await ssrs.reportService.listChildren(reportPath);
const report = await ssrs.reportExecution.getReport(reportPath, fileType, parameters);

//var url = 'http(s)://<serverName>:<port>/ReportServer_<sqlInstance>',
var url = 'http://172.23.10.51/ReportServer',
var serverConfig = {
    server: '172.23.10.51',
    instance: 'SAR',
    isHttps: false, // optional, default: false
    port: 80, // optional, default: 80
};

var soapConfig = {
    username: 'administrator', 
    password: 'Report1234', 
} */
