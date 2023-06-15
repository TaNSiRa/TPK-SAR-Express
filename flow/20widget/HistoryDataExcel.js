const ExcelJS = require("exceljs");
const mssql = require("../../function/mssql.js");
const express = require("express");
const router = express.Router();

router.post("/Widget_HistoryDataExcel", async (req, res) => {
  console.log("in Widget_HistoryDataExcel");
  try {
    // Assuming you have fetched the SQL data and stored it in a variable named 'data'
    var query = ` 
        select * from [Routine_RequestLab] where custfull  = 'Phosphate Rayong-Work piece-Line 4-Emerson Thailand Co.,Ltd' \
        order by samplingdate desc,sampleno,itemno;`;
    var data = await mssql.qurey(query);
    console.log(data.recordset);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.addRows(data.recordset);
    const buffer = await workbook.xlsx.writeBuffer();
    console.log(buffer);
    res.send(buffer);
    /* 
    var query = ` 
        select * from [Routine_RequestLab] where custfull  = 'Phosphate Rayong-Work piece-Line 4-Emerson Thailand Co.,Ltd' \
        order by samplingdate desc,sampleno,itemno;`;
    var data = await mssql.qurey(query);
    console.log(data.recordset);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.addRows(data.recordset);
    const buffer = await workbook.xlsx.writeBuffer; */
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
