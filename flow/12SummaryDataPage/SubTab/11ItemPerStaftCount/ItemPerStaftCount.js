const express = require("express");
const router = express.Router();
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");

exports.searchMasterOption = async () => {
  console.log("in searchMasterOption");
  try {
    //mastercustomer data
    var buffData = await mssql.qurey(
      "select DISTINCT CustFull,CustShort,CustFull+'|'+CustShort as CustSearch from [Routine_MasterPatternLab];"
    );
    dataOut = buffData.recordset;
    var masterCustomer = dataOut;

    //master instrument data
    buffData = await mssql.qurey(
      "select DISTINCT Instrumentname as InstrumentName from Master_Instrument;"
    );
    dataOut = buffData.recordset;
    var masterInstrument = dataOut;

    return [masterCustomer, masterInstrument];
    //return dataOut;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
};

exports.searchItemPerStaftData = async (dataIn) => {
  console.log("in searchItemPerStaftData");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `select UserAnalysis1 as name,instrumentName,
    count (*) as allCount
    FROM Routine_RequestLab where itemstatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST') 
    and Month(receivedate) = ${dataIn[0].Month} and Year(receivedate) = ${dataIn[0].Year} `;
    if (dataIn[0].CustomerName != "") {
      query = query + `and custfull = '${dataIn[0].CustomerName}' `;
    }
    if (dataIn[0].InstrumentName != "") {
      query = query + `and instrumentName = '${dataIn[0].InstrumentName}' `;
    }

    query =
      query +
      `
      GROUP BY instrumentname,UserAnalysis1 order by name  `;
    //console.log(query);
    var buffData = await mssql.qurey(query);

    dataOut = buffData.recordset;
    //console.log(dataOut);
    return dataOut;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
};

/*
 */
