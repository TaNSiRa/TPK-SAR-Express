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

exports.searchItemRecheckDataBackup = async (dataIn) => {
  console.log("in searchItemRecheckData");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT instrumentName,
    count (*) as allCount, 
    sum (case when Branch = 'BANGPOO' then 1 else 0 end) as bPCount ,
    sum (case when Branch = 'RAYONG' then 1 else 0 end) as rYCount
    FROM Routine_RequestLab where itemstatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST') 
    and ((Result3 is not null) or (Result5 is not null))
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
    GROUP BY InstrumentName WITH ROLLUP  `;
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

function quryText(branch) {
  return `case when dataR.result2 != '' and dataR.code = '${branch}' then 1 else 0 end + 
  case when dataR.result3 != '' and dataR.code = '${branch}' then 1 else 0 end +
  case when dataR.result4 != '' and dataR.code = '${branch}' then 1 else 0 end +
  case when dataR.result5 != '' and dataR.code = '${branch}' then 1 else 0 end +
  case when dataR.result6 != '' and dataR.code = '${branch}' then 1 else 0 end`;
}

exports.searchItemRecheckData = async (dataIn) => {
  console.log("in searchItemRecheckData");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var buffQuery1 = `case when dataR.result2 != '' then 1 else 0 end + 
    case when dataR.result3 != '' then 1 else 0 end +
    case when dataR.result4 != '' then 1 else 0 end +
    case when dataR.result5 != '' then 1 else 0 end +
    case when dataR.result6 != '' then 1 else 0 end`;

    var query = `SELECT COALESCE(dataR.instrumentName,'SUM') as instrumentName,
    COALESCE(dataU.branch,'SUM') as branch ,
    sum (${buffQuery1}) as allCount, 
    sum (${quryText("MKT")}) as mKTCount ,
    sum (${quryText("CHE")}) as cHECount ,
    sum (${quryText("ENV")}) as eNVCount ,
    sum (${quryText("PHO")}) as pHOCount ,
    sum (${quryText("GAS")}) as gASCount ,
    sum (${quryText("ISN")}) as iSNCount ,
    sum (${quryText("KAN")}) as kANCount 
    FROM Routine_RequestLab as dataR left join Master_User as dataU on dataR.useranalysis1 = dataU.name
    where dataR.itemstatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST') and
    (dataR.result2 != '' or dataR.result3 != '' or dataR.result4 != '' or dataR.result5 != '' or dataR.result6 != '')
    and Month(dataR.receivedate) = ${
      dataIn[0].Month
    } and Year(dataR.receivedate) = ${dataIn[0].Year} `;
    if (dataIn[0].CustomerName != "") {
      query = query + `and dataR.custfull = '${dataIn[0].CustomerName}' `;
    }
    if (dataIn[0].InstrumentName != "") {
      query =
        query + `and dataR.instrumentName = '${dataIn[0].InstrumentName}' `;
    }

    /* query =
      query +
      `
    GROUP BY dataR.instrumentName,dataU.Branch with rollup`; */
    query =
      query +
      `
    GROUP BY dataR.instrumentName,dataU.Branch order by dataR.instrumentName`;
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
