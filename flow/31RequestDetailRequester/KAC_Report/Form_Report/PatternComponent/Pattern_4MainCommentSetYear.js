const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.CommentSetYear = async (dataReport, doc, currentY) => {
  try {
    console.log("CommentSet");

    var dataInTable = [];
    dataInTable.push([
      "We would like to report about analysis result of Pretreatment process that shown as below",
    ]);

    if (dataReport[0].Comment1 != "" && dataReport[0].Comment1 != null) {
      dataInTable.push([dataReport[0].Comment1]);
    }
    if (dataReport[0].Comment2 != "" && dataReport[0].Comment2 != null) {
      dataInTable.push([dataReport[0].Comment2]);
    }
    if (dataReport[0].Comment3 != "" && dataReport[0].Comment3 != null) {
      dataInTable.push([dataReport[0].Comment3]);
    }
    if (dataReport[0].Comment4 != "" && dataReport[0].Comment4 != null) {
      dataInTable.push([dataReport[0].Comment4]);
    }
    if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
      dataInTable.push([dataReport[0].Comment5]);
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 8,
        cellPadding: 0.2,
        maxCellHeight: 12,
        cellWidth: 297 / 2,
      },

      theme: "plain",
    });

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};


exports.CommentSetYearA3 = async (dataReport, doc, currentY) => {
  try {
    console.log("CommentSet");

    var dataInTable = [];
    dataInTable.push([
      "We would like to report about analysis result of Pretreatment process that shown as below",
    ]);

    if (dataReport[0].Comment1 != "" && dataReport[0].Comment1 != null) {
      dataInTable.push([dataReport[0].Comment1]);
    }
    if (dataReport[0].Comment2 != "" && dataReport[0].Comment2 != null) {
      dataInTable.push([dataReport[0].Comment2]);
    }
    if (dataReport[0].Comment3 != "" && dataReport[0].Comment3 != null) {
      dataInTable.push([dataReport[0].Comment3]);
    }
    if (dataReport[0].Comment4 != "" && dataReport[0].Comment4 != null) {
      dataInTable.push([dataReport[0].Comment4]);
    }
    if (dataReport[0].Comment5 != "" && dataReport[0].Comment5 != null) {
      dataInTable.push([dataReport[0].Comment5]);
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 12,
        cellPadding: 0.2,
        maxCellHeight: 12,
        cellWidth: 297 / 2,
      },

      theme: "plain",
    });

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};