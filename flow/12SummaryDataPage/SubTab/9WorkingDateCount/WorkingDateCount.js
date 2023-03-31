const express = require("express");
const router = express.Router();
const mssql = require("../../../../function/mssql.js");
const dtget = require("../../../../function/dateTime.js");
const fs = require("fs");

exports.searchMasterOption = async () => {
  console.log("in searchMasterOption");
  try {
    //mastercustomer data
    var dataWorkingDate = await mssql.qurey(
      "select DISTINCT CustFull,CustShort,CustFull+'|'+CustShort as CustSearch from [Routine_MasterPatternLab];"
    );
    dataOut = dataWorkingDate.recordset;
    var masterCustomer = dataOut;

    //master instrument data
    dataWorkingDate = await mssql.qurey(
      "select DISTINCT Instrumentname as InstrumentName from Master_Instrument;"
    );
    dataOut = dataWorkingDate.recordset;
    var masterInstrument = dataOut;

    return [masterCustomer, masterInstrument];
    //return dataOut;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
};

exports.searchWorkingDateCountData = async (dataIn) => {
  console.log("in searchWorkingDateCountData");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    var query = `SELECT id,instrumentName,receiveDate,resultApproveDate,branch,code
    FROM Routine_RequestLab where requeststatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST')  
    and ResultApproveDate is not null
    and Month(receivedate) = ${dataIn[0].Month} and Year(receivedate) = ${dataIn[0].Year} `;
    if (dataIn[0].CustomerName != "") {
      query = query + `and custfull = '${dataIn[0].CustomerName}' `;
    }
    if (dataIn[0].InstrumentName != "") {
      query = query + `and instrumentName = '${dataIn[0].InstrumentName}' `;
    }
    query = query + "order by code,branch;";
    var dataWorkingDate = await mssql.qurey(query);
    dataWorkingDate = dataWorkingDate.recordset;
    //console.log(dataWorkingDate);

    //search Holiday date

    var monthStart = dataIn[0].Month;
    var monthEnd = 0;
    var yearStart = dataIn[0].Year;
    var yearEnd = dataIn[0].Year;
    if (monthStart != 12) {
      monthEnd = monthStart + 1;
    } else {
      monthEnd = 1;
      yearEnd = yearStart + 1;
    }

    query = `select * from master_holiday where (Month(HolidayDate) = '${monthStart}' or  Month(HolidayDate) = '${monthEnd}') 
    and (Year(HolidayDate) = '${yearStart}' or Year(HolidayDate) = '${yearEnd}')
    order by HolidayDate asc`;
    var HolidayDate = await mssql.qurey(query);
    HolidayDate = HolidayDate.recordset;
    //console.log(HolidayDate);

    var countData = [
      {
        code: "MKT",
        daysDataBP: [],
        daysDataRY: [],
        daysDataGW: [],
        meanDaysBP: 0,
        meanDaysRY: 0,
        meanDaysGW: 0,
      },
      {
        code: "CHE",
        daysDataBP: [],
        daysDataRY: [],
        daysDataGW: [],
        meanDaysBP: 0,
        meanDaysRY: 0,
        meanDaysGW: 0,
      },
      {
        code: "ENV",
        daysDataBP: [],
        daysDataRY: [],
        daysDataGW: [],
        meanDaysBP: 0,
        meanDaysRY: 0,
        meanDaysGW: 0,
      },
      {
        code: "PHO",
        daysDataBP: [],
        daysDataRY: [],
        daysDataGW: [],
        meanDaysBP: 0,
        meanDaysRY: 0,
        meanDaysGW: 0,
      },
      {
        code: "ISN",
        daysDataBP: [],
        daysDataRY: [],
        daysDataGW: [],
        meanDaysBP: 0,
        meanDaysRY: 0,
        meanDaysGW: 0,
      },
      {
        code: "GAS",
        daysDataBP: [],
        daysDataRY: [],
        daysDataGW: [],
        meanDaysBP: 0,
        meanDaysRY: 0,
        meanDaysGW: 0,
      },
      {
        code: "KAN",
        daysDataBP: [],
        daysDataRY: [],
        daysDataGW: [],
        meanDaysBP: 0,
        meanDaysRY: 0,
        meanDaysGW: 0,
      },
      {
        code: "SUM",
        daysDataBP: [],
        daysDataRY: [],
        daysDataGW: [],
        meanDaysBP: 0,
        meanDaysRY: 0,
        meanDaysGW: 0,
      },
    ];

    for (let i = 0; i < dataWorkingDate.length; i++) {
      var diffDaysBuff = Math.abs(
        dataWorkingDate[i].resultApproveDate - dataWorkingDate[i].receiveDate
      );
      var diffDays = Math.ceil(diffDaysBuff / (1000 * 60 * 60 * 24));
      //console.log("dif 1" + diffDays);
      for (let j = 0; j < HolidayDate.length; j++) {
        if (
          HolidayDate[j].HolidayDate >= dataWorkingDate[i].receiveDate &&
          HolidayDate[j].HolidayDate <= dataWorkingDate[i].resultApproveDate
        ) {
          //console.log("--In Holiday--");
          diffDays--;
        }
      }
      //console.log("dif out" + diffDays);
      for (let k = 0; k < countData.length; k++) {
        if (dataWorkingDate[i].code == countData[k].code) {
          //console.log(diffDays);
          if (dataWorkingDate[i].branch == "BANGPOO") {
            countData[k].daysDataBP.push(diffDays);
          } else if (dataWorkingDate[i].branch == "RAYONG") {
            countData[k].daysDataRY.push(diffDays);
          } else {
            console.log("aaaaaa" + dataWorkingDate[i].id);
            countData[k].daysDataGW.push(diffDays);
          }

          break;
        }
      }
    }
    // finding mean value
    //console.log(countData);
    var buffSumAllBP = 0;
    var buffSumAllCountBP = 0;
    var buffSumAllRY = 0;
    var buffSumAllCountRY = 0;
    var buffSumAllGW = 0;
    var buffSumAllCountGW = 0;

    for (let i = 0; i < countData.length; i++) {
      ///console.log("countData");
      var buffSumBP = 0;
      var buffSumRY = 0;
      var buffSumGW = 0;
      for (let j = 0; j < countData[i].daysDataBP.length; j++) {
        //BP
        buffSumBP += countData[i].daysDataBP[j];
        //All data
        buffSumAllBP += countData[i].daysDataBP[j];
        buffSumAllCountBP++;
      }
      for (let j = 0; j < countData[i].daysDataRY.length; j++) {
        {
          //RY
          buffSumRY += countData[i].daysDataRY[j];
          //All data
          buffSumAllRY += countData[i].daysDataRY[j];
          buffSumAllCountRY++;
        }
      }
      for (let j = 0; j < countData[i].daysDataGW.length; j++) {
        {
          //RY
          buffSumGW += countData[i].daysDataGW[j];
          //All data
          buffSumAllGW += countData[i].daysDataGW[j];
          buffSumAllCountGW++;
        }
      }

      if (countData[i].daysDataBP.length > 0) {
        countData[i].meanDaysBP = (
          buffSumBP / countData[i].daysDataBP.length
        ).toFixed(2);
      }
      if (countData[i].daysDataRY.length > 0) {
        countData[i].meanDaysRY = (
          buffSumRY / countData[i].daysDataRY.length
        ).toFixed(2);
      }
      if (countData[i].daysDataGW.length > 0) {
        countData[i].meanDaysGW = (
          buffSumGW / countData[i].daysDataGW.length
        ).toFixed(2);
      }
    }
    countData[7].meanDaysBP = (buffSumAllBP / buffSumAllCountBP).toFixed(2);
    countData[7].meanDaysRY = (buffSumAllRY / buffSumAllCountRY).toFixed(2);
    countData[7].meanDaysGW = (buffSumAllGW / buffSumAllCountGW).toFixed(2);

    return countData;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
};

/* exports.searchWorkingDateCountData = async (dataIn) => {
  console.log("in searchWorkingDateCountData");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    var query = `SELECT instrumentName,receiveDate,resultApproveDate,branch,code
    FROM Routine_RequestLab where requeststatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST')  
    and ResultApproveDate is not null
    and Month(receivedate) = ${dataIn[0].Month} and Year(receivedate) = ${dataIn[0].Year} `;
    if (dataIn[0].CustomerName != "") {
      query = query + `and custfull = '${dataIn[0].CustomerName}' `;
    }
    if (dataIn[0].InstrumentName != "") {
      query = query + `and instrumentName = '${dataIn[0].InstrumentName}' `;
    }
    query = query + "order by code,branch;";
    var dataWorkingDate = await mssql.qurey(query);
    dataWorkingDate = dataWorkingDate.recordset;
    //console.log(dataWorkingDate);

    //search Holiday date

    var monthStart = dataIn[0].Month;
    var monthEnd = 0;
    var yearStart = dataIn[0].Year;
    var yearEnd = dataIn[0].Year;
    if (monthStart != 12) {
      monthEnd = monthStart + 1;
    } else {
      monthEnd = 1;
      yearEnd = yearStart + 1;
    }

    query = `select * from master_holiday where (Month(HolidayDate) = '${monthStart}' or  Month(HolidayDate) = '${monthEnd}') 
    and (Year(HolidayDate) = '${yearStart}' or Year(HolidayDate) = '${yearEnd}')
    order by HolidayDate asc`;
    var HolidayDate = await mssql.qurey(query);
    HolidayDate = HolidayDate.recordset;
    //console.log(HolidayDate);

    var countData = [
      {
        code: "MKT",
        daysData: [],
        meanDays: 0,
      },
      {
        code: "CHE",
        daysData: [],
        meanDays: 0,
      },
      {
        code: "ENV",
        daysData: [],
        meanDays: 0,
      },
      {
        code: "PHO",
        daysData: [],
        meanDays: 0,
      },
      {
        code: "SOI8",
        daysData: [],
        meanDays: 0,
      },
      {
        code: "SUM",
        daysData: [],
        meanDays: 0,
      },
    ];

    for (let i = 0; i < dataWorkingDate.length; i++) {
      var diffDaysBuff = Math.abs(
        dataWorkingDate[i].resultApproveDate - dataWorkingDate[i].receiveDate
      );
      var diffDays = Math.ceil(diffDaysBuff / (1000 * 60 * 60 * 24));
      console.log("dif 1" + diffDays);
      for (let j = 0; j < HolidayDate.length; j++) {
        if (
          HolidayDate[j].HolidayDate >= dataWorkingDate[i].receiveDate &&
          HolidayDate[j].HolidayDate <= dataWorkingDate[i].resultApproveDate
        ) {
          //console.log("--In Holiday--");
          diffDays--;
        }
      }
      //console.log("dif out" + diffDays);
      for (let k = 0; k < countData.length; k++) {
        if (dataWorkingDate[i].code == countData[k].code) {
          console.log(diffDays);
          countData[k].daysData.push(diffDays);
          break;
        }
      }
    }
    // finding mean value
    console.log(countData);
    var buffSumAll = 0;
    var buffSumAllCount = 0;
    for (let i = 0; i < countData.length; i++) {
      console.log("countData");
      var buffSum = 0;

      for (let j = 0; j < countData[i].daysData.length; j++) {
        buffSum += countData[i].daysData[j];
        //All data
        buffSumAll += countData[i].daysData[j];
        buffSumAllCount++;
      }
      if (countData[i].daysData.length > 0) {
        countData[i].meanDays = (buffSum / countData[i].daysData.length).toFixed(2);
      }
    }
    countData[5].meanDays  = (buffSumAll / buffSumAllCount).toFixed(2);
    console.log(countData);

    return countData;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
}; */

/*
 */
