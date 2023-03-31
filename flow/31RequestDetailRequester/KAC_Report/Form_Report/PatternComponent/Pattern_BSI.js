const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");
const Pattern_Doc = require("./Pattern_5MasterDoc");

exports.CoatingPre = async (dataReport, doc, currentY) => {
  try {
    console.log("Coat_PicBSI");
    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Coating performance",
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
              cellWidth: 33,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;

    var dataInTable = [];
    //find data
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder > 100) {
        break;
      }
    }

    dataInTable.push([
      {
        content: dataReport[i].ItemReportName,
      },
      {
        content: "-",
      },
      {
        content: dataReport[i].ControlRange,
      },
      {
        content: dataReport[i].ResultReport,
      },
      {
        content: dataReport[i].Evaluation,
      },
    ]);

    dataInTable.push([
      {
        rowSpan: 2,
        content: dataReport[i + 1].ItemReportName,
      },
      {
        content: "Top",
      },
      {
        rowSpan: 2,
        content: dataReport[i + 1].ControlRange,
      },
      {
        content: dataReport[i + 1].ResultReport,
      },
      {
        content: dataReport[i + 1].Evaluation,
      },
    ]);

    dataInTable.push([
      {
        content: "Bottom",
      },
      {
        content: dataReport[i + 2].ResultReport,
      },
      {
        content: dataReport[i + 2].Evaluation,
      },
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          "ITEM",
          "VIEW SIZE",
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
          "EVALUATION",
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
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    return [doc, currentY];
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.Big2Sem = async (dataReport, doc, currentY) => {
  try {
    console.log("Big2Sem");

    currentY = await Pattern_Doc.addPage(doc);

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Flim quality",
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
              cellWidth: 20,
            },
          },
        ],
      ],
      //body: body,
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY;
    var dataInTable = [];
    var i = 0;
    //find data
    for (i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder == 105) {
        break;
      }
    }
    var picHeight = 65;
    var picWidth = 91;

    dataInTable.push([
      {
        content: "",
        styles: {
          minCellHeight: picHeight,
        },
      },
      {
        content: "",
        styles: {
          minCellHeight: picHeight,
        },
      },
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      head: [["TOP X 500", "BOTTOM X 500"]],
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
        minCellHeight: picHeight,
      },
      columnStyles: {
        0: { cellWidth: picWidth },
        1: { cellWidth: picWidth },
      },
      didDrawCell: function (data) {
        if (
          data.column.index == 0 &&
          data.row.index === 0 &&
          data.section === "body"
        ) {
          try {
            var bitmap;
            try {
              bitmap = fs.readFileSync(
                "C:\\AutomationProject\\SAR\\asset\\" +
                  dataReport[i].ResultReport
              );
            } catch (err) {
              console.log("error pic" + err);
              bitmap = fs.readFileSync("C:\\SAR\\asset\\NotFoundPic.jpg");
            }
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidth - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log("error pic" + err);
          }
        }
        if (
          data.column.index == 1 &&
          data.row.index == 0 &&
          data.section === "body"
        ) {
          try {
            var bitmap;
            try {
              bitmap = fs.readFileSync(
                "C:\\AutomationProject\\SAR\\asset\\" +
                  dataReport[i + 1].ResultReport
              );
            } catch (err) {
              bitmap = fs.readFileSync("C:\\SAR\\asset\\NotFoundPic.jpg");
            }
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidth - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log("error pic" + err);
          }
        }
      },

      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY;

    doc.autoTable({
      startY: doc.lastAutoTable.finalY ,
      head: [["**REMARK : " + dataReport[i + 2].ResultReport]],
      headStyles: {
        textColor: 0,
        halign: "center",
        valign: "middle",
        //fillColor: [140, 255, 219],
        font: "THSarabun",
        fontStyle: "bold",
        fontSize: 12,
        cellPadding: 1,
/*         lineColor: 0,
        lineWidth: 0.1, */
        maxCellHeight: 12,
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

exports.ZincSet16Pic = async (dataReport, doc, currentY) => {
  try {
    console.log("ZincSet16Pic");

    doc.addPage();
    currentY = 10;

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Zinc phosphate coating",
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
    // add position pic
    currentY = doc.lastAutoTable.finalY;
    try {
      let bitmap = fs.readFileSync("C:\\SAR\\ASSET\\HNKPosPic.jpg");
      runningPic++;
      doc.addImage(
        bitmap.toString("base64"),
        "jpg",
        210 / 2 - 60 / 2,
        currentY,
        60,
        30
      );
    } catch (err) {
      console.log("error pic" + err);
    }

    currentY = currentY + 30; // add position high

    var dataInTable = [];
    var picSetData = [];
    var picHeight = 30;
    var picWidht = 40;
    var runningPic = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 110) {
        //picuter data start => 110 - 125
        picSetData.push(dataReport[i].ResultReport);
      }
    }
    //console.log(picSetData);
    //SET PIC
    dataInTable.push([
      {
        content: "A",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
      "",
    ]);
    dataInTable.push([
      {
        content: "B",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
      "",
    ]);
    dataInTable.push([
      {
        content: "C",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
      "",
    ]);
    dataInTable.push([
      {
        content: "D",
        styles: {
          valign: "middle",
          halign: "center",
          minCellHeight: picHeight,
        },
      },
      "",
      "",
      "",
      "",
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: [["Position", "Upper", "Outter", "Lower", "Inner"]],
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
        maxCellHeight: 12,
        //cellWidth: 17,
      },
      columnStyles: {
        0: { cellWidth: 20, fillColor: [211, 239, 240] },
        1: { cellWidth: picWidht },
        2: { cellWidth: picWidht },
        3: { cellWidth: picWidht },
        4: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (data.column.index != 0 && data.section === "body") {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" + picSetData[runningPic]
            );
            runningPic++;
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log("error pic" + err);
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
};

exports.ZincSet3Pic = async (dataReport, doc, currentY) => {
  try {
    console.log("ZincSet3Pic");

    if (currentY > 297 - 80) {
      doc.addPage();
      currentY = 10;
    }

    doc.autoTable({
      startY: currentY + 4,
      head: [
        [
          {
            content: "Position on spring for evaluate",
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
    // add position pic
    currentY = doc.lastAutoTable.finalY;

    var dataInTable = [];
    var picSetData = [];
    var picHeight = 30;
    var picWidht = 40;
    var runningPic = 0;
    var countHeader = 0;
    for (let i = 0; i < dataReport.length; i++) {
      if (dataReport[i].ReportOrder >= 110) {
        //picuter data start => 110 - 125
        picSetData.push(dataReport[i].ResultReport);
      }
    }
    //console.log(picSetData);
    //SET PIC
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

    doc.autoTable({
      startY: currentY + 4,
      head: [["TOP", "CENTER", "BOTTOM"]],
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
        maxCellHeight: 12,
        //cellWidth: 17,
      },
      columnStyles: {
        0: { cellWidth: picWidht },
        1: { cellWidth: picWidht },
        2: { cellWidth: picWidht },
        3: { cellWidth: picWidht },
      },
      allSectionHooks: true,
      didDrawCell: function (data) {
        if (data.section === "body") {
          try {
            let bitmap = fs.readFileSync(
              "C:\\AutomationProject\\SAR\\asset\\" + picSetData[runningPic]
            );
            runningPic++;
            doc.addImage(
              bitmap.toString("base64"),
              "jpg",
              data.cell.x + 1,
              data.cell.y + 1,
              picWidht - 2,
              picHeight - 2
            );
          } catch (err) {
            console.log("error pic" + err);
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
};

/*
 |--------------------------------------------------------------------------
 | This file contains examples of how to use this plugin
 |--------------------------------------------------------------------------
 |
 | To see what the documents generated by these examples looks like you can open
 | ´examples.html´ or go to http://simonbengtsson.github.io/jsPDF-AutoTable.
 |
 | To make it possible to view each example in examples.html some extra code
 | is added to the examples below. For example they return their jspdf
 | doc instance and gets generated data from the library faker.js. See simple.html
 | for a minimal example.
 */

var examples = {};
//window.examples = examples;

// Basic - shows what a default table looks like
function basic() {
  var doc = new jsPDF();

  // From HTML
  doc.autoTable({ html: ".table" });

  // From Javascript
  var finalY = doc.lastAutoTable.finalY || 10;
  doc.text("From javascript arrays", 14, finalY + 15);
  doc.autoTable({
    startY: finalY + 20,
    head: [["ID", "Name", "Email", "Country", "IP-address"]],
    body: [
      ["1", "Donna", "dmoore0@furl.net", "China", "211.56.242.221"],
      ["2", "Janice", "jhenry1@theatlantic.com", "Ukraine", "38.36.7.199"],
      [
        "3",
        "Ruth",
        "rwells2@constantcontact.com",
        "Trinidad and Tobago",
        "19.162.133.184",
      ],
      ["4", "Jason", "jray3@psu.edu", "Brazil", "10.68.11.42"],
      ["5", "Jane", "jstephens4@go.com", "United States", "47.32.129.71"],
      ["6", "Adam", "anichols5@com.com", "Canada", "18.186.38.37"],
    ],
  });

  finalY = doc.lastAutoTable.finalY;
  doc.text("From HTML with CSS", 14, finalY + 15);
  doc.autoTable({
    startY: finalY + 20,
    html: ".table",
    useCss: true,
  });

  return doc;
}

// Minimal - shows how compact tables can be drawn
minimal = function () {
  var doc = new jsPDF();
  doc.autoTable({
    html: ".table",
    tableWidth: "wrap",
    styles: { cellPadding: 0.5, fontSize: 8 },
  });
  return doc;
};

// Long data - shows how the overflow features looks and can be used
long = function () {
  var doc = new jsPDF("l");

  var head = headRows();
  head[0]["text"] = "Text";
  var body = bodyRows(4);
  body.forEach(function (row) {
    row["text"] = faker.lorem.sentence(100);
  });

  doc.text("Overflow 'ellipsize' with one column with long content", 14, 20);
  doc.autoTable({
    head: head,
    body: body,
    startY: 25,
    // Default for all columns
    styles: { overflow: "ellipsize", cellWidth: "wrap" },
    // Override the default above for the text column
    columnStyles: { text: { cellWidth: "auto" } },
  });
  doc.text(
    "Overflow 'linebreak' (default) with one column with long content",
    14,
    doc.lastAutoTable.finalY + 10
  );
  doc.autoTable({
    head: head,
    body: body,
    startY: doc.lastAutoTable.finalY + 15,
    rowPageBreak: "auto",
    bodyStyles: { valign: "top" },
  });

  return doc;
};

// Content - shows how tables can be integrated with any other pdf content
content = function () {
  var doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("With content", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // jsPDF 1.4+ uses getWidth, <1.4 uses .width
  var pageSize = doc.internal.pageSize;
  var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
  var text = doc.splitTextToSize(faker.lorem.sentence(45), pageWidth - 35, {});
  doc.text(text, 14, 30);

  doc.autoTable({
    head: headRows(),
    body: bodyRows(40),
    startY: 50,
    showHead: "firstPage",
  });

  doc.text(text, 14, doc.lastAutoTable.finalY + 10);

  return doc;
};

// Multiple - shows how multiple tables can be drawn both horizontally and vertically
multiple = function () {
  var doc = new jsPDF();
  doc.text("Multiple tables", 14, 20);

  doc.autoTable({ startY: 30, head: headRows(), body: bodyRows(25) });

  var pageNumber = doc.internal.getNumberOfPages();

  doc.autoTable({
    columns: [
      { dataKey: "id", header: "ID" },
      { dataKey: "name", header: "Name" },
      { dataKey: "expenses", header: "Sum" },
    ],
    body: bodyRows(15),
    startY: 240,
    showHead: "firstPage",
    styles: { overflow: "hidden" },
    margin: { right: 107 },
  });

  doc.setPage(pageNumber);

  doc.autoTable({
    columns: [
      { dataKey: "id", header: "ID" },
      { dataKey: "name", header: "Name" },
      { dataKey: "expenses", header: "Sum" },
    ],
    body: bodyRows(15),
    startY: 240,
    showHead: "firstPage",
    styles: { overflow: "hidden" },
    margin: { left: 107 },
  });

  for (var j = 0; j < 3; j++) {
    doc.autoTable({
      head: headRows(),
      body: bodyRows(),
      startY: doc.lastAutoTable.finalY + 10,
      pageBreak: "avoid",
    });
  }

  return doc;
};

// Header and footers - shows how header and footers can be drawn
examples["header-footer"] = function () {
  var doc = new jsPDF();
  var totalPagesExp = "{total_pages_count_string}";

  doc.autoTable({
    head: headRows(),
    body: bodyRows(40),
    didDrawPage: function (data) {
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40);
      if (base64Img) {
        doc.addImage(base64Img, "JPEG", data.settings.margin.left, 15, 10, 10);
      }
      doc.text("Report", data.settings.margin.left + 15, 22);

      // Footer
      var str = "Page " + doc.internal.getNumberOfPages();
      // Total page number plugin only available in jspdf v1.0+
      if (typeof doc.putTotalPages === "function") {
        str = str + " of " + totalPagesExp;
      }
      doc.setFontSize(10);

      // jsPDF 1.4+ uses getWidth, <1.4 uses .width
      var pageSize = doc.internal.pageSize;
      var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    },
    margin: { top: 30 },
  });

  // Total page number plugin only available in jspdf v1.0+
  if (typeof doc.putTotalPages === "function") {
    doc.putTotalPages(totalPagesExp);
  }

  return doc;
};

// Minimal - shows how compact tables can be drawn
defaults = function () {
  // Global defaults
  // (would apply to all documents if more than one were created)
  jsPDF.autoTableSetDefaults({
    headStyles: { fillColor: 0 },
  });

  var doc = new jsPDF();

  doc.text("Global options (black header)", 15, 20);
  doc.autoTable({ head: headRows(), body: bodyRows(5), startY: 25 });

  // Document defaults
  jsPDF.autoTableSetDefaults(
    {
      headStyles: { fillColor: [155, 89, 182] }, // Purple
      didDrawPage: function (data) {
        var finalY = doc.lastAutoTable.finalY + 15;
        var leftMargin = data.settings.margin.left;
        doc.text("Default options (purple header)", leftMargin, finalY);
      },
    },
    doc
  );

  var startY = doc.lastAutoTable.finalY + 20;
  doc.autoTable({ head: headRows(), body: bodyRows(5), startY: startY });

  // Reset defaults
  doc.autoTableSetDefaults(null);
  jsPDF.autoTableSetDefaults(null);

  var finalY = doc.lastAutoTable.finalY;
  doc.text("After reset (blue header)", 15, finalY + 15);
  doc.autoTable({ head: headRows(), body: bodyRows(5), startY: finalY + 20 });

  return doc;
};

// Column styles - shows how tables can be drawn with specific column styles
colstyles = function () {
  var doc = new jsPDF();
  doc.autoTable({
    head: headRows(),
    body: bodyRows(),
    showHead: false,
    // Note that the "id" key below is the same as the column's dataKey used for
    // the head and body rows. If your data is entered in array form instead you have to
    // use the integer index instead i.e. `columnStyles: {5: {fillColor: [41, 128, 185], ...}}`
    columnStyles: {
      id: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    },
  });

  return doc;
};

// Col spans and row spans
function spans() {
  var doc = new jsPDF("p", "pt");
  doc.text("Rowspan and colspan", 40, 50);

  var raw = bodyRows(40);
  var body = [];

  for (var i = 0; i < raw.length; i++) {
    var row = [];
    for (var key in raw[i]) {
      row.push(raw[i][key]);
    }
    if (i % 5 === 0) {
      row.unshift({
        rowSpan: 5,
        content: i / 5 + 1,
        styles: { valign: "middle", halign: "center" },
      });
    }
    body.push(row);
  }
  console.log(body);
  doc.autoTable({
    startY: 60,
    head: [
      [
        {
          content: "People",
          colSpan: 5,
          styles: { halign: "center", fillColor: [22, 160, 133] },
        },
      ],
    ],
    body: body,
    theme: "grid",
  });
  return doc;
}

// Themes - shows how the different themes looks
themes = function () {
  var doc = new jsPDF();

  doc.text('Theme "striped"', 14, 16);
  doc.autoTable({ head: headRows(), body: bodyRows(5), startY: 20 });

  doc.text('Theme "grid"', 14, doc.lastAutoTable.finalY + 10);
  doc.autoTable({
    head: headRows(),
    body: bodyRows(5),
    startY: doc.lastAutoTable.finalY + 14,
    theme: "grid",
  });

  doc.text('Theme "plain"', 14, doc.lastAutoTable.finalY + 10);
  doc.autoTable({
    head: headRows(),
    body: bodyRows(5),
    startY: doc.lastAutoTable.finalY + 14,
    theme: "plain",
  });

  return doc;
};

// Nested tables
nested = function () {
  var doc = new jsPDF();
  doc.text("Nested tables", 14, 16);

  var nestedTableHeight = 100;
  var nestedTableCell = {
    content: "",
    // Dynamic height of nested tables are not supported right now
    // so we need to define height of the parent cell
    styles: { minCellHeight: 100 },
  };
  doc.autoTable({
    theme: "grid",
    head: [["2019", "2020"]],
    body: [[nestedTableCell]],
    foot: [["2019", "2020"]],
    startY: 20,
    didDrawCell: function (data) {
      if (data.row.index === 0 && data.row.section === "body") {
        doc.autoTable({
          startY: data.cell.y + 2,
          margin: { left: data.cell.x + 2 },
          tableWidth: data.cell.width - 4,
          styles: {
            maxCellHeight: 4,
          },
          columns: [
            { dataKey: "id", header: "ID" },
            { dataKey: "name", header: "Name" },
            { dataKey: "expenses", header: "Sum" },
          ],
          body: bodyRows(),
        });
      }
    },
  });

  return doc;
};

// Custom style - shows how custom styles can be applied
custom = function () {
  var doc = new jsPDF();
  doc.autoTable({
    head: headRows(),
    body: bodyRows(),
    foot: headRows(),
    margin: { top: 37 },
    tableLineColor: [231, 76, 60],
    tableLineWidth: 1,
    styles: {
      lineColor: [44, 62, 80],
      lineWidth: 1,
    },
    headStyles: {
      fillColor: [241, 196, 15],
      fontSize: 15,
    },
    footStyles: {
      fillColor: [241, 196, 15],
      fontSize: 15,
    },
    bodyStyles: {
      fillColor: [52, 73, 94],
      textColor: 240,
    },
    alternateRowStyles: {
      fillColor: [74, 96, 117],
    },
    // Note that the "email" key below is the same as the column's dataKey used for
    // the head and body rows. If your data is entered in array form instead you have to
    // use the integer index instead i.e. `columnStyles: {5: {fillColor: [41, 128, 185], ...}}`
    columnStyles: {
      email: {
        fontStyle: "bold",
      },
      city: {
        // The font file mitubachi-normal.js is included on the page and was created from mitubachi.ttf
        // with https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
        // refer to https://github.com/MrRio/jsPDF#use-of-utf-8--ttf
        font: "mitubachi",
      },
      id: {
        halign: "right",
      },
    },
    allSectionHooks: true,
    // Use for customizing texts or styles of specific cells after they have been formatted by this plugin.
    // This hook is called just before the column width and other features are computed.
    didParseCell: function (data) {
      if (data.row.index === 5) {
        data.cell.styles.fillColor = [40, 170, 100];
      }

      if (
        (data.row.section === "head" || data.row.section === "foot") &&
        data.column.dataKey === "expenses"
      ) {
        data.cell.text = ""; // Use an icon in didDrawCell instead
      }

      if (data.column.dataKey === "city") {
        data.cell.styles.font = "mitubachi";
        if (data.row.section === "head") {
          data.cell.text = "シティ";
        }
        if (data.row.index === 0 && data.row.section === "body") {
          data.cell.text = "とうきょう";
        }
      }
    },
    // Use for changing styles with jspdf functions or customize the positioning of cells or cell text
    // just before they are drawn to the page.
    willDrawCell: function (data) {
      if (data.row.section === "body" && data.column.dataKey === "expenses") {
        if (data.cell.raw > 750) {
          doc.setTextColor(231, 76, 60); // Red
        }
      }
    },
    // Use for adding content to the cells after they are drawn. This could be images or links.
    // You can also use this to draw other custom jspdf content to cells with doc.text or doc.rect
    // for example.
    didDrawCell: function (data) {
      if (
        (data.row.section === "head" || data.row.section === "foot") &&
        data.column.dataKey === "expenses" &&
        coinBase64Img
      ) {
        doc.addImage(
          coinBase64Img,
          "PNG",
          data.cell.x + 5,
          data.cell.y + 2,
          5,
          5
        );
      }
    },
    // Use this to add content to each page that has the autoTable on it. This can be page headers,
    // page footers and page numbers for example.
    didDrawPage: function (data) {
      doc.setFontSize(18);
      doc.text("Custom styling with hooks", data.settings.margin.left, 22);
      doc.setFontSize(12);
      doc.text(
        "Conditional styling of cells, rows and columns, cell and table borders, custom font, image in cell",
        data.settings.margin.left,
        30
      );
    },
  });
  return doc;
};

// Split columns - shows how the overflowed columns split into pages
horizontalPageBreak = function () {
  var doc = new jsPDF("l");

  var head = headRows();
  head[0].region = "Region";
  head[0].country = "Country";
  head[0].zipcode = "Zipcode";
  head[0].phone = "Phone";
  // head[0].timeZone = 'Timezone';
  head[0]["text"] = "Text";
  var body = bodyRows(4);
  body.forEach(function (row) {
    row["text"] = faker.lorem.sentence(100);
    row["zipcode"] = faker.address.zipCode();
    row["country"] = faker.address.country();
    row["region"] = faker.address.state();
    row["phone"] = faker.phone.phoneNumber();
    // row['timeZone'] = faker.address.timeZone();
  });

  doc.text("Split columns across pages if not fit in a single page", 14, 20);
  doc.autoTable({
    head: head,
    body: body,
    startY: 25,
    // split overflowing columns into pages
    horizontalPageBreak: true,
    // repeat this column in split pages
    // horizontalPageBreakRepeat: 'id',
  });
  return doc;
};

// Split columns - shows how the overflowed columns split into pages with a given column repeated
horizontalPageBreakRepeat = function () {
  var doc = new jsPDF("l");

  var head = headRows();
  head[0].region = "Region";
  head[0].country = "Country";
  head[0].zipcode = "Zipcode";
  head[0].phone = "Phone";
  // head[0].timeZone = 'Timezone';
  head[0]["text"] = "Text";
  var body = bodyRows(4);
  body.forEach(function (row) {
    row["text"] = faker.lorem.sentence(15);
    row["zipcode"] = faker.address.zipCode();
    row["country"] = faker.address.country();
    row["region"] = faker.address.state();
    row["phone"] = faker.phone.phoneNumber();
    // row['timeZone'] = faker.address.timeZone();
  });

  doc.text(
    "Split columns across pages if not fit in a single page with a column repeated.",
    14,
    20
  );
  doc.autoTable({
    head: head,
    body: body,
    startY: 25,
    // split overflowing columns into pages
    horizontalPageBreak: true,
    // repeat this column in split pages
    horizontalPageBreakRepeat: "id",
  });
  return doc;
};

/*
  |--------------------------------------------------------------------------
  | Below is some helper functions for the examples
  |--------------------------------------------------------------------------
  */

function headRows() {
  return [
    { id: "ID", name: "Name", email: "Email", city: "City", expenses: "Sum" },
  ];
}

function footRows() {
  return [
    { id: "ID", name: "Name", email: "Email", city: "City", expenses: "Sum" },
  ];
}

function columns() {
  return [
    { header: "ID", dataKey: "id" },
    { header: "Name", dataKey: "name" },
    { header: "Email", dataKey: "email" },
    { header: "City", dataKey: "city" },
    { header: "Exp", dataKey: "expenses" },
  ];
}

function data(rowCount) {
  rowCount = rowCount || 10;
  var body = [];
  for (var j = 1; j <= rowCount; j++) {
    body.push({
      id: j,
      name: faker.name.findName(),
      email: faker.internet.email(),
      city: faker.address.city(),
      expenses: faker.finance.amount(),
    });
  }
  return body;
}

function bodyRows(rowCount) {
  rowCount = rowCount || 10;
  var body = [];
  for (var j = 1; j <= rowCount; j++) {
    body.push({
      id: j,
      name: faker.name.findName(),
      email: faker.internet.email(),
      city: faker.address.city(),
      expenses: faker.finance.amount(),
    });
  }
  return body;
}
