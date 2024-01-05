import { useEffect, useState, createContext, useContext } from 'react';
import { useSQLite } from 'react-sqlite-hook';
import { createUserSessionTable } from './util/sqlQueries';
import { MySQLiteDBConnection } from './interfaces/controllers/Database';

export function useStore() {
    const [isReady, setReady] = useState(false)
    const [aConnection, setConnection] = useState<MySQLiteDBConnection | null>();
    const {createConnection, checkConnectionsConsistency, isConnection,
        getPlatform, retrieveConnection, closeAllConnections, isAvailable} = useSQLite()

    useEffect(() => {
        async function initDb(){
            const ret = await checkConnectionsConsistency();
            const isConn = (await isConnection("mySQLDb", false)).result;
            const platform = await getPlatform()
            let aConn;
            if (ret.result && isConn) aConn = new MySQLiteDBConnection(await retrieveConnection("mySQLDb", false));
            else aConn = new MySQLiteDBConnection(await createConnection('mySQLDb', false, 'mysecretkey', 1))
            if(isAvailable){
              setConnection(aConn)
              await aConn.execQry(createUserSessionTable)
              setReady(isAvailable)
              console.log(`$$$ ${platform.platform} App sqlite.isAvailable  ${isAvailable} $$$`);
            }
          }
          initDb();
    }, []);

     useEffect(() => {
        // Close the database connection when the app is about to be unloaded
        const handleAppUnload = async () => {
          if (aConnection) {
            console.log("closing db!")
            await aConnection.close();
            await closeAllConnections()
            setConnection(null)
          }
        };
        window.addEventListener('beforeunload', handleAppUnload);
        return () => {
          window.removeEventListener('beforeunload', handleAppUnload);
        };
      }, [aConnection]); 
    

    if (isReady) return { connection: aConnection, isReady: isReady};
    else return { connection: null, isReady: false};
}

interface StorageContextProps{
  connection: MySQLiteDBConnection|null|undefined,
  isReady: boolean
}

export const StorageContext = createContext<StorageContextProps>({
  connection: null,
  isReady: false
});