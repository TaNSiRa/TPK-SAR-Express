const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.SignSet = async (dataReport, doc, currentY) => {
  try {
    console.log("SignSetSRK");
    //spans();
    var signCount = 0;
    var signWidth = 25;
    var signHeight = 14;
    var fontSize = 10;
    var cellStyle = {
      textColor: 0,
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: fontSize,
      valign: "middle",
      halign: "center",
      cellWidth: signWidth,
      //maxCellHeight: 3,
      cellPadding: 0.1,
      lineColor: 0,
      lineWidth: 0.1,
    };

    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "PSTH",
            colSpan: 2,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: 5,
            },
          },
        ],[
          {
            content: "Q.A.",
            colSpan: 2,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: 5,
            },
          },
        ],
      ],
      body: [
        [
          {
            content: "APPROVED",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              // fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: 5,
            },
          },
          {
            content: "CHECKED",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              // fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: 5,
            },
          },
        ],

        [
          {
            content: "",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: signHeight,
            },
          },
          {
            content: "",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: fontSize,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.1,
              minCellHeight: signHeight,
            },
          },
        ],
      ],
      columnStyles: {
        0: cellStyle,
        1: cellStyle,
      },
      theme: "grid",
      margin: { left: 40 },
    });

    var dataInTable = [
      ["Approved by", "Approved by", "Approved by", "Approved by", "Issued by"],
      [
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
        {
          content: "",
          styles: {
            valign: "middle",
            halign: "center",
            minCellHeight: signHeight,
          },
        },
      ],
      [
        dtConv.toDateOnly(dataReport[0].JPTime) || "",
        dtConv.toDateOnly(dataReport[0].DGMTime) || "",
        dtConv.toDateOnly(dataReport[0].GLTime) || "",
        dtConv.toDateOnly(dataReport[0].SubLeaderTime) || "",
        dtConv.toDateOnly(dataReport[0].InchargeTime) || "",
      ],
      [
        dataReport[0].JP || "",
        dataReport[0].DGM || "",
        dataReport[0].GL || "",
        dataReport[0].SubLeader || "",
        dataReport[0].Incharge || "",
      ],
    ];

    if (dataReport[0].Incharge == "" || dataReport[0].Incharge == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(4, 1);
      }
    } else {
      signCount++;
    }
    if (dataReport[0].SubLeader == "" || dataReport[0].SubLeader == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(3, 1);
      }
    } else {
      signCount++;
    }
    if (dataReport[0].GL == "" || dataReport[0].GL == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(2, 1);
      }
    } else {
      signCount++;
    }
    if (dataReport[0].DGM == "" || dataReport[0].DGM == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(1, 1);
      }
    } else {
      signCount++;
    }

    if (dataReport[0].JP == "" || dataReport[0].JP == "-") {
      for (var i = 0; i < 4; i++) {
        dataInTable[i].splice(0, 1);
      }
    } else {
      signCount++;
    }

    //Add Sign Table
    var margin = (210 - signCount * signWidth) / 2;
    // magin page left right
    if (signCount <= 2) {
      doc.autoTable({
        startY: currentY,
        head: [
          [
            {
              content: "MARKETING DEPARTMENT",
              colSpan: signCount,
              styles: {
                textColor: 0,
                halign: "center",
                valign: "middle",
                fillColor: [255, 255, 255],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: fontSize,
                cellPadding: 0.1,
                lineColor: 0,
                lineWidth: 0.1,
                minCellHeight: 5,
              },
            },
          ],
        ],
        body: dataInTable,
        columnStyles: {
          0: cellStyle,
          1: cellStyle,
          2: cellStyle,
          3: cellStyle,
          4: cellStyle,
        },
        theme: "grid",
        margin: { left: 120 },
        didDrawCell: function (data) {
          if (data.row.index == [1]) {
            //แถวรูป index 1 ใช้คำสั่งนี้เพื่อดึงค่าพิกัด xy มา plot รุปทับตาราง
            //console.log(data.cell.raw + "|" + data.column.index);
            //console.log(dataInTable[2][data.column.index]);
            //check time sign
            if (dataInTable[2][data.column.index] != "") {
              //console.log(dataInTable[2][data.column.index]);
              //console.log(dataInTable[3][data.column.index]);
              try {
                let bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset_ts\\Sign_Pic\\" +
                    dataInTable[3][data.column.index] +
                    ".jpg"
                );
                doc.addImage(
                  bitmap.toString("base64"),
                  "jpg",
                  data.cell.x + 1,
                  data.cell.y + 1,
                  signWidth - 2,
                  signHeight - 2
                );
              } catch (err) {
                //console.log(err);
              }
              /* doc.addImage(
                coinBase64Img,
                "PNG",
  
                5,
                5
              ); */
            }
          }
        },
      });
    } else {
      doc.autoTable({
        startY: currentY,
        head: [
          [
            {
              content: "MARKETING DEPARTMENT",
              colSpan: signCount,
              styles: {
                textColor: 0,
                halign: "center",
                valign: "middle",
                fillColor: [255, 255, 255],
                font: "THSarabun",
                fontStyle: "bold",
                fontSize: fontSize,
                cellPadding: 0.1,
                lineColor: 0,
                lineWidth: 0.1,
                minCellHeight: 5,
              },
            },
          ],
        ],
        body: dataInTable,
        columnStyles: {
          0: cellStyle,
          1: cellStyle,
          2: cellStyle,
          3: cellStyle,
          4: cellStyle,
        },
        theme: "grid",
        margin: { left: 95 },
        didDrawCell: function (data) {
          if (data.row.index == [1]) {
            //แถวรูป index 1 ใช้คำสั่งนี้เพื่อดึงค่าพิกัด xy มา plot รุปทับตาราง
            //console.log(data.cell.raw + "|" + data.column.index);
            //console.log(dataInTable[2][data.column.index]);
            //check time sign
            if (dataInTable[2][data.column.index] != "") {
              //console.log(dataInTable[2][data.column.index]);
              //console.log(dataInTable[3][data.column.index]);
              try {
                let bitmap = fs.readFileSync(
                  "C:\\AutomationProject\\SAR\\asset_ts\\Sign_Pic\\" +
                    dataInTable[3][data.column.index] +
                    ".jpg"
                );
                doc.addImage(
                  bitmap.toString("base64"),
                  "jpg",
                  data.cell.x + 1,
                  data.cell.y + 1,
                  signWidth - 2,
                  signHeight - 2
                );
              } catch (err) {
                //console.log(err);
              }
              /* doc.addImage(
              coinBase64Img,
              "PNG",

              5,
              5
            ); */
            }
          }
        },
      });
    }
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
