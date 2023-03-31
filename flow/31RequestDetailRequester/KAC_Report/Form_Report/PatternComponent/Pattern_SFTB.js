const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.DataSetSFTB = async (dataReport, doc, currentY) => {
  try {
    console.log("DataSetSFTB");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "การเคลือบผิว",
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
              cellWidth: 24,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    var dataInTable = [];

    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].Evaluation == "LOW") {
        dataReport[i].Evaluation = "ต่ำ";
      } else if (dataReport[i].Evaluation == "HIGH") {
        dataReport[i].Evaluation = "สูง";
      } else if (dataReport[i].Evaluation == "PASS") {
        dataReport[i].Evaluation = "ผ่าน";
      } else if (
        dataReport[i].Evaluation == "NOT PASS" ||
        dataReport[i].Evaluation == "NG"
      ) {
        dataReport[i].Evaluation = "ไม่ผ่าน";
      }
    }

    var indexStart = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        indexStart = i;
        break;
      }
    }

    dataInTable.push([
      {
        rowSpan: 2,
        content: "น้ำหนักการเคลือบ (กรัม/ตร.ม.)",
      },
      dataReport[indexStart].ItemReportName,
      dataReport[indexStart + 1].ItemReportName,
      dataReport[indexStart + 2].ItemReportName,
    ]);

    dataInTable.push([
      dataReport[indexStart].ResultReport,
      dataReport[indexStart + 1].ResultReport,
      dataReport[indexStart + 2].ResultReport,
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        [
          {
            content: "ชิ้นงาน",
          },
          {
            colSpan: 3,
            content: "ก่อนการอัดรีด",
          },
        ],
      ],
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
        fontSize: 13,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        //0: { cellWidth: 15, fillColor: [211, 239, 240] },
        //1: { cellWidth: 35 },
        //2: { cellWidth: 30 },
        //3: { cellWidth: 30 },
        //4: { cellWidth: 30 },
      },
      willDrawCell: function (data) {
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[indexStart + data.row.index].Evaluation == "ต่ำ" ||
            dataReport[indexStart + data.row.index].Evaluation == "สูง" ||
            dataReport[indexStart + data.row.index].Evaluation == "ไม่ผ่าน"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
        if (data.column.index === 4 && data.section === "body") {
          if (
            data.cell.raw == "ต่ำ" ||
            data.cell.raw == "สูง" ||
            data.cell.raw == "ไม่ผ่าน"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
      },

      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    //end set 1
    indexStart = indexStart + 3;

    if (indexStart < dataReport.length) {
      dataInTable = [];
      dataInTable.push([
        {
          rowSpan: 2,
          content: "น้ำหนักการเคลือบ (กรัม/ตร.ม.)",
        },
        dataReport[indexStart].ItemReportName,
        dataReport[indexStart + 1].ItemReportName,
        dataReport[indexStart + 2].ItemReportName,
      ]);

      dataInTable.push([
        dataReport[indexStart].ResultReport,
        dataReport[indexStart + 1].ResultReport,
        dataReport[indexStart + 2].ResultReport,
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 4,
        head: [
          [
            {
              content: "ชิ้นงาน",
            },
            {
              colSpan: 3,
              content: "หลังการอัดรีด",
            },
          ],
        ],
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
          fontSize: 13,
          cellPadding: 1,
          lineColor: 0,
          lineWidth: 0.1,
          maxCellHeight: 11,
          //cellWidth: 17,
        },
        columnStyles: {
          //0: {cellWidth : 20},
          //0: { cellWidth: 15, fillColor: [211, 239, 240] },
          //1: { cellWidth: 35 },
          //2: { cellWidth: 30 },
          //3: { cellWidth: 30 },
          //4: { cellWidth: 30 },
        },
        willDrawCell: function (data) {
          if (data.column.index === 3 && data.section === "body") {
            if (
              dataReport[indexStart + data.row.index].Evaluation == "ต่ำ" ||
              dataReport[indexStart + data.row.index].Evaluation == "สูง" ||
              dataReport[indexStart + data.row.index].Evaluation == "ไม่ผ่าน"
            ) {
              doc.setTextColor(231, 76, 60); // Red
            }
          }
          if (data.column.index === 4 && data.section === "body") {
            if (
              data.cell.raw == "ต่ำ" ||
              data.cell.raw == "สูง" ||
              data.cell.raw == "ไม่ผ่าน"
            ) {
              doc.setTextColor(231, 76, 60); // Red
            }
          }
        },

        theme: "grid",
      });
      currentY = doc.lastAutoTable.finalY;
    }

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
