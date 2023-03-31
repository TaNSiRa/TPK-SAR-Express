const express = require("express");
const router = express.Router();
const mssql = require("../../function/mssql.js");
const dtget = require("../../function/dateTime.js");
const ItemAnalysisDue = require("./SubTab/1ItemAnalysisDue/ItemAnalysisDue.js");
const KPIItemCount = require("./SubTab/2KPIItemCount/KPIItemCount.js");
const SampleSolutionCount = require("./SubTab/3SampleSolutionCount/SampleSolutionCount.js");
const TestPieceCount = require("./SubTab/4TestPieceCount/TestPieceCount.js");
const RequestCount = require("./SubTab/5RequestCount/RequestCount.js");
const ItemRecheckCount = require("./SubTab/6ItemRecheckCount/ItemRecheckCount.js");
const ItemMistakeCount = require("./SubTab/7ItemMistakeCount/ItemMistakeCount.js");
const WorkingDateCount = require("./SubTab/9WorkingDateCount/WorkingDateCount.js");
const ItemPerStaftCount = require("./SubTab/11ItemPerStaftCount/ItemPerStaftCount.js");
const NoOfItem = require("./SubTab/5NoOfItem/NoOfItem.js");
const fs = require("fs");

//Tab 1 Analysis Duedate
{
  router.post(
    "/SummaryDataPage/ItemAnalysisDue_fetchItemAnalysisDueGrpah",
    async (req, res) => {
      console.log(req.body);
      try {
        var dataIn = req.body;
        if (dataIn.Branch == "RAYONG") {
          await sleep(500);
        }
        var data = await ItemAnalysisDue.fetchItemAnalysisDueGrpah(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
//Tab 5 NoOfItem
{
  router.post(
    "/SummaryDataPage/NoOfItem_fetchNoOfItemGraph",
    async (req, res) => {
      console.log(req.body);
      try {
        var dataIn = req.body;
        var data = await NoOfItem.fetchNoOfItemGraph(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}
//Tab 2 KPIItemCount
{
  router.post(
    "/SummaryDataPage/KPIItemCount_searchMasterOption",
    async (req, res) => {
      try {
        var data = await KPIItemCount.searchMasterOption();
        res.send({ masterCustomer: data[0], masterInstrument: data[1] });
      } catch (error) {
        F;
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/KPIItemCount_searchKPIData",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await KPIItemCount.searchKPIData(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/KPIItemCount_getDataCreateExcel",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await KPIItemCount.getDataCreateExcel(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}
//Tab 3 3SampleSolutionCount
{
  router.post(
    "/SummaryDataPage/SampleSolutionCount_searchMasterOption",
    async (req, res) => {
      try {
        var data = await SampleSolutionCount.searchMasterOption();
        res.send({ masterCustomer: data[0], masterInstrument: data[1] });
      } catch (error) {
        F;
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/SampleSolutionCount_searchSolutionData",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await SampleSolutionCount.searchSolutionData(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}

//Tab 4 TestPieceCount
{
  router.post(
    "/SummaryDataPage/TestPieceCount_searchMasterOption",
    async (req, res) => {
      try {
        var data = await TestPieceCount.searchMasterOption();
        res.send({ masterCustomer: data[0], masterInstrument: data[1] });
      } catch (error) {
        F;
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/TestPieceCount_searchTestPieceData",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await TestPieceCount.searchTestPieceData(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}

//Tab 5 RequestCount
{
  router.post(
    "/SummaryDataPage/RequestCount_searchMasterOption",
    async (req, res) => {
      try {
        var data = await RequestCount.searchMasterOption();
        res.send({ masterCustomer: data[0], masterInstrument: data[1] });
      } catch (error) {
        F;
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/RequestCount_searchRequestData",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await RequestCount.searchRequestData(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}

//Tab 6 ItemRecheckCount
{
  router.post(
    "/SummaryDataPage/ItemRecheckCount_searchMasterOption",
    async (req, res) => {
      try {
        var data = await ItemRecheckCount.searchMasterOption();
        res.send({ masterCustomer: data[0], masterInstrument: data[1] });
      } catch (error) {
        F;
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/ItemRecheckCount_searchItemRecheckData",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await ItemRecheckCount.searchItemRecheckData(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}

//Tab 7 ItemMistakeCount
{
  router.post(
    "/SummaryDataPage/ItemMistakeCount_searchMasterOption",
    async (req, res) => {
      try {
        var data = await ItemMistakeCount.searchMasterOption();
        res.send({ masterCustomer: data[0], masterInstrument: data[1] });
      } catch (error) {
        F;
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/ItemMistakeCount_searchItemMistakeData",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await ItemMistakeCount.searchItemMistakeData(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}

//Tab 9 WorkingDateCount
{
  router.post(
    "/SummaryDataPage/WorkingDateCount_searchMasterOption",
    async (req, res) => {
      try {
        var data = await WorkingDateCount.searchMasterOption();
        res.send({ masterCustomer: data[0], masterInstrument: data[1] });
      } catch (error) {
        F;
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/WorkingDateCount_searchWorkingDateCountData",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await WorkingDateCount.searchWorkingDateCountData(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}

//Tab 11 ItemPerStaftCount
{
  router.post(
    "/SummaryDataPage/ItemPerStaftCount_searchMasterOption",
    async (req, res) => {
      try {
        var data = await ItemPerStaftCount.searchMasterOption();
        res.send({ masterCustomer: data[0], masterInstrument: data[1] });
      } catch (error) {
        F;
        console.log(error);
        res.json("ERROR");
      }
    }
  );
  router.post(
    "/SummaryDataPage/ItemPerStaftCount_searchItemPerStaftData",
    async (req, res) => {
      try {
        var dataIn = req.body;
        var data = await ItemPerStaftCount.searchItemPerStaftData(dataIn);
        res.send(data);
      } catch (error) {
        console.log(error);
        res.json("ERROR");
      }
    }
  );
}
module.exports = router;
