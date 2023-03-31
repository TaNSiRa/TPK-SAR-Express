const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.HeaderSetYear = async (dataReport, doc) => {
  try {
    var currentY = 10;
    console.log("HEADERYear");

    //Add Customer Name
    var custHigh = 20;
    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "MESSRS : " + dataReport[0].CustFull,
            //colSpan: 5,
            styles: {
              textColor: 0,
              halign: "left",
              valign: "top",
              //fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 15,
              //minCellHeight: custHigh,
              cellWidth: 200,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    doc.autoTable({
      startY: currentY + 2,
      head: [
        [
          {
            content: "PRETREATMENT LINE CHECKING REPORT",
            //colSpan: 5,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              //fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              minCellHeight: custHigh,
              //cellWidth: 200,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    //Add Logo
    var picHigh = 12;
    var picWidth = 25;
    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(
      bitmap.toString("base64"),
      "JPG",
      220,
      currentY,
      picWidth,
      picHigh
    );
    //currentY = currentY + picHigh;

    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "THAI PARKERIZING CO.,LTD.",
            styles: {
              textColor: 0,
              halign: "right",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.2,
              maxCellHeight: 12,
            },
          },
        ],
        [
          {
            content: "TECHNICAL DEPT.",
            styles: {
              textColor: 0,
              halign: "right",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.2,
              maxCellHeight: 12,
            },
          },
        ],
        [
          {
            content: "FR-CTS02/004-02-09/01/14",
            styles: {
              textColor: 0,
              halign: "right",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "normal",
              fontSize: 10,
              cellPadding: 0.2,
              maxCellHeight: 12,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    //text
    currentY = doc.lastAutoTable.finalY;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.SignSetYear = async (dataReport, doc, currentY) => {
  try {
    console.log("SignSet");
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
    var margin = 283 - signCount * signWidth;
    // magin page left right

    doc.autoTable({
      startY: currentY + 10,
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
      margin: { left: margin },
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

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.HeaderSetYearA3 = async (dataReport, doc) => {
  try {
    var currentY = 10;
    console.log("HEADERYear");

    //Add Customer Name
    var custHigh = 20;
    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "MESSRS : " + dataReport[0].CustFull,
            //colSpan: 5,
            styles: {
              textColor: 0,
              halign: "left",
              valign: "top",
              //fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 15,
              //minCellHeight: custHigh,
              cellWidth: 200,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    doc.autoTable({
      startY: currentY + 2,
      head: [
        [
          {
            content: "PRETREATMENT LINE CHECKING REPORT",
            //colSpan: 5,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              //fillColor: [3, 244, 252],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              minCellHeight: custHigh,
              //cellWidth: 200,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    //Add Logo
    var picHigh = 12;
    var picWidth = 25;
    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(
      bitmap.toString("base64"),
      "JPG",
      340,
      currentY,
      picWidth,
      picHigh
    );
    //currentY = currentY + picHigh;

    doc.autoTable({
      startY: currentY,
      head: [
        [
          {
            content: "THAI PARKERIZING CO.,LTD.",
            styles: {
              textColor: 0,
              halign: "right",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.2,
              maxCellHeight: 12,
            },
          },
        ],
        [
          {
            content: "TECHNICAL DEPT.",
            styles: {
              textColor: 0,
              halign: "right",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 0.2,
              maxCellHeight: 12,
            },
          },
        ],
        [
          {
            content: "FR-CTS02/004-02-09/01/14",
            styles: {
              textColor: 0,
              halign: "right",
              valign: "middle",
              font: "THSarabun",
              fontStyle: "normal",
              fontSize: 10,
              cellPadding: 0.2,
              maxCellHeight: 12,
            },
          },
        ],
      ],
      //body: body,
      theme: "plain",
    });

    //text
    currentY = doc.lastAutoTable.finalY;

    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.SignSetYearA3 = async (dataReport, doc, currentY) => {
  try {
    console.log("SignSet");
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
    var margin = 406 - signCount * signWidth;
    // magin page left right

    doc.autoTable({
      startY: currentY + 10,
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
      margin: { left: margin },
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

    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};
