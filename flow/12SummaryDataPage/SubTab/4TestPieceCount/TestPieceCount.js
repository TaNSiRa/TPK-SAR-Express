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

exports.searchTestPieceData = async (dataIn) => {
  console.log("in searchTestPieceData");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT sampleType,
    count (*) as allCount, 
    sum (case when Branch = 'BANGPOO' then 1 else 0 end) as bPCount ,
    sum (case when Branch = 'RAYONG' then 1 else 0 end) as rYCount 
    FROM Routine_RequestLab where itemstatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST') 
    and samplegroup <> 'CHEMICAL'
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
    GROUP BY sampleType`;
    console.log(query);
    var buffData = await mssql.qurey(query);
    //console.log(query);
    dataOut = buffData.recordset;

    return dataOut;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
};

/*
 */
