import { SQLiteDBConnection } from 'react-sqlite-hook';

export class MySQLiteDBConnection{
  readonly connection: SQLiteDBConnection;

  constructor(db: SQLiteDBConnection) {
    this.connection = db;
    // perform any additional initialization for class A
  }

  async execQry(qry:string){
    await this.connection.open()
    let res = await this.connection.execute(qry); //init user session table if not exists
    await this.connection.close()
    return res;
  }

  async execQuery(qry:string){
    await this.connection.open()
    let res = await this.connection.query(qry); //init user session table if not exists
    await this.connection.close()
    return res;
  }

  async runQuery(qry:string, values:string[]){
    try{
      await this.connection.open()
      let res = await this.connection.run(qry, values); //init user session table if not exists
      return res
    }
    catch(error){
      console.error(error)
    }
    finally{
      await this.connection.close()
    }
  }

  async addArray(qry:string){
    await this.connection.open()
    let res = await this.connection.run(qry); //init user session table if not exists
    await this.connection.close()
    return res
  }

  async close(){
    await this.connection.close()
  }

  async open(){
    await this.connection.open()
  }
}