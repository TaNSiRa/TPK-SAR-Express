const { jsPDF } = require("jspdf"); // will automatically load the node version
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const dtConv = require("../../../../../function/dateTime");
const sql = require('mssql');

// Configuration for SQL Server
const config = {
  user: 'sa',
  password: 'Automatic',
  database: 'SAR',
  server: '172.23.10.51',
  options: {
    encrypt: false, // Use this if you're connecting to a local SQL Server
    enableArithAbort: true
  }
};

exports.addPage = async (doc) => {
  try {
    doc.addPage();
    return 10; // CurrentY
  } catch (err) {
    console.log(err);
    return err;
  }
};

let reqNo = null;

exports.setReqNo = (newReqNo) => {
  reqNo = newReqNo;
  console.log("ReqNo has been set to:", reqNo);
};

exports.MasterWeeklyDocument = async (doc) => {
  try {
    if (!reqNo) {
      console.log("Error: reqNo is null or undefined.");
      return null;
    }

    console.log("MasterWeeklyDocument");
    console.log("reqNo: " + reqNo);

    let pool = await sql.connect(config);

    let result = await pool.request()
      .input('reqNo', sql.VarChar, reqNo)
      .query(`SELECT CreateReportDate FROM Routine_KACReport WHERE ReqNo = @reqNo`);

    let createReportDate;

    if (result.recordset.length > 0) {
      createReportDate = result.recordset[0].CreateReportDate;
    } else {
      console.log("No records found for ReqNo:", reqNo);
      createReportDate = new Date('2024-06-24'); // ใช้ค่า FR-CTS-02/004-03-24/06/24 ถ้าไม่พบ ReqNo
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 0; i < pageCount; i++) {
      doc.setPage(i);
      var pageWidth = doc.internal.pageSize.width;
      doc.setFont("THSarabun", "normal");
      doc.setFontSize(12);

      // เปรียบเทียบ CreateReportDate กับวันที่ 24 Jun 2024
      if (new Date(createReportDate) < new Date('2024-06-24')) {
        console.log(createReportDate);
        doc.text("FR-CTS-02-004-02-09/01/14", pageWidth - 50, 10); // ถ้าเก่ากว่า 24 Jun 2024
      } else {
        console.log(createReportDate);
        doc.text("FR-CTS-02/004-03-24/06/24", pageWidth - 50, 10); // ถ้าใหม่กว่าหรือเท่ากับ 24 Jun 2024
      }
    }

    await sql.close();
    return doc;
  } catch (err) {
    console.log(err);
    await sql.close();
    return err;
  }
};

exports.MasterWeeklyDocument1 = async (doc) => {
  try {
    if (!reqNo) {
      console.log("Error: reqNo is null or undefined.");
      return null;
    }

    console.log("MasterWeeklyDocument1");
    console.log("reqNo: " + reqNo);

    let pool = await sql.connect(config);

    let result = await pool.request()
      .input('reqNo', sql.VarChar, reqNo)
      .query(`SELECT CreateReportDate FROM Routine_KACReport WHERE ReqNo = @reqNo`);

    let createReportDate;

    if (result.recordset.length > 0) {
      createReportDate = result.recordset[0].CreateReportDate;
    } else {
      console.log("No records found for ReqNo:", reqNo);
      createReportDate = new Date('2024-06-24'); // ใช้ค่า FR-CTS-02/004-03-24/06/24 ถ้าไม่พบ ReqNo
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 0; i < pageCount; i++) {
      doc.setPage(i);
      var pageWidth = doc.internal.pageSize.width;
      doc.setFont("THSarabun", "normal");
      doc.setFontSize(12);

      // เปรียบเทียบ CreateReportDate กับวันที่ 24 Jun 2024
      if (new Date(createReportDate) < new Date('2024-06-24')) {
        console.log(createReportDate);
        doc.text("FR-CTS-02/008-00-10/02/22", pageWidth - 50, 10); // ถ้าเก่ากว่า 24 Jun 2024
      } else {
        console.log(createReportDate);
        doc.text("FR-CTS-02/009-00-24/06/24", pageWidth - 50, 10); // ถ้าใหม่กว่าหรือเท่ากับ 24 Jun 2024
      }
    }

    await sql.close();
    return doc;
  } catch (err) {
    console.log(err);
    await sql.close();
    return err;
  }
};
