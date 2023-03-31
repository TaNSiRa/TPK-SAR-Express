const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.CTWSet = async (dataReport, doc, indexStart, currentY) => {
  try {
    console.log("AITH_CTWSet");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Results of coating weight (Conversion only)",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              cellPadding: 0,
              fontSize: 12,
              maxCellHeight: 10,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    currentY = doc.lastAutoTable.finalY;

    var dataInHead = [];
    dataInHead.push(
      [
        {
          rowSpan: 2,
          content: "Condition",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
            cellPadding: 0.3,
          },
        },
        {
          rowSpan: 2,
          content: "Model",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          rowSpan: 2,
          content: "Control Range",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          colSpan: 2,
          content: "Coating on evaporator (mg/m²)",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
      ],
      [
        {
          content: "Front",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
            cellPadding: 0.3,
          },
        },
        {
          content: "Back",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
      ]
    );

    var dataInTable = [];

    dataInTable.push([
      {
        content: dataReport[indexStart].ItemReportName,
      },
      {
        rowSpan: 3,
        content: dataReport[indexStart].ProcessReportName,
      },
      {
        content: dataReport[indexStart].ControlRange,
      },
      {
        content: dataReport[indexStart].ResultReport,
      },
      {
        content: dataReport[indexStart + 1].ResultReport,
      },
    ]);
    dataInTable.push([
      {
        content: dataReport[indexStart + 2].ItemReportName,
      },
      {
        content: dataReport[indexStart + 2].ControlRange,
      },
      {
        content: dataReport[indexStart + 2].ResultReport,
      },
      {
        content: dataReport[indexStart + 3].ResultReport,
      },
    ]);
    dataInTable.push([
      {
        content: dataReport[indexStart + 4].ItemReportName,
      },
      {
        content: dataReport[indexStart + 4].ControlRange,
      },
      {
        content: dataReport[indexStart + 4].ResultReport,
      },
      {
        content: dataReport[indexStart + 5].ResultReport,
      },
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: dataInHead,
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
        maxCellHeight: 10,
        cellPadding: 0.3,
      },
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        font: "THSarabun",
        fontStyle: "normal",
        lineColor: 0,
        lineWidth: 0.1,
        cellPadding: 0.3,
      },
      allSectionHooks: true,
      willDrawCell: function (data) {
        if (
          (data.column.index === 3 || data.column.index === 4) &&
          data.section === "body"
        ) {
          var indexData =
            indexStart + (data.column.index - 3) + data.row.index * 2;
          if (
            dataReport[indexData].Evaluation == "LOW" ||
            dataReport[indexData].Evaluation == "HIGH" ||
            dataReport[indexData].Evaluation == "NOT PASS" ||
            dataReport[indexData].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
      },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.TOCSet = async (dataReport, doc, indexStart, currentY) => {
  try {
    console.log("AITH_TOCSet");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Results of TOC (Full process)",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              cellPadding: 0,
              fontSize: 12,
              maxCellHeight: 10,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    currentY = doc.lastAutoTable.finalY;

    var dataInHead = [];
    dataInHead.push(
      [
        {
          rowSpan: 2,
          content: "Condition",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          rowSpan: 2,
          content: "Model",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          rowSpan: 2,
          content: "Control Range",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          colSpan: 2,
          content: "Position (mg/m²)",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
      ],
      [
        {
          content: "7",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          content: "10",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
      ]
    );

    var dataInTable = [];

    dataInTable.push([
      {
        content: dataReport[indexStart].ItemReportName,
      },
      {
        content: dataReport[indexStart].ProcessReportName,
      },
      {
        content: dataReport[indexStart].ControlRange,
      },
      {
        content: dataReport[indexStart].ResultReport,
      },
      {
        content: dataReport[indexStart + 1].ResultReport,
      },
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: dataInHead,
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
        maxCellHeight: 10,
        cellPadding: 0.3,
      },
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        font: "THSarabun",
        fontStyle: "normal",
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
        cellPadding: 0.3,
      },
      allSectionHooks: true,
      willDrawCell: function (data) {
        if (
          (data.column.index === 3 || data.column.index === 4) &&
          data.section === "body"
        ) {
          var indexData = indexStart + (data.column.index - 3);
          if (
            dataReport[indexData].Evaluation == "LOW" ||
            dataReport[indexData].Evaluation == "HIGH" ||
            dataReport[indexData].Evaluation == "NOT PASS" ||
            dataReport[indexData].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
      },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.ContactAng = async (dataReport, doc, indexStart, currentY) => {
  try {
    console.log("AITH_ContactAng");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Results of contact angle. (Initial)",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              cellPadding: 0,
              fontSize: 12,
              maxCellHeight: 10,
              cellPadding: 0,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    currentY = doc.lastAutoTable.finalY;

    var dataInHead = [];
    dataInHead.push(
      [
        {
          rowSpan: 2,
          content: "Item Check",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          rowSpan: 2,
          content: "Model",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          colSpan: 12,
          content: "Position of Contact angle",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
        {
          rowSpan: 2,
          content: "Evaluation",
          styles: {
            textColor: 0,
            halign: "center",
            valign: "middle",
            font: "THSarabun",
            fontStyle: "bold",
            fontSize: 12,
            cellPadding: 1,
            lineColor: 0,
            lineWidth: 0.1,
            maxCellHeight: 10,
          },
        },
      ],
      [
        {
          content: "1",
          styles: {
            textColor: 0,
            font: "THSarabun",
            fontStyle: "normal",
            fontSize: 11,
          },
        },
      ]
    );
    for (let i = 2; i < 13; i++) {
      {
        dataInHead[1].push({
          content: i,
          styles: {
            textColor: 0,
            font: "THSarabun",
            fontStyle: "normal",
            fontSize: 11,
          },
        });
      }
    }
    console.log(indexStart);
    console.log(dataReport[indexStart].ResultReport);
    var dataInTable = [];
    var dataContactA = dataReport[indexStart].ResultReport.split(" ");
    if (dataContactA.length < 12) {
      dataContactA = [
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
      ];
    }

    dataInTable.push([
      dataReport[indexStart].ItemReportName,
      dataReport[indexStart].ProcessReportName,
      dataContactA[0],
      dataContactA[1],
      dataContactA[2],
      dataContactA[3],
      dataContactA[4],
      dataContactA[5],
      dataContactA[6],
      dataContactA[7],
      dataContactA[8],
      dataContactA[9],
      dataContactA[10],
      dataContactA[11],
      dataReport[indexStart].Evaluation,
    ]);

    var contactWidth = 8;

    doc.autoTable({
      startY: currentY + 4,
      head: dataInHead,
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
        maxCellHeight: 10,
        cellPadding: 0.3,
      },
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 10,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 10,
        cellPadding: 0.3,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        2: { cellWidth: contactWidth },
        3: { cellWidth: contactWidth },
        4: { cellWidth: contactWidth },
        5: { cellWidth: contactWidth },
        6: { cellWidth: contactWidth },
        7: { cellWidth: contactWidth },
        8: { cellWidth: contactWidth },
        9: { cellWidth: contactWidth },
        10: { cellWidth: contactWidth },
        11: { cellWidth: contactWidth },
        12: { cellWidth: contactWidth },
        13: { cellWidth: contactWidth },
        14: { cellWidth: 30 },
      },
      allSectionHooks: true,
      willDrawCell: function (data) {
        if (data.column.index === 14 && data.section === "body") {
          if (
            dataReport[indexStart].Evaluation == "LOW" ||
            dataReport[indexStart].Evaluation == "HIGH" ||
            dataReport[indexStart].Evaluation == "NOT PASS" ||
            dataReport[indexStart].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
      },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
