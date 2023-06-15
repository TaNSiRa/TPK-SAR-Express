const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../function/dateTime");

exports.CreatePDF = async (dataReport) => {
  try {
    console.log("In PLANT");
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 0;
    doc.setFont("THSarabun");
    console.log("2");
    var buffDoc;
    //Header Set
    buffDoc = await HeaderSet(dataReport, doc);
    doc = buffDoc[0];
    currentY = buffDoc[1];

    //Data Set
    buffDoc = await DataSet(dataReport, doc, currentY);
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

function HeaderSet(dataReport, doc) {
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
    doc.text("Sampling Date", 63, currentY + 4 + fontSize / 2.5);

    doc.setFont("THSarabun", "normal");
    doc.text(dataReport[0].CustFull, 110, currentY + 4);
    doc.text(
      dtConv.toDateOnly(dataReport[0].SamplingDate),
      110,
      currentY + 4 + fontSize / 2.5
    );

    currentY = currentY + 4 + fontSize / 2.5;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
}

function DataSet(dataReport, doc, currentY) {
  try {
    console.log("DataSet");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Condition",
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

    var dataInTable = [];

    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        break;
      }

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
              ]);
            } else {
              dataInTable.push([
                //dataReport[i + j].ProcessReportName,
                dataReport[i + j].ItemReportName,
                dataReport[i + j].ControlRange,
                dataReport[i + j].ResultReport,
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
          ]);
        }
      } else {
        dataInTable.push([
          dataReport[i].ProcessReportName,
          dataReport[i].ItemReportName,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [
        [
          "PROCESS",
          "CHECK ITEM",
          {
            content: "CONTROLED RANGE",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 11,
            },
          },
          "RESULT",
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
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
        //cellWidth: 17,
      },
      columnStyles: {
        //0: {cellWidth : 20},
        0: { fillColor: [211, 239, 240] },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
      },
      willDrawCell: function (data) {
        if (data.column.index === 3 && data.section === "body") {
          if (
            dataReport[data.row.index].Evaluation == "LOW" ||
            dataReport[data.row.index].Evaluation == "HIGH" ||
            dataReport[data.row.index].Evaluation == "NOT PASS" ||
            dataReport[data.row.index].Evaluation == "NG"
          ) {
            doc.setTextColor(231, 76, 60); // Red
          }
        }
        if (data.column.index === 4 && data.section === "body") {
          if (
            data.cell.raw == "LOW" ||
            data.cell.raw == "HIGH" ||
            data.cell.raw == "NOT PASS" ||
            data.cell.raw == "NG"
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
