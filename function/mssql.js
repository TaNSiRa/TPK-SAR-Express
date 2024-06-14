const mssql = require('mssql');
const config = {
  user: "sa",
  password: "12345678",
  database: "SAR",
  server: "127.0.0.1",
  pool: {
    //max: 10,
    //min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    //trustServerCertificate: true, // change to true for local dev / self-signed certs
  }
}

// exports.qurey = async (input) => {
//   try {
//     await sql.connect(config)
//     const result = await sql.query(input)
//     //  console.dir(result)
//     return result;
//   } catch (err) {
//     return "err";
//   }
// };

exports.qurey = async (QueryText) => {
  try {
    console.log(`---------------`);
    await mssql.connect(config)
    const result = await mssql.query(QueryText).then((v) => {
        // console.log(`---------------`);
         //console.log(v.recordset);  
        out = v;   
        // console.log(`---------------`);
        return v;
      
      }).then(() => mssql.close())
    
      //  console.dir(result)
      return out;
  } catch (err) {
    console.log(err);
    return "err";
  }
};