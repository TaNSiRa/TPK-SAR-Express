const express = require("express");
const router = express.Router();
const mssqlKPI = require("../../function/mssqlKPI.js");

router.post(
  "/MainPage_SaveKPIReason",
  async (req, res) => {
    console.log("in SaveKPIReason");
    try {
      var dataIn = JSON.parse(req.body.saveReason);
      var reqNo = dataIn[0].ReqNo;
      var reason = dataIn[0].Reason;
      var stage = dataIn[0].Stage;

      var query = `
        UPDATE [KPI_Overdue]
        SET 
          Reason1 = CASE WHEN ReqNo1 = '${reqNo}' THEN '${reason}' ELSE Reason1 END,
          Reason2 = CASE WHEN ReqNo2 = '${reqNo}' THEN '${reason}' ELSE Reason2 END,
          Reason3 = CASE WHEN ReqNo3 = '${reqNo}' THEN '${reason}' ELSE Reason3 END,
          Reason4 = CASE WHEN ReqNo4 = '${reqNo}' THEN '${reason}' ELSE Reason4 END,
          Stage1 = CASE WHEN ReqNo1 = '${reqNo}' THEN '${stage}' ELSE Stage1 END,
          Stage2 = CASE WHEN ReqNo2 = '${reqNo}' THEN '${stage}' ELSE Stage2 END,
          Stage3 = CASE WHEN ReqNo3 = '${reqNo}' THEN '${stage}' ELSE Stage3 END,
          Stage4 = CASE WHEN ReqNo4 = '${reqNo}' THEN '${stage}' ELSE Stage4 END
        WHERE '${reqNo}' IN (ReqNo1, ReqNo2, ReqNo3, ReqNo4);
      `;

      console.log(query);
      await mssqlKPI.qurey(query);



      res.send("OK");
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json("ERROR");
    }
  }
);

router.post(
  "/MainPage_DeleteStageReason",
  async (req, res) => {
    console.log("in DeleteStageReason");
    try {
      var dataIn = JSON.parse(req.body.DeleteKPIreason);
      console.log(req.body);
      var reqNo = dataIn[0].ReqNo;
      var reason = '';
      var stage = '';

      var query = `
        UPDATE [KPI_Overdue]
        SET 
          Reason1 = CASE WHEN ReqNo1 = '${reqNo}' THEN '${reason}' ELSE Reason1 END,
          Reason2 = CASE WHEN ReqNo2 = '${reqNo}' THEN '${reason}' ELSE Reason2 END,
          Reason3 = CASE WHEN ReqNo3 = '${reqNo}' THEN '${reason}' ELSE Reason3 END,
          Reason4 = CASE WHEN ReqNo4 = '${reqNo}' THEN '${reason}' ELSE Reason4 END,
          Stage1 = CASE WHEN ReqNo1 = '${reqNo}' THEN '${stage}' ELSE Stage1 END,
          Stage2 = CASE WHEN ReqNo2 = '${reqNo}' THEN '${stage}' ELSE Stage2 END,
          Stage3 = CASE WHEN ReqNo3 = '${reqNo}' THEN '${stage}' ELSE Stage3 END,
          Stage4 = CASE WHEN ReqNo4 = '${reqNo}' THEN '${stage}' ELSE Stage4 END
        WHERE '${reqNo}' IN (ReqNo1, ReqNo2, ReqNo3, ReqNo4);
      `;

      console.log(query);
      await mssqlKPI.qurey(query);



      res.send("OK");
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json("ERROR");
    }
  }
);

module.exports = router;
