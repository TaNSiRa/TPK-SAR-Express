const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSet.js");
const Pattern_MainP = require("./PatternComponent/Pattern_3MainPicSet.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSet.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const mssql = require("../../../../function/mssql.js");
const dtConv = require("../../../../function/dateTime.js");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");
/* const THSarabunNew = require("../../../../asset/THSarabun-normal.js");
const THSarabunNewl = require("../../../../asset/THSarabun Italic-italic.js");
const THSarabunNewb = require("../../../../asset/THSarabun Bold-bold.js");
const THSarabunNewll = require("../../../../asset/THSarabun Bold Italic-italic.js"); */

exports.CreatePDF = async (dataReport) => {
  try {
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
    //remove data over 17 round
    if (dataBuffSet.length > 17) {
      dataBuffSet.splice(0, dataBuffSet.length - 17);
    }
    /*     for (let i = 0; i < 3; i++) {
      console.log(dataBuffSet[i].length);
    } */
    var currentRound = dataBuffSet.length;

    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;
    // set up new language
    //console.log(doc.getFontList());
    /*doc.addFileToVFS("THSarabun-normal.ttf", THSarabunNew);
    doc.addFont("THSarabun-normal.ttf", "THSarabun", "normal");
    doc.addFileToVFS('THSarabun Italic-italic.ttf', THSarabunNewl);
    doc.addFont('THSarabun Italic-italic.ttf', 'THSarabun Italic', 'italic');
    doc.addFileToVFS('THSarabun Bold-bold.ttf', THSarabunNewb);
    doc.addFont('THSarabun Bold-bold.ttf', 'THSarabun Bold', 'bold');
    doc.addFileToVFS('THSarabun Bold Italic-italic.ttf', THSarabunNewbll);
    doc.addFont('THSarabun Bold Italic-italic.ttf', 'THSarabun Italic', 'italic'); */
    //finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont("THSarabun");
    console.log("2");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //SignSet
    buffDoc = await Pattern_MainH.SignSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //Data Set
    buffDoc = await Pattern_MainD.DataSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Pic
    buffDoc = await Pattern_MainP.PicSetforATT(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Comment
    buffDoc = await Pattern_MainC.CommentSetforATT(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Document Code
    doc = await Pattern_Doc.MasterWeeklyDocument(doc);
    doc.addPage();

    //Set Graph
    buffDoc = await SetGraph(dataBuffSet, doc, [1], 10);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Graph
    buffDoc = await SetGraph1(dataBuffSet, doc, [3], 10);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Graph
    buffDoc = await SetGraph2(dataBuffSet, doc, [13], 10);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Graph
    buffDoc = await SetGraph3(dataBuffSet, doc, [4], 10);
    doc = buffDoc[0];
    currentY = buffDoc[1];


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

async function SetGraph(dataReport, doc, indexGraph, xPosition) {
  try {
    doc.autoTable({
      startY: 15,
      head: [
        [
          {
            content: "Control chart",
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
              cellWidth: 50,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    console.log("SetGraph");
    var picWidth = 150; // ความกว้างของกราฟ
    var picHeight = 40; // ความสูงของกราฟ
    var currentY = 5; // ตำแหน่ง Y ปัจจุบันสำหรับกราฟ
    var countGraph = 0; // ตัวนับจำนวนกราฟ
    var picGraph = []; // อาร์เรย์เก็บภาพกราฟ
    var dataBody = []; // อาร์เรย์เก็บข้อมูลที่จะใช้ในตาราง
    var pageWidth = doc.internal.pageSize.getWidth(); // ความกว้างของหน้า PDF
    xPosition = (pageWidth - picWidth) / 2; // คำนวณตำแหน่ง x ให้อยู่กลางหน้า

    // เตรียมภาพ
    for (let i = 0; i < indexGraph.length; i++) {
      picGraph.push(await GraphPic(dataReport, indexGraph[i])); // สร้างภาพกราฟ
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
      startY: 30, // ตำแหน่ง Y เริ่มต้นของตาราง
      head: [
        [
          {
            content: "Electro Conductivity",
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
              cellWidth: picWidth,
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
        0: { cellWidth: picWidth },
      },
      margin: { left: xPosition }, // กำหนดระยะห่างจากขอบซ้ายให้กราฟอยู่ตรงกลาง
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
              picWidth - 2,
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
}

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

    let StdMin, StdMax;

    for (let i = 0; i < dataReport.length; i++) {
      StdMin = dataReport[i][indexData].StdMin;
      StdMax = dataReport[i][indexData].StdMax;
      buffDate.push(dtConv.toDateOnlyMonthName(dataReport[i][indexData].SamplingDate));
      buffUpper.push(StdMax); // ค่าคงที่สำหรับเส้น Max
      buffLower.push(StdMin); // ค่าคงที่สำหรับเส้น Min
      bufData.push(dataReport[i][indexData].ResultReport);
      console.log('bufdata : ' + bufData); // ตรวจสอบค่าที่เพิ่มเข้าไปใน bufData
    }

    if (StdMin === undefined || StdMax === undefined) {
      throw new Error("No data found for the specified ProcessReportName and ItemReportName.");
    }

    let chartMin = StdMin * 0.85;
    let chartMax = StdMax * 1.15;
    // if (StdMin < 5) {
    //   chartMin = 0;
    // }
    // console.log('suggestedMin : ' + chartMin);
    // console.log('suggestedMax : ' + chartMax);
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

async function SetGraph1(dataReport, doc, indexGraph, xPosition) {
  try {
    doc.autoTable({
      startY: 15,
      head: [
        [
          {
            content: "Control chart",
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
              cellWidth: 50,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    console.log("SetGraph");
    var picWidth = 150; // ความกว้างของกราฟ
    var picHeight = 40; // ความสูงของกราฟ
    var currentY = 5; // ตำแหน่ง Y ปัจจุบันสำหรับกราฟ
    var countGraph = 0; // ตัวนับจำนวนกราฟ
    var picGraph = []; // อาร์เรย์เก็บภาพกราฟ
    var dataBody = []; // อาร์เรย์เก็บข้อมูลที่จะใช้ในตาราง
    var pageWidth = doc.internal.pageSize.getWidth(); // ความกว้างของหน้า PDF
    xPosition = (pageWidth - picWidth) / 2; // คำนวณตำแหน่ง x ให้อยู่กลางหน้า

    // เตรียมภาพ
    for (let i = 0; i < indexGraph.length; i++) {
      picGraph.push(await GraphPic1(dataReport, indexGraph[i])); // สร้างภาพกราฟ
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
      startY: 90, // ตำแหน่ง Y เริ่มต้นของตาราง
      head: [
        [
          {
            content: "Non-Volatile Content",
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
              cellWidth: picWidth,
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
        0: { cellWidth: picWidth },
      },
      margin: { left: xPosition }, // กำหนดระยะห่างจากขอบซ้ายให้กราฟอยู่ตรงกลาง
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
              picWidth - 2,
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
}

async function GraphPic1(dataReport, indexData) {
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

    let StdMin, StdMax;

    for (let i = 0; i < dataReport.length; i++) {
      StdMin = dataReport[i][indexData].StdMin;
      StdMax = dataReport[i][indexData].StdMax;
      buffDate.push(dtConv.toDateOnlyMonthName(dataReport[i][indexData].SamplingDate));
      buffUpper.push(StdMax); // ค่าคงที่สำหรับเส้น Max
      buffLower.push(StdMin); // ค่าคงที่สำหรับเส้น Min
      bufData.push(dataReport[i][indexData].ResultReport);
      console.log('bufdata : ' + bufData); // ตรวจสอบค่าที่เพิ่มเข้าไปใน bufData
    }

    if (StdMin === undefined || StdMax === undefined) {
      throw new Error("No data found for the specified ProcessReportName and ItemReportName.");
    }

    let chartMin = StdMin * 0.85;
    let chartMax = StdMax * 1.15;
    // if (StdMin < 5) {
    //   chartMin = 0;
    // }
    // console.log('suggestedMin : ' + chartMin);
    // console.log('suggestedMax : ' + chartMax);
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

async function SetGraph2(dataReport, doc, indexGraph, xPosition) {
  try {
    doc.autoTable({
      startY: 15,
      head: [
        [
          {
            content: "Control chart",
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
              cellWidth: 50,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    console.log("SetGraph");
    var picWidth = 150; // ความกว้างของกราฟ
    var picHeight = 40; // ความสูงของกราฟ
    var currentY = 5; // ตำแหน่ง Y ปัจจุบันสำหรับกราฟ
    var countGraph = 0; // ตัวนับจำนวนกราฟ
    var picGraph = []; // อาร์เรย์เก็บภาพกราฟ
    var dataBody = []; // อาร์เรย์เก็บข้อมูลที่จะใช้ในตาราง
    var pageWidth = doc.internal.pageSize.getWidth(); // ความกว้างของหน้า PDF
    xPosition = (pageWidth - picWidth) / 2; // คำนวณตำแหน่ง x ให้อยู่กลางหน้า

    // เตรียมภาพ
    for (let i = 0; i < indexGraph.length; i++) {
      picGraph.push(await GraphPic2(dataReport, indexGraph[i])); // สร้างภาพกราฟ
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
      startY: 150, // ตำแหน่ง Y เริ่มต้นของตาราง
      head: [
        [
          {
            content: "Coating Weight",
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
              cellWidth: picWidth,
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
        0: { cellWidth: picWidth },
      },
      margin: { left: xPosition }, // กำหนดระยะห่างจากขอบซ้ายให้กราฟอยู่ตรงกลาง
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
              picWidth - 2,
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
}

async function GraphPic2(dataReport, indexData) {
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

    let StdMin, StdMax;

    for (let i = 0; i < dataReport.length; i++) {
      StdMin = dataReport[i][indexData].StdMin;
      StdMax = dataReport[i][indexData].StdMax;
      buffDate.push(dtConv.toDateOnlyMonthName(dataReport[i][indexData].SamplingDate));
      buffUpper.push(StdMax); // ค่าคงที่สำหรับเส้น Max
      buffLower.push(StdMin); // ค่าคงที่สำหรับเส้น Min
      bufData.push(dataReport[i][indexData].ResultReport);
      console.log('bufdata : ' + bufData); // ตรวจสอบค่าที่เพิ่มเข้าไปใน bufData
    }

    if (StdMin === undefined || StdMax === undefined) {
      throw new Error("No data found for the specified ProcessReportName and ItemReportName.");
    }

    let chartMin = StdMin * 0.85;
    let chartMax = StdMax * 1.15;
    // if (StdMin < 5) {
    //   chartMin = 0;
    // }
    // console.log('suggestedMin : ' + chartMin);
    // console.log('suggestedMax : ' + chartMax);
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

async function SetGraph3(dataReport, doc, indexGraph, xPosition) {
  try {
    doc.autoTable({
      startY: 15,
      head: [
        [
          {
            content: "Control chart",
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
              cellWidth: 50,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    console.log("SetGraph");
    var picWidth = 150; // ความกว้างของกราฟ
    var picHeight = 40; // ความสูงของกราฟ
    var currentY = 5; // ตำแหน่ง Y ปัจจุบันสำหรับกราฟ
    var countGraph = 0; // ตัวนับจำนวนกราฟ
    var picGraph = []; // อาร์เรย์เก็บภาพกราฟ
    var dataBody = []; // อาร์เรย์เก็บข้อมูลที่จะใช้ในตาราง
    var pageWidth = doc.internal.pageSize.getWidth(); // ความกว้างของหน้า PDF
    xPosition = (pageWidth - picWidth) / 2; // คำนวณตำแหน่ง x ให้อยู่กลางหน้า

    // เตรียมภาพ
    for (let i = 0; i < indexGraph.length; i++) {
      picGraph.push(await GraphPic3(dataReport, indexGraph[i])); // สร้างภาพกราฟ
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
      startY: 210, // ตำแหน่ง Y เริ่มต้นของตาราง
      head: [
        [
          {
            content: "%N.V. Calibration",
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
              cellWidth: picWidth,
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
        0: { cellWidth: picWidth },
      },
      margin: { left: xPosition }, // กำหนดระยะห่างจากขอบซ้ายให้กราฟอยู่ตรงกลาง
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
              picWidth - 2,
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
}

async function GraphPic3(dataReport, indexData) {
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

    let StdMin, StdMax;

    for (let i = 0; i < dataReport.length; i++) {
      StdMin = dataReport[i][indexData].StdMin;
      StdMax = dataReport[i][indexData].StdMax;
      buffDate.push(dtConv.toDateOnlyMonthName(dataReport[i][indexData].SamplingDate));
      buffUpper.push(StdMax); // ค่าคงที่สำหรับเส้น Max
      buffLower.push(StdMin); // ค่าคงที่สำหรับเส้น Min
      bufData.push(dataReport[i][indexData].ResultReport);
      console.log('bufdata : ' + bufData); // ตรวจสอบค่าที่เพิ่มเข้าไปใน bufData
    }

    if (StdMin === undefined || StdMax === undefined) {
      throw new Error("No data found for the specified ProcessReportName and ItemReportName.");
    }

    let chartMin = StdMin * 0.85;
    let chartMax = StdMax * 1.15;
    // if (StdMin < 5) {
    //   chartMin = 0;
    // }
    // console.log('suggestedMin : ' + chartMin);
    // console.log('suggestedMax : ' + chartMax);
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