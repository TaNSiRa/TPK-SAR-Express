const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.HeaderSetT1 = async (dataReport, doc) => {
  try {
    var currentY = 10;

    doc.setPage(1);
    var pageWidth = doc.internal.pageSize.width;
    doc.setFont("THSarabun", "normal");
    doc.setFontSize(12);
    doc.text("Report No : " + dataReport[0].ReqNo, pageWidth - 50, 10);

    console.log("HEADER SOI8");
    //Add Logo
    var picHigh = 18;
    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(bitmap.toString("base64"), "JPG", 87, currentY, 36, picHigh);
    currentY = currentY + picHigh;
    //Add Customer Name
    var custHigh = 15;
    doc.autoTable({
      startY: currentY + 2,
      head: [
        [
          {
            content: "Thai Parker Technical Center",
            //colSpan: 5,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 25,
              cellPadding: 0,
              lineColor: [255, 255, 255],
              lineWidth: 0.1,
              minCellHeight: custHigh,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    //text
    currentY = doc.lastAutoTable.finalY;

    var start = dataReport[0].CustFull.indexOf("("); // get the index of the opening parenthesis and add 1 to skip it
    var end = dataReport[0].CustFull.indexOf(")"); // get the index of the closing parenthesis
    var buffCF = dataReport[0].CustFull.substring(0, start);
    var buffPD = dataReport[0].CustFull.substring(start + 1, end);

    var fontSize = 15;
    doc.setFont("THSarabun", "bold");

    doc.text("Plant Name", 63, currentY + 4);
    doc.text("Product Name", 63, currentY + 4 + fontSize / 2.5);
    doc.text("Lot No", 63, currentY + 4 + (fontSize / 2.5) * 2);
    doc.text("Sampling Date", 63, currentY + 4 + (fontSize / 2.5) * 3);

    doc.setFont("THSarabun", "normal");
    doc.text(buffCF, 110, currentY + 4);
    doc.text(buffPD, 110, currentY + 4 + fontSize / 2.5);
    doc.text(
      dataReport[0].ResultReport,
      110,
      currentY + 4 + (fontSize / 2.5) * 2
    );
    doc.text(
      dtConv.toDateOnly(dataReport[0].SamplingDate),
      110,
      currentY + 4 + (fontSize / 2.5) * 3
    );

    currentY = currentY + 4 + (fontSize / 2.5) * 3;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.DataSetT1 = async (dataReport, doc, currentY) => {
  try {
    console.log("DataSetT1");

    var dataInTable = [];

    for (let i = 1; i < dataReport.length; i++) {
      dataInTable.push([
        dataReport[i].ItemReportName,
        dataReport[i].ControlRange,
        dataReport[i].ResultReport,
      ]);
    }

    doc.autoTable({
      startY: currentY + 10,
      head: [["Test Item", "Specification", "RESULT"]],
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
        minCellHeight: 10,
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
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      margin: {},
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
      },
      margin: { left: (210 - 150) / 2 },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.HeaderSetT2 = async (dataReport, doc) => {
  try {
    var currentY = 10;

    doc.setPage(1);
    var pageWidth = doc.internal.pageSize.width;
    doc.setFont("THSarabun", "normal");
    doc.setFontSize(12);
    doc.text("Report No : " + dataReport[0].ReqNo, pageWidth - 50, 10);

    //Add Logo
    var picHigh = 18;
    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(bitmap.toString("base64"), "JPG", 87, currentY, 36, picHigh);
    currentY = currentY + picHigh;
    //Add Customer Name
    var custHigh = 15;
    doc.autoTable({
      startY: currentY + 2,
      head: [
        [
          {
            content: "Thai Parker Technical Center",
            //colSpan: 5,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 25,
              cellPadding: 0,
              lineColor: [255, 255, 255],
              lineWidth: 0.1,
              minCellHeight: custHigh,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    //text
    currentY = doc.lastAutoTable.finalY;

    var start = dataReport[0].CustFull.indexOf("("); // get the index of the opening parenthesis and add 1 to skip it
    var end = dataReport[0].CustFull.indexOf(")"); // get the index of the closing parenthesis
    var buffCF = dataReport[0].CustFull.substring(0, start);
    var buffPD = dataReport[0].CustFull.substring(start + 1, end);

    var fontSize = 15;
    doc.setFont("THSarabun", "bold");

    doc.text("Plant Name", 63, currentY + 4);
    doc.text("Product Name", 63, currentY + 4 + fontSize / 2.5);
    doc.text("Sampling Date", 63, currentY + 4 + (fontSize / 2.5) * 2);

    doc.setFont("THSarabun", "normal");
    doc.text(buffCF, 110, currentY + 4);
    doc.text(buffPD, 110, currentY + 4 + fontSize / 2.5);
    doc.text(
      dtConv.toDateOnly(dataReport[0].SamplingDate),
      110,
      currentY + 4 + (fontSize / 2.5) * 2
    );

    currentY = currentY + 4 + (fontSize / 2.5) * 2;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.DataSetT2 = async (dataReport, doc, currentY) => {
  try {
    console.log("DataSetT2");
    //Set 1
    var dataInTable = [];
    var endIndex1 = 0;
    for (let i = 1; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 10) {
        endIndex1 = i;
        break;
      } else {
        dataInTable.push([
          dataReport[i].ItemReportName,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
        ]);
      }
    }

    var style = {
      textColor: 0,
      halign: "left",
      valign: "middle",
      fillColor: [255, 255, 255],
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 12,
      cellPadding: 0.1,
      lineColor: [255, 255, 255],
      lineWidth: 0.1,
      maxCellHeight: 12,
    };

    doc.autoTable({
      startY: currentY + 4,
      head: [["Result (Tank 1)"]],
      headStyles: style,
      bodyStyles: style,
      body: [[`Lot No : ${dataReport[0].ResultReport}`]],

      margin: { left: (210 - 150) / 2 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    doc.autoTable({
      startY: currentY + 2,
      head: [["Test Item", "Specification", "RESULT"]],
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
        minCellHeight: 10,
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
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      margin: {},
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
      },
      margin: { left: (210 - 150) / 2 },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    //Set 2
    dataInTable = [];
    for (let i = endIndex1 + 1; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 30) {
        break;
      } else {
        dataInTable.push([
          dataReport[i].ItemReportName,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
        ]);
      }
    }

    var style = {
      textColor: 0,
      halign: "left",
      valign: "middle",
      fillColor: [255, 255, 255],
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 12,
      cellPadding: 0.1,
      lineColor: [255, 255, 255],
      lineWidth: 0.1,
      maxCellHeight: 12,
    };

    doc.autoTable({
      startY: currentY + 4,
      head: [["Result (Tank 2)"]],
      headStyles: style,
      bodyStyles: style,
      body: [[`Lot No : ${dataReport[endIndex1].ResultReport}`]],

      margin: { left: (210 - 150) / 2 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    doc.autoTable({
      startY: currentY + 2,
      head: [["Test Item", "Specification", "RESULT"]],
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
        minCellHeight: 10,
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
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      margin: {},
      columnStyles: {
        //0: {cellWidth : 20},
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
      },
      margin: { left: (210 - 150) / 2 },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.DataSetT3 = async (dataReport, doc, currentY) => {

    try {
      console.log("DataSetT3");
  
      var dataInTable = [];
  
      for (let i = 1; i < dataReport.length; i++) {
        dataInTable.push([
          dataReport[i].ItemReportName,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
        ]);
      }
  
      doc.autoTable({
        startY: currentY + 10,
        head: [["Test Item", "Specification", "RESULT"]],
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
          minCellHeight: 10,
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
          fontSize: 12,
          cellPadding: 1,
          lineColor: 0,
          lineWidth: 0.1,
          maxCellHeight: 11,
          //cellWidth: 17,
        },
        margin: {},
        columnStyles: {
          //0: {cellWidth : 20},
          0: { cellWidth: 50 },
          1: { cellWidth: 50 },
          2: { cellWidth: 50 },
        },
        margin: { left: (210 - 150) / 2 },
  
        theme: "grid",
      });
      currentY = doc.lastAutoTable.finalY;
      return [doc, currentY];
    } catch (err) {
      console.log(err);
      return err;
    }
  };