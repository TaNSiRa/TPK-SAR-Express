const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.CommentSet = async (dataReport, doc, currentY) => {
  try {
    console.log("CommentSet");

    var dataInTable = [];
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
    if (dataReport[0].Comment6 != "" && dataReport[0].Comment6 != null) {
      dataInTable.push([dataReport[0].Comment6]);
    }
    if (dataReport[0].Comment7 != "" && dataReport[0].Comment7 != null) {
      dataInTable.push([dataReport[0].Comment7]);
    }
    if (dataReport[0].Comment8 != "" && dataReport[0].Comment8 != null) {
      dataInTable.push([dataReport[0].Comment8]);
    }
    if (dataReport[0].Comment9 != "" && dataReport[0].Comment9 != null) {
      dataInTable.push([dataReport[0].Comment9]);
    }
    if (dataReport[0].Comment10 != "" && dataReport[0].Comment10 != null) {
      dataInTable.push([dataReport[0].Comment10]);
    }
    //console.log(dataInTable);
    if (dataInTable.length > 0) {
      let dataHeight = 40 + (dataInTable.length * 15);
      /* console.log(currentY);
      console.log(dataHeight);
      console.log(297 - dataHeight); */
      if (currentY >= 297 - dataHeight) {
        doc.addPage();
        currentY = 10;
      }
      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: "Comment",
              styles: {
                textColor: 0,
                halign: "left",
                valign: "middle",
                fillColor: [3, 244, 252],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: 12,
                cellPadding: 1,
                lineColor: 0,
                lineWidth: 0.1,
                maxCellHeight: 12,
                cellWidth: 18,
              },
            },
          ],
        ],
        //body: body,
        theme: "grid",
      });
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
          fontSize: 13,
          cellPadding: 1,
          maxCellHeight: 12,
          //cellWidth: 17,
        },

        theme: "plain",
      });
    }

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.CommentSetTHACOM = async (dataReport, doc, currentY) => {
  try {
    console.log("CommentSet");

    var dataInTable = [];
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
    if (dataReport[0].Comment6 != "" && dataReport[0].Comment6 != null) {
      dataInTable.push([dataReport[0].Comment6]);
    }
    if (dataReport[0].Comment7 != "" && dataReport[0].Comment7 != null) {
      dataInTable.push([dataReport[0].Comment7]);
    }
    if (dataReport[0].Comment8 != "" && dataReport[0].Comment8 != null) {
      dataInTable.push([dataReport[0].Comment8]);
    }
    if (dataReport[0].Comment9 != "" && dataReport[0].Comment9 != null) {
      dataInTable.push([dataReport[0].Comment9]);
    }
    if (dataReport[0].Comment10 != "" && dataReport[0].Comment10 != null) {
      dataInTable.push([dataReport[0].Comment10]);
    }
    //console.log(dataInTable);
    if (dataInTable.length > 0) {
      let dataHeight = 40 + (dataInTable.length * 15);
      /* console.log(currentY);
      console.log(dataHeight);
      console.log(297 - dataHeight); */
      if (currentY >= 297 - dataHeight) {
        // doc.addPage();
        // currentY = 10;
      }
      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: "Comment",
              styles: {
                textColor: 0,
                halign: "left",
                valign: "middle",
                fillColor: [3, 244, 252],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: 12,
                cellPadding: 1,
                lineColor: 0,
                lineWidth: 0.1,
                maxCellHeight: 12,
                cellWidth: 18,
              },
            },
          ],
        ],
        //body: body,
        theme: "grid",
      });
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
          fontSize: 13,
          cellPadding: 1,
          maxCellHeight: 12,
          //cellWidth: 17,
        },

        theme: "plain",
      });
    }

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.CommentSetforATT = async (dataReport, doc, currentY) => {
  try {
    console.log("CommentSet");

    var dataInTable = [];
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
    if (dataReport[0].Comment6 != "" && dataReport[0].Comment6 != null) {
      dataInTable.push([dataReport[0].Comment6]);
    }
    if (dataReport[0].Comment7 != "" && dataReport[0].Comment7 != null) {
      dataInTable.push([dataReport[0].Comment7]);
    }
    if (dataReport[0].Comment8 != "" && dataReport[0].Comment8 != null) {
      dataInTable.push([dataReport[0].Comment8]);
    }
    if (dataReport[0].Comment9 != "" && dataReport[0].Comment9 != null) {
      dataInTable.push([dataReport[0].Comment9]);
    }
    if (dataReport[0].Comment10 != "" && dataReport[0].Comment10 != null) {
      dataInTable.push([dataReport[0].Comment10]);
    }
    //console.log(dataInTable);
    if (dataInTable.length > 0) {
      let dataHeight = 40 + (dataInTable.length * 15);
      /* console.log(currentY);
      console.log(dataHeight);
      console.log(297 - dataHeight); */
      // if (currentY >= 297 - dataHeight) {
      //   doc.addPage();
      //   currentY = 10;
      // }
      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: "Comment",
              styles: {
                textColor: 0,
                halign: "left",
                valign: "middle",
                fillColor: [3, 244, 252],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: 12,
                cellPadding: 1,
                lineColor: 0,
                lineWidth: 0.1,
                maxCellHeight: 12,
                cellWidth: 18,
              },
            },
          ],
        ],
        //body: body,
        theme: "grid",
      });
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
          fontSize: 13,
          cellPadding: 1,
          maxCellHeight: 12,
          //cellWidth: 17,
        },

        theme: "plain",
      });
    }

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};