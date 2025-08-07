const Pattern_K1 = require("./Pattern_K1.js");
const Pattern_K2 = require("./Pattern_K2.js");
const Pattern_T1 = require("./Pattern_T1.js");
const Pattern_NHK = require("./Pattern_NHK.js");
const Pattern_NHKSTA = require("./Pattern_NHKSTA.js");
const Pattern_TCFGU = require("./Pattern_TCFGU.js");
const Pattern_VCCT = require("./Pattern_VCCT.js");
const Pattern_BSI = require("./Pattern_BSI.js");
const Pattern_SODICK = require("./Pattern_SODICK.js");
const Pattern_TATSUNO = require("./Pattern_TATSUNO.js");
const Pattern_SIW = require("./Pattern_SIW.js");
const Pattern_SRK = require("./Pattern_SRK.js");
const Pattern_BSNCR = require("./Pattern_BSNCR.js");
const Pattern_SMTN = require("./Pattern_SMTN.js");
const Pattern_HONDAP = require("./Pattern_HONDAP.js");
const Pattern_JPHIPHAT = require("./Pattern_JPHIPHAT.js");
const Pattern_CPR1 = require("./Pattern_CPR1.js");
const Pattern_AITH = require("./Pattern_AITH.js");
const Pattern_DAIKIN = require("./Pattern_DAIKIN.js");
const Pattern_NBCT = require("./Pattern_NBCT.js");
const Pattern_SCI = require("./Pattern_SCI.js");
const Pattern_TWP = require("./Pattern_TWP.js");
const Pattern_UCC = require("./Pattern_UCC.js");
const Pattern_Y2TM = require("./Pattern_Y2TM.js");
const Pattern_BCM = require("./Pattern_BCM.js");
const Pattern_TBFST = require("./Pattern_TBFST.js");
const Pattern_TBFST2 = require("./Pattern_TBFST2.js");
const Pattern_TYK = require("./Pattern_TYK.js");
const Pattern_TSMI = require("./Pattern_TSMI.js");
const Pattern_SFTB = require("./Pattern_SFTB.js");
const Pattern_HONDA = require("./Pattern_HONDA.js");
const Pattern_HANON = require("./Pattern_HANON.js");
const Pattern_CMWT = require("./Pattern_CMWT.js");
const Pattern_HONDAPNOX = require("./Pattern_HONDAPNOX.js");
const Pattern_APM = require("./Pattern_APM.js");
const Pattern_HONDAR = require("./Pattern_HONDAR.js");
const Pattern_HMTH = require("./Pattern_HMTH.js");
const Pattern_IEMT = require("./Pattern_IEMT.js");
const Pattern_TSPKC = require("./Pattern_TSPKC.js");
const Pattern_STIC = require("./Pattern_STIC.js");
const Pattern_BFC = require("./Pattern_BFC.js");
const Pattern_CITI = require("./Pattern_CITI.js");
const Pattern_MMTH4 = require("./Pattern_MMTH4.js");
const Pattern_MMTHNEW = require("./Pattern_MMTHNEW.js");
const Pattern_SOI8 = require("./Pattern_SOI8.js");
const Pattern_PLANT = require("./Pattern_PLANT.js");
const Pattern_BESTEX = require("./Pattern_BESTEX.js");
const Pattern_TMTS = require("./Pattern_TMTS.js");
const Pattern_AAB = require("./Pattern_AAB.js");
const Pattern_PHODAIHAN = require("./Pattern_PHODAIHAN.js");
const Pattern_GASBP = require("./Pattern_GASBP.js");
const Pattern_ATT = require("./Pattern_ATT.js");
const Pattern_THACOM = require("./Pattern_THACOM.js");
const Pattern_DAIKINAC131 = require("./Pattern_DAIKINAC131.js");

exports.SelectPattern = async (dataReport) => {
  try {
    //if(dataReport[0].PatternReport!='')
    if (dataReport[0].PatternReport == "T1") {
      var data = await Pattern_T1.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "NHK") {
      var data = await Pattern_NHK.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "NHKSTA") {
      var data = await Pattern_NHKSTA.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "K2") {
      var data = await Pattern_K2.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "TCFGU") {
      var data = await Pattern_TCFGU.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "VCCT") {
      var data = await Pattern_VCCT.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "BSI") {
      var data = await Pattern_BSI.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "SODICK") {
      var data = await Pattern_SODICK.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "TATSUNO") {
      var data = await Pattern_TATSUNO.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "SIW") {
      var data = await Pattern_SIW.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "SRK") {
      var data = await Pattern_SRK.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "SRKAl") {
      var data = await Pattern_SRK.CreatePDFSRKAl(dataReport);
    } else if (dataReport[0].PatternReport == "BSNCR") {
      var data = await Pattern_BSNCR.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "SMTN") {
      var data = await Pattern_SMTN.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "HONDAP") {
      var data = await Pattern_HONDAP.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "JPHIPHAT") {
      var data = await Pattern_JPHIPHAT.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "CPR1") {
      var data = await Pattern_CPR1.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "AITH") {
      var data = await Pattern_AITH.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "DAIKIN") {
      var data = await Pattern_DAIKIN.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "DAIKINFFS") {
      var data = await Pattern_DAIKIN.CreatePDFFFS(dataReport);
    } else if (dataReport[0].PatternReport == "NBCT") {
      var data = await Pattern_NBCT.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "SCI") {
      var data = await Pattern_SCI.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "SCIW") {
      var data = await Pattern_SCI.CreatePDFW(dataReport);
    } else if (dataReport[0].PatternReport == "TWP") {
      var data = await Pattern_TWP.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "UCC") {
      var data = await Pattern_UCC.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "Y2TM") {
      var data = await Pattern_Y2TM.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "Y2TMA3") {
      var data = await Pattern_Y2TM.CreatePDFA3(dataReport);
    } else if (dataReport[0].PatternReport == "BCM") {
      var data = await Pattern_BCM.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "TBFST") {
      var data = await Pattern_TBFST.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "TBFST2") {
      var data = await Pattern_TBFST2.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "TYK") {
      var data = await Pattern_TYK.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "TSMI") {
      var data = await Pattern_TSMI.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "SFTB") {
      var data = await Pattern_SFTB.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "HONDA") {
      var data = await Pattern_HONDA.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "HANON") {
      var data = await Pattern_HANON.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "CMWT") {
      var data = await Pattern_CMWT.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "HONDAPNOX") {
      var data = await Pattern_HONDAPNOX.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "APM") {
      var data = await Pattern_APM.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "HONDAR") {
      var data = await Pattern_HONDAR.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "HMTH") {
      var data = await Pattern_HMTH.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "IEMT") {
      var data = await Pattern_IEMT.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "TSPKC") {
      var data = await Pattern_TSPKC.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "STIC") {
      var data = await Pattern_STIC.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "BFC") {
      var data = await Pattern_BFC.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "CITI") {
      var data = await Pattern_CITI.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "MMTH4") {
      var data = await Pattern_MMTH4.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "MMTHNEW") {
      var data = await Pattern_MMTHNEW.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "8T1") {
      var data = await Pattern_SOI8.CreatePDFT1(dataReport);
    } else if (dataReport[0].PatternReport == "8T2") {
      var data = await Pattern_SOI8.CreatePDFT2(dataReport);
    } else if (dataReport[0].PatternReport == "8T3") {
      var data = await Pattern_SOI8.CreatePDFT3(dataReport);
    } else if (dataReport[0].PatternReport == "PLANT") {
      var data = await Pattern_PLANT.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "BESTEX") {
      var data = await Pattern_BESTEX.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "TMTS") {
      var data = await Pattern_TMTS.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "AAB") {
      var data = await Pattern_AAB.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "PHODAIHAN") {
      var data = await Pattern_PHODAIHAN.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "GASBP") {
      var data = await Pattern_GASBP.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "ATT") {
      var data = await Pattern_ATT.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "THACOM") {
      var data = await Pattern_THACOM.CreatePDF(dataReport);
    } else if (dataReport[0].PatternReport == "DAIKINAC131") {
      var data = await Pattern_DAIKINAC131.CreatePDF(dataReport);
    } else {
      {
        console.log("K1");
        var data = await Pattern_K1.CreatePDF(dataReport);
      }
    }
    return data;
  } catch (err) {
    return err;
  }
};
