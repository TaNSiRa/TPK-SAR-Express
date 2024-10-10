const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const Pattern_MainH = require("./PatternComponent/Pattern_1MainHeadSet.js");

exports.CreatePDF = async (dataReport) => {
  try {
    var doc = new jsPDF(); // defualt unit mm.
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    var currentY = 15;
    var currentX = 15;
    var margin = 10;
    var picHigh = 14;
    doc.setFont("THSarabun");
    console.log("PHODAIHAN");

    // วาดกรอบสี่เหลี่ยม
    doc.setLineWidth(1);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    var bitmap = fs.readFileSync("C:\\SAR\\asset\\TPK_LOGO.jpg");
    doc.addImage(bitmap.toString("base64"), "JPG", currentX, currentY, 28, picHigh);

    doc.autoTable({
      startY: currentY,
      margin: { left: 44 },
      head: [
        [
          {
            content: "THAI PARKERIZING CO.,LTD.",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 16,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0,
              maxCellHeight: 12,
              cellWidth: 60,
            },
          },
        ],
      ],
      theme: "grid",
    });
    doc.autoTable({
      startY: currentY + 8.5,
      margin: { left: 44 },
      head: [
        [
          {
            content: "Heat & Surface Treatment Division",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 14,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0,
              maxCellHeight: 12,
              cellWidth: 60,
            },
          },
        ],
      ],
      theme: "grid",
    });

    doc.autoTable({
      startY: currentY - 1,
      margin: { left: 105 },
      head: [
        [
          {
            content: "Quality testing Report\nFor Surface treatment (ESIE1)",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 14,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 70,
            },
          },
        ],
      ],
      theme: "grid",
    });

    doc.autoTable({
      startY: currentY + 11.75,
      margin: { left: 105 },
      head: [
        [
          {
            content: "FR-HQC-03/010-02-15/01/21",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 10,
              cellPadding: 0.6,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 7,
              cellWidth: 70,
            },
          },
        ],
      ],
      theme: "grid",
    });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin + 4, margin + 4, currentX + 166, currentY + 3);

    doc.autoTable({
      startY: currentY + 2,
      margin: { left: 180 },
      head: [
        [
          {
            content: "Page\n1/1",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 12,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0,
              maxCellHeight: 12,
              cellWidth: 10,
            },
          },
        ],
      ],
      theme: "grid",
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 3,
      margin: { left: 14 },
      head: [
        [
          {
            content: "Customer name",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 14,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 31,
            },
          },
          {
            content: dataReport[0].CustFull,
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 14,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.5,
              cellWidth: 150,
            },
          },
        ],
      ],
      theme: "grid",
    });

    var dataInTable = [];
    var allPass = true; // ตัวแปรสำหรับตรวจสอบว่าเป็น PASS ทั้งหมดหรือไม่

    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        break;
      } else if (dataReport[i].Evaluation !== "PASS") {
        allPass = false; // หากมีค่าไม่ใช่ PASS เปลี่ยนเป็น false
      }
    }

    if (allPass) {
      // ถ้าเป็น PASS ทั้งหมด
      dataInTable.push(["PASS"]);
    } else {
      // ถ้ามีค่า NG
      dataInTable.push(["NG"]);
    }

    var dataInTable0 = [];
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        break;
      } else if (dataReport[i].ProcessReportName == "Part name") {
        dataInTable0.push([
          dataReport[i].ResultReport,
        ]);
      } else if (dataReport[i].ProcessReportName == "Part no.") {
        dataInTable0.push([
          dataReport[i].ResultReport,
        ]);
      } else if (dataReport[i].ProcessReportName == "Customer Lot no.") {
        dataInTable0.push([
          dataReport[i].ResultReport,
        ]);
      } else if (dataReport[i].ProcessReportName == "TP Lot no.") {
        dataInTable0.push([
          dataReport[i].ResultReport,
        ]);
      } else if (dataReport[i].ProcessReportName == "Quantity") {
        dataInTable0.push([
          dataReport[i].ResultReport,
        ]);
      }
    }

    const body = [
      ['Part name', dataInTable0[0], 'Process', dataReport[0].GroupNameTS],
      ['Part No.', dataInTable0[1], 'Material', 'A3003/A4343'],
      ['Customer Lot no.', dataInTable0[2], 'TP Lot no.', dataInTable0[3]],
    ];

    doc.autoTable({
      body: body,
      startY: doc.lastAutoTable.finalY,
      margin: { left: 14 },
      theme: "grid",
      styles: {
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 14,
        textColor: 0,
        halign: "left",
        valign: "middle",
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { cellWidth: 31 },
        1: { cellWidth: 59.5 },
        2: { cellWidth: 31 },
        3: { cellWidth: 59.5 },
      }
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 3,
      margin: { left: 14 },
      head: [
        [
          {
            content: "Incoming Inspection",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 18,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 50,
            },
          },

        ],
      ],
      theme: "grid",
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      margin: { left: 14 },
      head: [
        [
          {
            content: "Quantity : " + dataInTable0[4] + " pcs",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 14,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0,
              maxCellHeight: 12,
              cellWidth: 40,
            },
          },

        ],
      ],
      theme: "grid",
    });

    var dataInTable1 = [];
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        break;
      } else if (dataReport[i].ProcessReportName == "Incoming Inspection") {
        dataInTable1.push([
          dataReport[i].ItemReportName,
          dataReport[i].SampleTank,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      head: [
        [
          "Item",
          "Frequency",
          "Specification",
          "RESULT",
        ],
      ],
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 15,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        minCellHeight: 10,
        maxCellHeight: 12,
      },
      body: dataInTable1,
      bodyStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
      },
      columnStyles: {
        0: { cellWidth: 60.5, halign: "left" },
        1: { cellWidth: 35, halign: "center" },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 50.5, halign: "center" },
      },
      theme: "grid",
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 3,
      margin: { left: 14 },
      head: [
        [
          {
            content: "Inprocess Inspection",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 18,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 50,
            },
          },

        ],
      ],
      theme: "grid",
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      margin: { left: 14 },
      head: [
        [
          {
            content: "Quantity : " + dataInTable0[4] + " pcs",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 14,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0,
              maxCellHeight: 12,
              cellWidth: 40,
            },
          },

        ],
      ],
      theme: "grid",
    });

    var dataInTable2 = [];
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        break;
      } else if (dataReport[i].ProcessReportName == "Inprocess Inspection") {
        dataInTable2.push([
          dataReport[i].ItemReportName,
          dataReport[i].SampleTank,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      head: [
        [
          "Item",
          "Frequency",
          "Specification",
          "RESULT",
        ],
      ],
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 15,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        minCellHeight: 10,
        maxCellHeight: 12,
      },
      body: dataInTable2,
      bodyStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
      },
      columnStyles: {
        0: { cellWidth: 60.5, halign: "left" },
        1: { cellWidth: 35, halign: "center" },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 50.5, halign: "center" },
      },
      theme: "grid",
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 3,
      margin: { left: 14 },
      head: [
        [
          {
            content: "Final Inspection",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 18,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 50,
            },
          },

        ],
      ],
      theme: "grid",
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      margin: { left: 14 },
      head: [
        [
          {
            content: "Quantity : " + dataInTable0[4] + " pcs",
            styles: {
              textColor: 0,
              halign: "left",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 14,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0,
              maxCellHeight: 12,
              cellWidth: 40,
            },
          },

        ],
      ],
      theme: "grid",
    });

    var dataInTable3 = [];
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        break;
      } else if (dataReport[i].ProcessReportName == "Final Inspection") {
        dataInTable3.push([
          dataReport[i].ItemReportName,
          dataReport[i].SampleTank,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      head: [
        [
          "Item",
          "Frequency",
          "Specification",
          "RESULT",
        ],
      ],
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 15,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        minCellHeight: 10,
        maxCellHeight: 12,
      },
      body: dataInTable3,
      bodyStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
      },
      columnStyles: {
        0: { cellWidth: 60.5, halign: "left" },
        1: { cellWidth: 35, halign: "center" },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 50.5, halign: "center" },
      },
      theme: "grid",
    });

    var dataInTable4 = [];
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 100) {
        break;
      } else if (dataReport[i].ProcessReportName == "Final Inspection lab") {
        dataInTable4.push([
          dataReport[i].ItemReportName,
          dataReport[i].SampleTank,
          dataReport[i].ControlRange,
          dataReport[i].ResultReport,
        ]);
      }
    }

    var mergedData = [];

    // ฟังก์ชันสำหรับรวมข้อมูล
    function mergeData(dataInTable4) {
      let combined = {};

      for (let i = 0; i < dataInTable4.length; i++) {
        const itemName = dataInTable4[i][0];

        // เช็คว่ามีข้อมูลแล้วหรือยัง
        if (!combined[itemName]) {
          combined[itemName] = [
            itemName, // ItemReportName
            dataInTable4[i][1], // SampleTank
            dataInTable4[i][2], // ControlRange
          ];
        }

        // เพิ่ม ResultReport โดยเช็คว่าเป็นตำแหน่งคู่หรือคี่
        if (dataInTable4[i][3] !== undefined) {
          combined[itemName].push(dataInTable4[i][3]);
        }
      }

      // แปลงกลับไปเป็น array
      return Object.values(combined);
    }

    // เรียกใช้ฟังก์ชัน mergeData
    mergedData = mergeData(dataInTable4);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY,
      body: mergedData,
      bodyStyles: {
        textColor: 0,
        halign: "left",
        valign: "middle",
        fillColor: [255, 255, 255],
        font: "THSarabun",
        fontStyle: "normal",
        fontSize: 12,
        cellPadding: 1,
        lineColor: 0,
        lineWidth: 0.1,
        maxCellHeight: 11,
      },
      columnStyles: {
        0: { cellWidth: 60.5, halign: "left" },
        1: { cellWidth: 35, halign: "center" },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 10.1, halign: "center" },
        4: { cellWidth: 10.1, halign: "center" },
        5: { cellWidth: 10.1, halign: "center" },
        6: { cellWidth: 10.1, halign: "center" },
        7: { cellWidth: 10.1, halign: "center" },
      },
      theme: "grid",
    });

    //SignSet
    buffDoc = await Pattern_MainH.SignSetforPHODAIHAN(dataReport, doc, doc.lastAutoTable.finalY + 10);

    doc.autoTable({
      startY: 250,
      margin: { left: 14 },
      head: [
        [
          {
            content: "REMARK:",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 16,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 30,
            },
          },
        ],
      ],
      body: [
        [
          {
            content: "",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "normal",
              fontSize: 12,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 30,
              minCellHeight: 20,
            },
          },
        ],
      ],
      theme: "grid",
    });

    doc.autoTable({
      startY: 250,
      margin: { left: 95 },
      head: [
        [
          {
            content: "Judgement",
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 10,
              cellPadding: 0.1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 25,
            },
          },
        ],
      ],
      body: [
        [
          {
            content: dataInTable,
            styles: {
              textColor: 0,
              halign: "center",
              valign: "middle",
              fillColor: [255, 255, 255],
              font: "THSarabun",
              fontStyle: "bold",
              fontSize: 16,
              cellPadding: 1,
              lineColor: 0,
              lineWidth: 0.5,
              maxCellHeight: 12,
              cellWidth: 25,
              minCellHeight: 22.5,
            },
          },
        ],
      ],
      theme: "grid",
    });

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
