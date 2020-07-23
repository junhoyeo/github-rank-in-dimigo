import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const adapter = new FileSync('database/database.json')
const database = lowdb(adapter);

database
  .defaults({ users: [] })
  .write();

export default database;
