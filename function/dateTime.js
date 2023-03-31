var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
var monthsTH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

exports.DateTimeNow = () => {
  try {
    var date = new Date();
    var today = "";
    var dd = String(date.getDate()).padStart(2, "0");
    var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = date.getFullYear();
    var yearmonth = yyyy + mm;
    today = yyyy + "-" + mm + "-" + dd;
    var dtn = today + " " + date.toLocaleTimeString("en-GB").slice(0, 8);
    return dtn;
  } catch (err) {
    //console.log("err");
    return "";
  }
};

exports.DateNow = () => {
  try {
    var date = new Date();
    var today = "";
    var dd = String(date.getDate()).padStart(2, "0");
    var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = date.getFullYear();
    var yearmonth = yyyy + mm;
    today = yyyy + "-" + mm + "-" + dd;
    console.log("DateNowFunction : " + today);
    return today;
  } catch (err) {
    //console.log("err");
    return "";
  }
};

exports.TimeNow = () => {
  try {
    var date = new Date();
    var tn = date.toLocaleTimeString("en-GB").slice(0, 8);
    return tn;
  } catch (err) {
    //console.log("err");
    return "";
  }
};

exports.toDateOnly = (DateTimeIn) => {
  try {
    if (DateTimeIn != "" && DateTimeIn != null) {
      var buffSamDate = new Date(DateTimeIn);
      //save already convert so used utc0
      var curr_date = buffSamDate.getUTCDate();
      var curr_month = buffSamDate.getUTCMonth() + 1; //Months are zero based
      var curr_year = buffSamDate.getUTCFullYear();
      var dt = curr_date + "-" + curr_month + "-" + curr_year;
      return dt;
    } else {
      //console.log("else");
      return "";
    }
  } catch (err) {
    //console.log("err");
    return "";
  }
};

exports.toDateSQL = (DateTimeIn) => {
  try {
    //console.log(DateTimeIn);
    if (DateTimeIn != "" && DateTimeIn != null) {
      var buffSamDate = new Date(DateTimeIn);
      var curr_date = buffSamDate.getUTCDate();
      var curr_month = buffSamDate.getUTCMonth() + 1; //Months are zero based
      var curr_year = buffSamDate.getUTCFullYear();
      var dt = curr_year + "-" + curr_month + "-" + curr_date;
      return dt;
    } else {
      //console.log("else");
      return "";
    }
  } catch (err) {
    //console.log("err");
    return "";
  }
};

exports.toMonthOnly = (DateTimeIn) => {
  try {
    //console.log(DateTimeIn);
    if (DateTimeIn != "" && DateTimeIn != null) {
      var buffSamDate = new Date(DateTimeIn);
      var curr_month = buffSamDate.getUTCMonth() + 1; //Months are zero based
      return curr_month;
    } else {
      //console.log("else");
      return "";
    }
  } catch (err) {
    //console.log("err");
    return "";
  }
};

exports.toYearOnly = (DateTimeIn) => {
  try {
    //console.log(DateTimeIn);
    if (DateTimeIn != "" && DateTimeIn != null) {
      var buffSamDate = new Date(DateTimeIn);
      var curr_year = buffSamDate.getUTCFullYear();
      return curr_year;
    } else {
      //console.log("else");
      return "";
    }
  } catch (err) {
    //console.log("err");
    return "";
  }
};

exports.toDateOnlyMonthName = (DateTimeIn) => {
  try {
    //console.log(DateTimeIn);
    if (DateTimeIn != "" && DateTimeIn != null) {
      var buffSamDate = new Date(DateTimeIn);
      var curr_date = buffSamDate.getUTCDate();
      //var curr_month = buffSamDate.getMonth() + 1; //Months are zero based
      var curr_monthName = buffSamDate.toLocaleString("en-US", {
        month: "short",
      });
      var curr_year = buffSamDate.getUTCFullYear();
      var dt = curr_date + "-" + curr_monthName + "-" + curr_year;
      return dt;
    } else {
      //console.log("else");
      return "";
    }
  } catch (err) {
    //console.log("err");
    return "";
  }
};

exports.toDateMonthNameTH = (DateTimeIn) => {
  try {
    //console.log(DateTimeIn);
    if (DateTimeIn != "" && DateTimeIn != null) {
      var buffSamDate = new Date(DateTimeIn);
      var curr_date = buffSamDate.getUTCDate();
      var curr_month = buffSamDate.getUTCMonth(); //Months are zero based
      var curr_year = buffSamDate.getUTCFullYear() + 543;

      var dt = curr_date + " " + monthsTH[curr_month] + " " + curr_year;
      return dt;
    } else {
      //console.log("else");
      return "";
    }
  } catch (err) {
    //console.log("err");
    return "";
  }
};

let sup = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  "⁻": "-",
  "⁼": "=",
  "⁽": "(",
  "⁾": ")",
  ⁿ: "n",
  ⁱ: "i",
};
