const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");

exports.addPage = async (doc) => {
  try {
    doc.addPage();
    return 10; // CurrentY
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.MasterWeeklyDocument = async (doc) => {
  try {
    console.log("MasterDocument");
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 0; i < pageCount; i++) {
      doc.setPage(i);
      var pageWidth = doc.internal.pageSize.width;
      doc.setFont("THSarabun", "normal");
      doc.setFontSize(12);
      doc.text("FR-CTS-02/004-02-09/01/14", pageWidth - 50, 10);
    }
    return doc;
  } catch (err) {
    console.log(err);
    return err;
  }
};