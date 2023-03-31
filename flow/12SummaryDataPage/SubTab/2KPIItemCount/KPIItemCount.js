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

exports.searchKPIData = async (dataIn) => {
  console.log("in searchKPIDataNew");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT COALESCE(dataR.instrumentName,'SUM') as instrumentName,
    dataU.branch as branch ,
    count (*) as allCount, 
    sum (case when ((day(dataR.ApproveDate1) <> day(dataR.DueDate1) and dataR.ApproveDate1 > dataR.DueDate1 ) or (day(dataR.ApproveDate2) <> day(dataR.DueDate2) and dataR.ApproveDate2 > dataR.DueDate2 ) or (day(dataR.ApproveDate3) <> day(dataR.DueDate3) and dataR.ApproveDate3 > dataR.DueDate3 ) ) and dataR.ErrorName is null then 1 else 0 end) as overDueCount ,
    sum (case when dataR.code = 'MKT' then 1 else 0 end) as mKTCount ,
    sum (case when ((day(dataR.ApproveDate1) <> day(dataR.DueDate1) and dataR.ApproveDate1 > dataR.DueDate1 ) or (day(dataR.ApproveDate2) <> day(dataR.DueDate2) and dataR.ApproveDate2 > dataR.DueDate2 ) or (day(dataR.ApproveDate3) <> day(dataR.DueDate3) and dataR.ApproveDate3 > dataR.DueDate3 ) ) and dataR.code = 'MKT' and dataR.ErrorName is null  then 1 else 0 end) as mKTOverDueCount ,
    sum (case when dataR.code = 'CHE' then 1 else 0 end) as cHECount ,
    sum (case when ((day(dataR.ApproveDate1) <> day(dataR.DueDate1) and dataR.ApproveDate1 > dataR.DueDate1 ) or (day(dataR.ApproveDate2) <> day(dataR.DueDate2) and dataR.ApproveDate2 > dataR.DueDate2 ) or (day(dataR.ApproveDate3) <> day(dataR.DueDate3) and dataR.ApproveDate3 > dataR.DueDate3 ) )  and dataR.code = 'CHE' and dataR.ErrorName is null  then 1 else 0 end) as cHEOverDueCount ,
    sum (case when dataR.code = 'ENV' then 1 else 0 end) as eNVCount ,
    sum (case when ((day(dataR.ApproveDate1) <> day(dataR.DueDate1) and dataR.ApproveDate1 > dataR.DueDate1 ) or (day(dataR.ApproveDate2) <> day(dataR.DueDate2) and dataR.ApproveDate2 > dataR.DueDate2 ) or (day(dataR.ApproveDate3) <> day(dataR.DueDate3) and dataR.ApproveDate3 > dataR.DueDate3 ) )  and dataR.code = 'ENV' and dataR.ErrorName is null  then 1 else 0 end) as eNVOverDueCount ,
    sum (case when dataR.code = 'PHO' then 1 else 0 end) as pHOCount ,
    sum (case when ((day(dataR.ApproveDate1) <> day(dataR.DueDate1) and dataR.ApproveDate1 > dataR.DueDate1 ) or (day(dataR.ApproveDate2) <> day(dataR.DueDate2) and dataR.ApproveDate2 > dataR.DueDate2 ) or (day(dataR.ApproveDate3) <> day(dataR.DueDate3) and dataR.ApproveDate3 > dataR.DueDate3 ) )  and dataR.code = 'PHO' and dataR.ErrorName is null  then 1 else 0 end) as pHOOverDueCount ,
    sum (case when dataR.code = 'GAS' then 1 else 0 end) as gASCount ,
    sum (case when ((day(dataR.ApproveDate1) <> day(dataR.DueDate1) and dataR.ApproveDate1 > dataR.DueDate1 ) or (day(dataR.ApproveDate2) <> day(dataR.DueDate2) and dataR.ApproveDate2 > dataR.DueDate2 ) or (day(dataR.ApproveDate3) <> day(dataR.DueDate3) and dataR.ApproveDate3 > dataR.DueDate3 ) )  and dataR.code = 'GAS' and dataR.ErrorName is null  then 1 else 0 end) as gASOverDueCount ,
    sum (case when dataR.code = 'ISN' then 1 else 0 end) as iSNCount ,
    sum (case when ((day(dataR.ApproveDate1) <> day(dataR.DueDate1) and dataR.ApproveDate1 > dataR.DueDate1 ) or (day(dataR.ApproveDate2) <> day(dataR.DueDate2) and dataR.ApproveDate2 > dataR.DueDate2 ) or (day(dataR.ApproveDate3) <> day(dataR.DueDate3) and dataR.ApproveDate3 > dataR.DueDate3 ) )  and dataR.code = 'ISN' and dataR.ErrorName is null  then 1 else 0 end) as iSNOverDueCount ,
    sum (case when dataR.code = 'KAN' then 1 else 0 end) as kANCount ,
    sum (case when ((day(dataR.ApproveDate1) <> day(dataR.DueDate1) and dataR.ApproveDate1 > dataR.DueDate1 ) or (day(dataR.ApproveDate2) <> day(dataR.DueDate2) and dataR.ApproveDate2 > dataR.DueDate2 ) or (day(dataR.ApproveDate3) <> day(dataR.DueDate3) and dataR.ApproveDate3 > dataR.DueDate3 ) )  and dataR.code = 'KAN' and dataR.ErrorName is null  then 1 else 0 end) as kANOverDueCount ,
    sum (case when dataR.ErrorName is not null then 1 else 0 end) as instrumentBDCount
    FROM Routine_RequestLab as dataR left join Master_User as dataU on dataR.useranalysis1 = dataU.name
    where dataR.itemstatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST') 
    and Month(dataR.receivedate) = ${dataIn[0].Month} and Year(dataR.receivedate) = ${dataIn[0].Year} `;
    if (dataIn[0].CustomerName != "") {
      query = query + `and dataR.custfull = '${dataIn[0].CustomerName}' `;
    }
    if (dataIn[0].InstrumentName != "") {
      query =
        query + `and dataR.instrumentName = '${dataIn[0].InstrumentName}' `;
    }
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

exports.getDataCreateExcel = async (dataIn) => {
  console.log("in getDataCreateExcel");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT COALESCE(dataR.instrumentName,'SUM') as instrumentName,
    count (*) as allCount,
    sum (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1M_MKT ,
    sum (case when dataR.code = 'CHE' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1M_CHE ,
    sum (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1M_PHO ,
    sum (case when dataR.code = 'KAN' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1M_KAN ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1M_GAS ,
    0  as BP_R1M_SUM ,
    sum (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1S_MKT ,
    sum (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1S_PHO ,
    sum (case when dataR.code = 'ISN' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1S_ISN ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1S_GAS ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'GATEWAY' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1S_GGW ,
    sum (case when dataR.code = 'ENV' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R1S_ENV ,
    0 as BP_R1S_SUM,
    0 as BP_R1_SUM,
    sum (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2M_MKT ,
    sum (case when dataR.code = 'CHE' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2M_CHE ,
    sum (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2M_PHO ,
    sum (case when dataR.code = 'KAN' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2M_KAN ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2M_GAS ,
    0  as BP_R2M_SUM ,
    sum (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2S_MKT ,
    sum (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2S_PHO ,
    sum (case when dataR.code = 'ISN' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2S_ISN ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2S_GAS ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'GATEWAY' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2S_GGW ,
    sum (case when dataR.code = 'ENV' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as BP_R2S_ENV ,
    0 as BP_R2S_SUM,
    0 as BP_R2_SUM,
    sum ((case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36M_MKT ,
    sum ((case when dataR.code = 'CHE' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'CHE' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'CHE' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'CHE' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36M_CHE ,
    sum ((case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36M_PHO ,
    sum ((case when dataR.code = 'KAN' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'KAN' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'KAN' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'KAN' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36M_KAN ,
    sum ((case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36M_GAS ,
    0  as BP_R36M_SUM ,
    sum ((case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36S_MKT ,
    sum ((case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36S_PHO ,
    sum ((case when dataR.code = 'ISN' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ISN' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ISN' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ISN' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36S_ISN ,
    sum ((case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36S_GAS ,
    sum ((case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'GATEWAY' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'GATEWAY' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'GATEWAY' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'BANGPOO' and dataR.branch = 'GATEWAY' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36S_GGW ,
    sum ((case when dataR.code = 'ENV' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ENV' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ENV' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ENV' and dataU.branch = 'BANGPOO' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as BP_R36S_ENV ,
    0 as BP_R36S_SUM,
    0 as BP_R36_SUM,
    0 as BP_R26_SUM,
    0 as BP_ALL_SUM,

    sum (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1S_MKT ,
    sum (case when dataR.code = 'CHE' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1S_CHE ,
    sum (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1S_PHO ,
    sum (case when dataR.code = 'KAN' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1S_KAN ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1S_GAS ,
    0  as RY_R1S_SUM ,
    sum (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1M_MKT ,
    sum (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1M_PHO ,
    sum (case when dataR.code = 'ISN' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1M_ISN ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1M_GAS ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'GATEWAY' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1M_GGW ,
    sum (case when dataR.code = 'ENV' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result1 <> '' and dataR.result1 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R1M_ENV ,
    0 as RY_R1M_SUM,
    0 as RY_R1_SUM,
    sum (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2S_MKT ,
    sum (case when dataR.code = 'CHE' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2S_CHE ,
    sum (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2S_PHO ,
    sum (case when dataR.code = 'KAN' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2S_KAN ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2S_GAS ,
    0  as RY_R2S_SUM ,
    sum (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2M_MKT ,
    sum (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2M_PHO ,
    sum (case when dataR.code = 'ISN' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2M_ISN ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2M_GAS ,
    sum (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'GATEWAY' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2M_GGW ,
    sum (case when dataR.code = 'ENV' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result2 <> '' and dataR.result2 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end) as RY_R2M_ENV ,
    0 as RY_R2M_SUM,
    0 as RY_R2_SUM,
    sum ((case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36S_MKT ,
    sum ((case when dataR.code = 'CHE' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'CHE' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'CHE' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'CHE' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36S_CHE ,
    sum ((case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36S_PHO ,
    sum ((case when dataR.code = 'KAN' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'KAN' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'KAN' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'KAN' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36S_KAN ,
    sum ((case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'BANGPOO' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36S_GAS ,
    0  as RY_R36S_SUM ,
    sum ((case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'MKT' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36M_MKT ,
    sum ((case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'PHO' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36M_PHO ,
    sum ((case when dataR.code = 'ISN' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ISN' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ISN' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ISN' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36M_ISN ,
    sum ((case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36M_GAS ,
    sum ((case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'GATEWAY' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'GATEWAY' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'GATEWAY' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'GAS' and dataU.branch = 'RAYONG' and dataR.branch = 'GATEWAY' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36M_GGW ,
    sum ((case when dataR.code = 'ENV' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result3 <> '' and dataR.result3 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ENV' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result4 <> '' and dataR.result4 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ENV' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result5 <> '' and dataR.result5 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)+
    (case when dataR.code = 'ENV' and dataU.branch = 'RAYONG' and dataR.branch = 'RAYONG' and dataR.result6 <> '' and dataR.result6 not in ('SAMPLE ERROR','ANALYSIS ERROR','CAN NOT ANALYSIS','INSTRUMENT BREAKDOWN','DELIVERY ERROR')  then 1 else 0 end)) as RY_R36M_ENV ,
    0 as RY_R36M_SUM,
    0 as RY_R36_SUM,
    0 as RY_R26_SUM,
    0 as RY_ALL_SUM,
    0 as ALL_SUM
    
    FROM Routine_RequestLab as dataR left join Master_User as dataU on dataR.useranalysis1 = dataU.name
    where dataR.itemstatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST')
    and Month(dataR.receivedate) = ${dataIn[0].Month} and Year(dataR.receivedate) = ${dataIn[0].Year} `;
    if (dataIn[0].CustomerName != "") {
      query = query + `and dataR.custfull = '${dataIn[0].CustomerName}' `;
    }
    if (dataIn[0].InstrumentName != "") {
      query =
        query + `and dataR.instrumentName = '${dataIn[0].InstrumentName}' `;
    }
    query =
      query + ` GROUP BY dataR.instrumentName WITH ROLLUP order by dataR.instrumentName`;
    //console.log(query);
    var buffData = await mssql.qurey(query);
    dataOut = buffData.recordset;
    console.log(dataOut);
    return dataOut;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
};

/* exports.searchKPIData = async (dataIn) => {
  console.log("in searchKPIDataNew");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT COALESCE(dataR.instrumentName,'SUM') as instrumentName,
    COALESCE(dataU.branch,'SUM') as branch ,
    count (*) as allCount, 
    sum (case when (dataR.ApproveDate1 > dataR.DueDate1 or dataR.ApproveDate2 > dataR.DueDate2 or dataR.ApproveDate3 > dataR.DueDate3) and dataR.ErrorName is null then 1 else 0 end) as overDueCount ,
    sum (case when dataR.requestsection = 'MKT' then 1 else 0 end) as mKTCount ,
    sum (case when (dataR.ApproveDate1 > dataR.DueDate1 or dataR.ApproveDate2 > dataR.DueDate2 or dataR.ApproveDate3 > dataR.DueDate3) and dataR.requestsection = 'MKT' and dataR.ErrorName is null  then 1 else 0 end) as mKTOverDueCount ,
    sum (case when dataR.requestsection = 'CHE' then 1 else 0 end) as cHECount ,
    sum (case when (dataR.ApproveDate1 > dataR.DueDate1 or dataR.ApproveDate2 > dataR.DueDate2 or dataR.ApproveDate3 > dataR.DueDate3) and dataR.requestsection = 'CHE' and dataR.ErrorName is null  then 1 else 0 end) as cHEOverDueCount ,
    sum (case when dataR.requestsection = 'ENV' then 1 else 0 end) as eNVCount ,
    sum (case when (dataR.ApproveDate1 > dataR.DueDate1 or dataR.ApproveDate2 > dataR.DueDate2 or dataR.ApproveDate3 > dataR.DueDate3) and dataR.requestsection = 'ENV' and dataR.ErrorName is null  then 1 else 0 end) as eNVOverDueCount ,
    sum (case when dataR.requestsection = 'PHO' then 1 else 0 end) as pHOCount ,
    sum (case when (dataR.ApproveDate1 > dataR.DueDate1 or dataR.ApproveDate2 > dataR.DueDate2 or dataR.ApproveDate3 > dataR.DueDate3) and dataR.requestsection = 'PHO' and dataR.ErrorName is null  then 1 else 0 end) as pHOOverDueCount ,
    sum (case when dataR.requestsection = 'GAS' then 1 else 0 end) as gASCount ,
    sum (case when (dataR.ApproveDate1 > dataR.DueDate1 or dataR.ApproveDate2 > dataR.DueDate2 or dataR.ApproveDate3 > dataR.DueDate3) and dataR.requestsection = 'GAS' and dataR.ErrorName is null  then 1 else 0 end) as gASOverDueCount ,
    sum (case when dataR.requestsection = 'ISN' then 1 else 0 end) as iSNCount ,
    sum (case when (dataR.ApproveDate1 > dataR.DueDate1 or dataR.ApproveDate2 > dataR.DueDate2 or dataR.ApproveDate3 > dataR.DueDate3) and dataR.requestsection = 'ISN' and dataR.ErrorName is null  then 1 else 0 end) as iSNOverDueCount ,
    sum (case when dataR.requestsection = 'KAN' then 1 else 0 end) as kANCount ,
    sum (case when (dataR.ApproveDate1 > dataR.DueDate1 or dataR.ApproveDate2 > dataR.DueDate2 or dataR.ApproveDate3 > dataR.DueDate3) and dataR.requestsection = 'KAN' and dataR.ErrorName is null  then 1 else 0 end) as kANOverDueCount ,
    sum (case when dataR.ErrorName is not null then 1 else 0 end) as instrumentBDCount
    FROM Routine_RequestLab as dataR left join Master_User as dataU on dataR.useranalysis1 = dataU.name
    where dataR.itemstatus not in ('NOT SEND SAMPLE','COMPLETE NO LAB','CANCEL REQUEST') 
    and Month(dataR.receivedate) = ${dataIn[0].Month} and Year(dataR.receivedate) = ${dataIn[0].Year} `;
    if (dataIn[0].CustomerName != "") {
      query = query + `and dataR.custfull = '${dataIn[0].CustomerName}' `;
    }
    if (dataIn[0].InstrumentName != "") {
      query =
        query + `and dataR.instrumentName = '${dataIn[0].InstrumentName}' `;
    }

    query =
      query +
      `
    GROUP BY dataR.instrumentName,dataU.Branch with rollup`;
    console.log(query);
    var buffData = await mssql.qurey(query);
    //console.log(query);
    dataOut = buffData.recordset;

    return dataOut;
  } catch (error) {
    console.log(error);
    return "ERROR";
  }
}; */

exports.searchKPIDataBackup = async (dataIn) => {
  console.log("in searchKPIData1");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT instrumentName,
    count (*) as allCount, 
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and ErrorName is null then 1 else 0 end) as overDueCount ,
    sum (case when Branch = 'BANGPOO' then 1 else 0 end) as bPCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and Branch = 'BANGPOO' and ErrorName is null  then 1 else 0 end) as bPOverDueCount ,
    sum (case when Branch = 'RAYONG' then 1 else 0 end) as rYCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and Branch = 'RAYONG' and ErrorName is null then 1 else 0 end) as rYOverDueCount ,
    sum (case when ErrorName is not null then 1 else 0 end) as instrumentBDCount
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

exports.searchKPIDatabackup2 = async (dataIn) => {
  console.log("in searchKPIData2");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT instrumentName,
    count (*) as allCount, 
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and ErrorName is null then 1 else 0 end) as overDueCount ,
    sum (case when requestsection = 'MKT' and Branch = 'BANGPOO' then 1 else 0 end) as bPCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'MKT' and Branch = 'BANGPOO' and ErrorName is null  then 1 else 0 end) as bPOverDueCount ,
    sum (case when requestsection = 'MKT' and  Branch = 'RAYONG' then 1 else 0 end) as rYCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'MKT' and Branch = 'RAYONG' and ErrorName is null then 1 else 0 end) as rYOverDueCount ,
    sum (case when requestsection = 'CHE' then 1 else 0 end) as cHECount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'CHE' and ErrorName is null then 1 else 0 end) as cHEOverDueCount ,
    sum (case when requestsection = 'ENV' then 1 else 0 end) as eNVCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'ENV' and ErrorName is null then 1 else 0 end) as eNVOverDueCount ,
    sum (case when requestsection = 'PHO' then 1 else 0 end) as pHOCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'PHO' and ErrorName is null then 1 else 0 end) as pHOOverDueCount ,
    sum (case when ErrorName is not null then 1 else 0 end) as instrumentBDCount
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
/* 
exports.searchKPIData = async (dataIn) => {
  console.log("in searchKPIData");
  try {
    dataIn = JSON.parse(dataIn.SearchOption);
    //console.log(dataIn);
    var query = `SELECT instrumentName,
    count (*) as allCount, 
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and ErrorName is null then 1 else 0 end) as overDueCount ,
    sum (case when requestsection = 'MKT' and Branch = 'BANGPOO' then 1 else 0 end) as bPCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'MKT' and Branch = 'BANGPOO' and ErrorName is null  then 1 else 0 end) as bPOverDueCount ,
    sum (case when requestsection = 'MKT' and  Branch = 'RAYONG' then 1 else 0 end) as rYCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'MKT' and Branch = 'RAYONG' and ErrorName is null then 1 else 0 end) as rYOverDueCount ,
    sum (case when requestsection = 'CHE' then 1 else 0 end) as cHECount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'CHE' and ErrorName is null then 1 else 0 end) as cHEOverDueCount ,
    sum (case when requestsection = 'ENV' then 1 else 0 end) as eNVCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'ENV' and ErrorName is null then 1 else 0 end) as eNVOverDueCount ,
    sum (case when requestsection = 'PHO' then 1 else 0 end) as pHOCount ,
    sum (case when (ApproveDate1 > DueDate1 or ApproveDate2 > DueDate2 or ApproveDate3 > DueDate3) and requestsection = 'PHO' and ErrorName is null then 1 else 0 end) as pHOOverDueCount ,
    sum (case when ErrorName is not null then 1 else 0 end) as instrumentBDCount
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
 */
