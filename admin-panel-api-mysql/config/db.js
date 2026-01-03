const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

connection.connect(function (err) {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Successfully connected to MySQL database");
});

function runDBCommand(sqlQuery, params = []) {
  return new Promise((resolve, reject) => {
    connection.execute(sqlQuery, params, (error, results) => {
      if (error) {
        console.error("DB Error during query execution:", error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  runDBCommand,
  connection,
};
