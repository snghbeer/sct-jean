import { Storage } from '@ionic/storage';
import { createContext } from "react";

interface StoreContextProps{
    store: Storage|null|undefined,
  }


export const StorageContextt = createContext<StoreContextProps|null|undefined>({
    store: null
});
