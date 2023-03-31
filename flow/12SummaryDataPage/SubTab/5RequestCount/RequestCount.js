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

exports.searchRequestData = async (dataIn) => {
  console.log("in searchRequestData");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT DISTINCT reqno,code,Branch
    FROM Routine_RequestLab where requeststatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST') 
    and Month(receivedate) = ${dataIn[0].Month} and Year(receivedate) = ${dataIn[0].Year} `;
    if (dataIn[0].CustomerName != "") {
      query = query + `and custfull = '${dataIn[0].CustomerName}' `;
    }
    if (dataIn[0].InstrumentName != "") {
      query = query + `and instrumentName = '${dataIn[0].InstrumentName}' `;
    }

    var buffData = await mssql.qurey(query);
    //console.log(buffData);
    buffData = buffData.recordset;
    var countData = [
      {
        code: "MKT",
        allCount: 0,
        bPCount: 0,
        rYCount: 0,
        gWCount: 0,
      },
      {
        code: "CHE",
        allCount: 0,
        bPCount: 0,
        rYCount: 0,
        gWCount: 0,
      },
      {
        code: "ENV",
        allCount: 0,
        bPCount: 0,
        rYCount: 0,
        gWCount: 0,
      },
      {
        code: "PHO",
        allCount: 0,
        bPCount: 0,
        rYCount: 0,
        gWCount: 0,
      },
      {
        code: "ISN",
        allCount: 0,
        bPCount: 0,
        rYCount: 0,
        gWCount: 0,
      },
      {
        code: "GAS",
        allCount: 0,
        bPCount: 0,
        rYCount: 0,
        gWCount: 0,
      },
      {
        code: "KAN",
        allCount: 0,
        bPCount: 0,
        rYCount: 0,
        gWCount: 0,
      },
    ];

    //console.log(buffData);
    for (let i = 0; i < buffData.length; i++) {
      for (let j = 0; j < countData.length; j++) {
        if (buffData[i].code.includes(countData[j].code)) {
          if (buffData[i].Branch == "BANGPOO") {
            countData[j].bPCount++;
            countData[j].allCount++;
          }
          else if (buffData[i].Branch == "RAYONG") {
            countData[j].rYCount++;
            countData[j].allCount++;
          }  
          else {
            countData[j].gWCount++;
            countData[j].allCount++;
          }
          break;
        }
      }
    }
    //console.log(countData);
    return countData;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
};

/*
 */
