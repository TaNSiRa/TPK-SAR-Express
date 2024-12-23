const http = require("http"); // or 'https' for https:// URLs
const fs = require("fs");
const request = require("request-promise-native");

const file = fs.createWriteStream("file.pdf");
exports.request = async () => {
  http.get(
    "http://172.23.10.51/ReportServer?%2fReport+Project1%2fSAR_KAC&rs:Format=PDF&rs:ClearSession=true&rs:Command=Render&ReqNo=RTB-MKT-22-002",
    {
      'auth': {
        'user': 'Administrator',
        'pass': 'Report1234',
        'sendImmediately': false
      }
    },
    function (response) {
      response.pipe(file);
      console.log(file);
      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log("Download Completed");
      });
    }
  );
};

exports.downloadPDF = async (pdfURL, outputFilename) => {
  console.log("in222");
  //let pdfBuffer = await request.get({ uri: pdfURL, encoding: pdf });
  let pdfBuffer = await request.get({ uri: pdfURL });
  //console.log("Writing downloaded PDF file to " + outputFilename + "...");
  //fs.writeFileSync(outputFilename, pdfBuffer);
  //console.log('Complete');
};
