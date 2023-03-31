const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.PicSet = async (dataReport, doc, currentY) => {
  try {
    console.log("VCCT");
    var foundData = 0;
    var i = 0;
    for (i; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        foundData++;
      }
    }
    if (foundData > 0) {
      doc.addPage();
      currentY = 10;

      doc.autoTable({
        startY: currentY + 4,
        head: [
          [
            {
              content: "Chemical Condition",
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
    }
    currentY = doc.lastAutoTable.finalY;

    var countSetPic = 0;
    var picHeight = 20;
    var picWidht = 50;
    //find i
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        break;
      }
    }
    var dataInTable = [];

    dataInTable.push([
      {
        content: "Material",
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
      {
        colSpan: 3,
        content: "Coating Weight 3 Layer (g/m2)",
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
        },
      },
    ]);

    dataInTable.push([
      {
        rowSpan: 2,
        content: "",
        style: {
          fontSize: 20,
        },
      },
      {
        content: "Sterate Film",
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
          cellWidth: 45,
        },
      },
      {
        content: "Metal Soap Film",
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
          cellWidth: 45,
        },
      },
      {
        content: "Phosphate Flim",
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
          cellWidth: 45,
        },
      },
    ]);

    dataInTable.push([
      {
        content: dataReport[i].ResultReport,
        styles: {
          textColor: 0,
          halign: "center",
          valign: "middle",
          font: "THSarabun",
          fontStyle: "normal",
          fontSize: 12,
          cellPadding: 1,
          lineColor: 0,
          lineWidth: 0.1,
          minCellHeight: 12,
        },
      },
      {
        content: dataReport[i + 1].ResultReport,
        styles: {
          textColor: 0,
          halign: "center",
          valign: "middle",
          font: "THSarabun",
          fontStyle: "normal",
          fontSize: 12,
          cellPadding: 1,
          lineColor: 0,
          lineWidth: 0.1,
          minCellHeight: 12,
        },
      },
      {
        content: dataReport[i + 2].ResultReport,
        styles: {
          textColor: 0,
          halign: "center",
          valign: "middle",
          font: "THSarabun",
          fontStyle: "normal",
          fontSize: 12,
          cellPadding: 1,
          lineColor: 0,
          lineWidth: 0.1,
          minCellHeight: 12,
        },
      },
    ]);

    doc.autoTable({
      startY: currentY + 4,
      body: dataInTable,
      bodyStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        font: "THSarabun",
        fontStyle: "normal",
        lineColor: 0,
        lineWidth: 0.1,
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (
          data.row.index == 1 &&
          data.column.index == 0 &&
          data.section === "body"
        ) {
          //check time sign
          /* console.log(data.row.index);
              console.log(countSpan);
              console.log(dataReport[i].ResultReport); */
          try {
            let bitmap = fs.readFileSync("C:\\SAR\\asset\\VCCT.jpg");
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 2,
              data.cell.y + 2,
              picWidht - 4,
              picHeight - 4
            );
          } catch (err) {
            console.log("error pic" + err);
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
