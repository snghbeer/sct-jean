import { createContext } from "react";
import CartController from '../interfaces/controllers/CartController'

interface CartContextProps{
    updated: boolean,
    cart?: CartController,
    setUpdated?: () => void
}

interface IDebugProps{
    debugMode: boolean,
    setDebugMode: () => void,
    releaseDebugMode: () => void
}

interface ITable{
    table: string|undefined,
    setTable: (tableNr: string) => void
}

export const CartContext = createContext<CartContextProps>({
    updated: false,
});

export const PfContext = createContext({
    isNative: false,
    isTablet: false,
    isWebView: false,
});

export const DebugContext = createContext<IDebugProps>({
    debugMode: false,
    setDebugMode: () => null,
    releaseDebugMode: () => null,
});

export interface TableConfigProps {
    isOpen: boolean;
    table: string|undefined;
    setTable: (table: string) => void;
  }

export const TableContext = createContext<TableConfigProps>({
    isOpen: false,
    table: undefined,
    setTable: () => null
});