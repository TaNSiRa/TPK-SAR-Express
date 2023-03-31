const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSetTH.js");
const Pattern_MainD = require("./PatternComponent/Pattern_2MainDataSetTH.js");
const Pattern_MainP = require("./PatternComponent/Pattern_3MainPicSetTH.js");
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
    console.log("2");
    var buffDoc;
    //Header Set
    buffDoc = await Pattern_MainH.HeaderSetTH(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //SignSet
    buffDoc = await Pattern_MainH.SignSetTH(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];
    //Data Set
    buffDoc = await Pattern_MainD.DataSetTH(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Pic
    buffDoc = await PicSetTH(dataReport, doc, currentY);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Set Comment
    buffDoc = await Pattern_MainC.CommentSetTH(dataReport, doc, currentY);
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

    return bitmap.toString("base64");
  } catch (err) {
    console.log(err);
    return err;
  }
};

/* PicSetTH = async (dataReport, doc, currentY) => { */
async function PicSetTH(dataReport, doc, currentY) { 
  console.log("CPR1");
  try {
    doc.addPage();
    currentY = 10;

    console.log("PicSet");
    var i = 0;
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        break;
      }
    }
    var picStartIndex = i;

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

    var TextSubJect = "ลักษณะการเคลือบ";
    var widthText = doc.getTextWidth(TextSubJect);
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: TextSubJect,
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
              cellWidth: widthText,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    var countSetPic = 0;
    var picHeight = 40;
    var picWidht = 45;
    var dataInTable = [];

    dataInTable.push([
      "ชิ้นงานปกติ",
      dataReport[picStartIndex].ItemReportName,
      "ชิ้นงานปกติ",
      dataReport[picStartIndex + 1].ItemReportName,
    ]);
    dataInTable.push([
      {
        content: "",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
    ]);
    dataInTable.push([
      dataReport[picStartIndex + 2].ItemReportName,
      dataReport[picStartIndex + 2].ResultReport,
      dataReport[picStartIndex + 3].ItemReportName,
      dataReport[picStartIndex + 3].ResultReport,
    ]);
    dataInTable.push([
      dataReport[picStartIndex + 4].ItemReportName,
      dataReport[picStartIndex + 4].ResultReport,
      dataReport[picStartIndex + 5].ItemReportName,
      dataReport[picStartIndex + 5].ResultReport,
    ]);
    dataInTable.push([
      dataReport[picStartIndex + 6].ItemReportName,
      dataReport[picStartIndex + 6].ResultReport,
      dataReport[picStartIndex + 7].ItemReportName,
      dataReport[picStartIndex + 7].ResultReport,
    ]);
    doc.autoTable({
      startY: currentY + 4,
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
        0: { cellWidth: picWidht },
        1: { cellWidth: picWidht },
        2: { cellWidth: picWidht },
        3: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      willDrawCell: function (data) {
        if (data.row.index === 4 && data.column.index === 1) {
          if (
            data.cell.raw == "ต่ำ" ||
            data.cell.raw == "สูง" ||
            data.cell.raw == "ไม่ผ่าน"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
        if (data.row.index === 4 && data.column.index === 3) {
          if (
            data.cell.raw == "ต่ำ" ||
            data.cell.raw == "สูง" ||
            data.cell.raw == "ไม่ผ่าน"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
      },
      didDrawCell: function (data) {
        if (data.row.index == 1 && data.column.index == 0) {
          try {
            let bitmap = fs.readFileSync("C:\\SAR\\asset\\CPRIN.jpg");
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log(err);
          }
        }
        if (data.row.index == 1 && data.column.index == 1) {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" +
                dataReport[picStartIndex].ResultReport
            );
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log(err);
          }
        }
        if (data.row.index == 1 && data.column.index == 2) {
          try {
            let bitmap = fs.readFileSync("C:\\SAR\\asset\\CPROUT.jpg");
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log(err);
          }
        }
        if (data.row.index == 1 && data.column.index == 3) {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" +
                dataReport[picStartIndex + 1].ResultReport
            );
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log(err);
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
