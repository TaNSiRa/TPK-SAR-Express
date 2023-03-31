const express = require("express");
const router = express.Router();
require("./asset/THSarabun-normal.js");
require("./asset/THSarabun Italic-italic.js");
require("./asset/THSarabun Bold-bold.js");


router.use(require("./flow/20widget/ShowPicture"));
router.use(require("./flow/test"));
router.use(require("./flow/31RequestDetailRequester/KAC_Report/KAC_Report"));
router.use(require("./flow/31RequestDetailRequester/RoutineRequestDetailRequesterPage/RoutineRequestDetailRequesterPage"));
router.use(require("./flow/12SummaryDataPage/12SummaryDataPage"));
//router.use(require("./flow/testflow/testflow"))

module.exports = router;