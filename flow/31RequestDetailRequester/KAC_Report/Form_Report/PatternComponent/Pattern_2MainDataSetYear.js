const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtget = require("../../../../../function/dateTime");

exports.DataSetYear = async (dataReport, doc, currentY) => {
  console.log("DataSetYear");
  try {
    var dataInHeader = [];
    var columnAllCount = 3 + dataReport[0].length; //3 month,samplingdate,create,
    var months = [
      "January",
      "",
      "February",
      "",
      "March",
      "",
      "April",
      "",
      "May",
      "",
      "June",
      "",
      "July",
      "",
      "August",
      "",
      "September",
      "",
      "October",
      "",
      "November",
      "",
      "December",
      "",
    ];

    //manage header
    //row 1
    dataInHeader.push([
      {
        colSpan: columnAllCount,
        content:
          "Analysis Data " +
          dtget.toYearOnly(dataReport[0][0].CreateReportDate),
        styles: {
          textColor: 0,
          halign: "center",
          valign: "middle",
          font: "THSarabun",
          fontStyle: "bold",
          fontSize: 12,
          cellPadding: 0.2,
        },
      },
    ]);
    //row2
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
        colSpan: 3,
        content: "Process ",
        styles: styleRowHeadBlue,
      },
    ]);

    for (let i = 0; i < dataReport[0].length; i++) {
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
      dataInHeader[1].push({
        colSpan: countColSpan,
        content: dataReport[0][i].ProcessReportName,
        styles: styleRowHeadBlue,
      });
      i = k;
    }

    //row 3 item check
    var colorRow3 = [140, 255, 219];
    var cellHWidth = 13;
    var cellDWidth = (265 - cellHWidth * 3) / dataReport[0].length;
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
        rowSpan: 3,
        content: "Month",
        styles: styleRowHeadBlue,
      },
      {
        colSpan: 2,
        content: "ITEM check",
        styles: styleRow3H,
      },
    ]);

    for (let i = 0; i < dataReport[0].length; i++) {
      dataInHeader[2].push({
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
        colSpan: 2,
        content: "Range Control",
        styles: styleRow4H,
      },
    ]);

    dataInHeader.push([
      {
        content: "Samplinig Date",
        styles: styleRow4Date,
      },
      {
        content: "Making Report Date",
        styles: styleRow4Date,
      },
    ]);

    for (let i = 0; i < dataReport[0].length; i++) {
      dataInHeader[3].push({
        rowSpan: 2,
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
    var styleDIntableNoData = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      fillColor: [128, 128, 128],
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

    // j = index month 1 set do 2 value
    // i = index item in month
    for (let j = 0; j < 24; j = j + 2) {
      //add row month
      //set 1 (row J)
      let checkHaveData1 = true;
      let checkHaveData2 = true;
      if (
        dataReport[j][0].ResultReport == "-" &&
        dataReport[j][1].ResultReport == "-" &&
        dataReport[j][2].ResultReport == "-" &&
        dataReport[j][3].ResultReport == "-"
      ) {
        checkHaveData1 = false;
      }
      if (
        dataReport[j + 1][0].ResultReport == "-" &&
        dataReport[j + 1][1].ResultReport == "-" &&
        dataReport[j + 1][2].ResultReport == "-" &&
        dataReport[j + 1][3].ResultReport == "-"
      ) {
        checkHaveData2 = false;
      }

      dataInTable.push([
        { rowSpan: 2, content: months[j], styles: styleRowHeadDBlue },
      ]);

      dataInTable[j].push(
        {
          content: checkHaveData1
            ? dtget.toDateOnly(dataReport[j][0].SamplingDate)
            : "",
          styles: checkHaveData1 ? styleDIntable : styleDIntableNoData,
        },
        {
          content: checkHaveData1
            ? dtget.toDateOnly(dataReport[j][0].CreateReportDate)
            : "",
          styles: checkHaveData1 ? styleDIntable : styleDIntableNoData,
        }
      );
      // set 2 (row J + 1)
      dataInTable.push([
        {
          content: checkHaveData2
            ? dtget.toDateOnly(dataReport[j + 1][0].SamplingDate)
            : "",
          styles: checkHaveData2 ? styleDIntable : styleDIntableNoData,
        },
        {
          content: checkHaveData2
            ? dtget.toDateOnly(dataReport[j + 1][0].CreateReportDate)
            : "",
          styles: checkHaveData2 ? styleDIntable : styleDIntableNoData,
        },
      ]);

      //add data in row month
      for (let i = 0; i < dataReport[j].length; i++) {
        //set 1
        let styleData;
        if (checkHaveData1 == false) {
          styleData = styleDIntableNoData;
        } else if (
          dataReport[j][i].Evaluation != "PASS" &&
          dataReport[j][i].Evaluation != "-" &&
          dataReport[j][i].Evaluation != ""
        ) {
          styleData = styleDIntableError;
        } else {
          styleData = styleDIntable;
        }

        dataInTable[j].push({
          content: checkHaveData1 ? dataReport[j][i].ResultReport : "",
          styles: styleData,
        });
        //set 2
        let styleData2;
        if (checkHaveData2 == false) {
          styleData2 = styleDIntableNoData;
        } else if (
          dataReport[j+1][i].Evaluation != "PASS" &&
          dataReport[j+1][i].Evaluation != "-" &&
          dataReport[j+1][i].Evaluation != ""
        ) {
          styleData2 = styleDIntableError;
        } else {
          styleData2 = styleDIntable;
        }
        dataInTable[j + 1].push({
          content: checkHaveData2 ? dataReport[j + 1][i].ResultReport : "",
          styles: styleData2,
        });
      }
    }

    /* // j = index month 1 set do 2 value
    // i = index item in month
    for (let j = 0; j < 24; j = j + 2) {
      //add row month
      //set 1 (row J)
      dataInTable.push([
        { rowSpan: 2, content: months[j], styles: styleRowHeadDBlue },
        {
          content: dtget.toDateOnly(dataReport[j][0].SamplingDate),
          styles: styleDIntable,
        },
        {
          content: dtget.toDateOnly(dataReport[j][0].CreateReportDate),
          styles: styleDIntable,
        },
      ]);
      // set 2 (row J + 1)
      dataInTable.push([
        {
          content: dtget.toDateOnly(dataReport[j + 1][0].SamplingDate),
          styles: styleDIntable,
        },
        {
          content: dtget.toDateOnly(dataReport[j + 1][0].CreateReportDate),
          styles: styleDIntable,
        },
      ]);

      //add data in row month
      for (let i = 0; i < dataReport[j].length; i++) {
        //set 1
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
        //set 2
        let checkErrorOk2 = true;
        if (
          dataReport[j + 1][i].Evaluation != "PASS" &&
          dataReport[j + 1][i].Evaluation != "-" &&
          dataReport[j + 1][i].Evaluation != ""
        ) {
          checkErrorOk2 = false;
        }
        dataInTable[j + 1].push({
          content: dataReport[j + 1][i].ResultReport,
          styles: checkErrorOk2 ? styleDIntable : styleDIntableError,
        });
      }
    } */

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
        //0: { cellWidth: cellHWidth }, //blank for auto
        1: { cellWidth: cellHWidth },
        2: { cellWidth: cellHWidth },
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
};

exports.DataSetYearA3 = async (dataReport, doc, currentY) => {
  console.log("DataSetYear3A");
  try {
    var dataInHeader = [];
    var columnAllCount = 3 + dataReport[0].length; //3 month,samplingdate,create,
    var months = [
      "January",
      "",
      "February",
      "",
      "March",
      "",
      "April",
      "",
      "May",
      "",
      "June",
      "",
      "July",
      "",
      "August",
      "",
      "September",
      "",
      "October",
      "",
      "November",
      "",
      "December",
      "",
    ];

    //manage header
    //row 1
    dataInHeader.push([
      {
        colSpan: columnAllCount,
        content:
          "Analysis Data " +
          dtget.toYearOnly(dataReport[0][0].CreateReportDate),
        styles: {
          textColor: 0,
          halign: "center",
          valign: "middle",
          font: "THSarabun",
          fontStyle: "bold",
          fontSize: 14,
          cellPadding: 0.2,
        },
      },
    ]);
    var fontSizeH = 11;
    var fontSizeD = 9;
    //row2
    var styleRowHeadBlue = {
      textColor: 0,
      halign: "center",
      fillColor: [3, 244, 252],
      valign: "middle",
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: fontSizeH,
      cellPadding: 0.2,
    };

    dataInHeader.push([
      {
        colSpan: 3,
        content: "Process ",
        styles: styleRowHeadBlue,
      },
    ]);

    for (let i = 0; i < dataReport[0].length; i++) {
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
      dataInHeader[1].push({
        colSpan: countColSpan,
        content: dataReport[0][i].ProcessReportName,
        styles: styleRowHeadBlue,
      });
      i = k;
    }

    //row 3 item check
    var colorRow3 = [140, 255, 219];
    var cellHWidth = 13;
    var cellDWidth = (390 - cellHWidth * 3) / dataReport[0].length;
    var styleRow3H = {
      textColor: 0,
      halign: "center",
      fillColor: colorRow3,
      valign: "middle",
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: fontSizeH,
    };
    var styleRow3D = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      fillColor: colorRow3,
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: fontSizeD,
      cellWidth: cellDWidth,
    };

    dataInHeader.push([
      {
        rowSpan: 3,
        content: "Month",
        styles: styleRowHeadBlue,
      },
      {
        colSpan: 2,
        content: "ITEM check",
        styles: styleRow3H,
      },
    ]);

    for (let i = 0; i < dataReport[0].length; i++) {
      dataInHeader[2].push({
        content: dataReport[0][i].ItemReportName,
        styles: styleRow3D,
      });
    }

    //row 4 range control
    var colorRow4 = [255, 254, 83];
    var styleRow4H = {
      textColor: 0,
      halign: "center",
      fillColor: colorRow4,
      valign: "middle",
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: fontSizeH,
    };
    var styleRow4D = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      fillColor: colorRow4,
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: fontSizeD,
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
        colSpan: 2,
        content: "Range Control",
        styles: styleRow4H,
      },
    ]);
    dataInHeader.push([
      {
        content: "Samplinig Date",
        styles: styleRow4Date,
      },
      {
        content: "Making Report Date",
        styles: styleRow4Date,
      },
    ]);

    for (let i = 0; i < dataReport[0].length; i++) {
      dataInHeader[3].push({
        rowSpan: 2,
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
      fontSize: fontSizeD,
    };
    var colorError = [254, 184, 171];
    var styleDIntableError = {
      textColor: 0,
      halign: "center",
      valign: "middle",
      fillColor: colorError,
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: fontSizeD,
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

    // j = index month 1 set do 2 value
    // i = index item in month
    for (let j = 0; j < 24; j = j + 2) {
      //add row month
      //set 1 (row J)
      dataInTable.push([
        { rowSpan: 2, content: months[j], styles: styleRowHeadDBlue },
        {
          content: dtget.toDateOnly(dataReport[j][0].SamplingDate),
          styles: styleDIntable,
        },
        {
          content: dtget.toDateOnly(dataReport[j][0].CreateReportDate),
          styles: styleDIntable,
        },
      ]);
      // set 2 (row J + 1)
      dataInTable.push([
        {
          content: dtget.toDateOnly(dataReport[j + 1][0].SamplingDate),
          styles: styleDIntable,
        },
        {
          content: dtget.toDateOnly(dataReport[j + 1][0].CreateReportDate),
          styles: styleDIntable,
        },
      ]);

      //add data in row month
      for (let i = 0; i < dataReport[j].length; i++) {
        //set 1
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
        //set 2
        let checkErrorOk2 = true;
        if (
          dataReport[j + 1][i].Evaluation != "PASS" &&
          dataReport[j + 1][i].Evaluation != "-" &&
          dataReport[j + 1][i].Evaluation != ""
        ) {
          checkErrorOk2 = false;
        }
        dataInTable[j + 1].push({
          content: dataReport[j + 1][i].ResultReport,
          styles: checkErrorOk2 ? styleDIntable : styleDIntableError,
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
        fontSize: 15,
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
        fontSize: fontSizeD,
        cellPadding: 0.2,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 9,
      },
      columnStyles: {
        //0: { cellWidth: cellHWidth }, //blank for auto
        1: { cellWidth: cellHWidth },
        2: { cellWidth: cellHWidth },
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
};
