const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");
const Pattern_MainP = require("./PatternComponent/Pattern_3MainPicSet.js");
const Pattern_MainC = require("./PatternComponent/Pattern_4MainCommentSetTH.js");
const Pattern_Doc = require("./PatternComponent/Pattern_5MasterDoc.js");
const fs = require("fs");

exports.CreatePDF = async (dataReport) => {
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;
    doc.setFont("THSarabun");
    console.log("IEMT");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "ค่าควบคุมน้ำยา",
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
              cellWidth: 20,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    buffDoc = await DataSetTH("PK-SAL170 #1", 0, 5, dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    buffDoc = await DataSetTH("PK-SAL170 #2", 6, 11, dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    buffDoc = await DataSetTH("PK-4210", 12, 17, dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Comment
    buffDoc = await Pattern_MainC.CommentSetTH(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //SignSet
    currentY = currentY + 15;
    buffDoc = await Pattern_MainH.SignSet(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Document Code
    doc = await Pattern_Doc.MasterWeeklyDocument(doc);

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

async function DataSetTH(
  LineName,
  StartIndex,
  EndIndex,
  dataReport,
  doc,
  currentY
) {
  try {
    console.log(StartIndex);
    console.log(EndIndex);
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: LineName,
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.4,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });

    var dataInTable = [];

    for (let i = StartIndex; i <= EndIndex; i++) {
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

    for (let i = StartIndex; i < EndIndex; i++) {
      //merge dupicate
      if (i < dataReport.length - 1) {
        if (
          dataReport[i].ProcessReportName == dataReport[i + 1].ProcessReportName
        ) {
          let countSpan = 2;
          for (let j = 1; i + j < dataReport.length; j++) {
            if (i + j < dataReport.length - 1) {
              if (
                dataReport[i].ProcessReportName ==
                dataReport[i + j + 1].ProcessReportName
              ) {
                countSpan++;
              } else {
                break;
              }
            } else {
              break;
            }
          }
          for (let j = 0; j < countSpan; j++) {
            if (j == 0) {
              dataInTable.push([
                {
                  rowSpan: countSpan,
                  content: dataReport[i].ProcessReportName,
                },
                //dataReport[i].ProcessReportName,
                dataReport[i].ItemReportName,
                dataReport[i].ControlRange,
                dataReport[i].ResultReport,
                dataReport[i].Evaluation,
              ]);
            } else {
              dataInTable.push([
                //dataReport[i + j].ProcessReportName,
                dataReport[i + j].ItemReportName,
                dataReport[i + j].ControlRange,
                dataReport[i + j].ResultReport,
                dataReport[i + j].Evaluation,
              ]);
            }
          }
          i = i + countSpan - 1;
        } else {
          dataInTable.push([
            dataReport[i].ProcessReportName,
            dataReport[i].ItemReportName,
            dataReport[i].ControlRange,
            dataReport[i].ResultReport,
            dataReport[i].Evaluation,
          ]);
        }
      } else {
        dataInTable.push([
          dataReport[i].ProcessReportName,
          dataReport[i].ItemReportName,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
          dataReport[i].Evaluation,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      head: [
        [
          "กระบวนการ",
          "หัวข้อควบคุม",
          {
            content: "ช่วงที่ควบคุม",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 11,
            },
          },
          "ผลการตรวจสอบ",
          "หมายเหตุ",
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
        0: { fillColor: [211, 239, 240] },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      willDrawCell: function (data) {
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[StartIndex + data.row.index].Evaluation == "ต่ำ" ||
            dataReport[StartIndex + data.row.index].Evaluation == "สูง" ||
            dataReport[StartIndex + data.row.index].Evaluation == "ไม่ผ่าน"
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
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}
