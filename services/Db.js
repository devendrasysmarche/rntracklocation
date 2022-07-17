import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';

const tableName = 'deliverylocation';

enablePromise(true);

export const getDBConnection = async () => {
  return openDatabase({ name: 'tracklocation.db', location: 'default' });
};

export const createTable = async (db) => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        accuracy TEXT DEFAULT NULL, 
        altitude TEXT DEFAULT NULL, 
        latitude TEXT NOT NULL, 
        longitude TEXT NOT NULL, 
        status TEXT DEFAULT 'INSERTED', 
        orderid TEXT,
        timestamp TEXT DEFAULT NULL,
        created TEXT NULL
    );`;

  await db.executeSql(query);
};

export const getTodoItems = async (db) => {
  try {
    const todoItems = [];
    const results = await db.executeSql(`SELECT * FROM ${tableName}`);
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        todoItems.push(result.rows.item(index))
      }
    });
    return todoItems;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get todoItems !!!');
  }
};

export const saveTodoItems = async (db, todoItems) => {
  const insertQuery =
    `INSERT OR REPLACE INTO ${tableName}(accuracy, altitude, latitude, longitude, orderid, timestamp, created) values` +
    todoItems.map(i => `(${i.accuracy}, '${i.altitude}', '${i.latitude}', '${i.longitude}', '${i.orderid}', '${i.timestamp}', '${i.created}')`).join(',');

  return db.executeSql(insertQuery);
};


export const saveLocation = async (db, i) => {
    const insertQuery =
        `INSERT OR REPLACE INTO ${tableName}(accuracy, altitude, latitude, longitude, orderid, timestamp, created) values` +
        `(${i.accuracy}, '${i.altitude}', '${i.latitude}', '${i.longitude}', '${i.orderid}', '${i.timestamp}', '${i.created}')`;
    console.log('Query', insertQuery);
    let result = db.executeSql(insertQuery)
    return result;
  };

export const deleteTodoItem = async (db, id) => {
  const deleteQuery = `DELETE from ${tableName} where rowid = ${id}`;
  await db.executeSql(deleteQuery);
};

export const deleteTable = async (db) => {
  const query = `drop table IF EXISTS ${tableName}`;

  await db.executeSql(query);
};