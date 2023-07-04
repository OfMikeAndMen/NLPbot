import mariadb, { TypeCastFunction } from "mariadb";
let pool: mariadb.Pool;

const getPool = (): mariadb.Pool => {
  if (pool) {
    console.log("pool exists");
    return pool;
  }
  console.log("POOL DOES NOT EXIST");
  pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_DB,
    port: Number(process.env.DB_PORT) || 3306,
    connectionLimit: 5,
    checkDuplicate: false, //TODO explicit selects
    typeCast: tinyToBoolean,
    bigNumberStrings: true
  });

  return pool;
};

const tinyToBoolean: TypeCastFunction = (column, next) => {
  if (column.type == "TINY" && column.columnLength === 1) {
    return column.int() === 1;
  }
  return next();
};

export default getPool;
