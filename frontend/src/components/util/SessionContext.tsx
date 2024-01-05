import { createContext } from "react";
import { UserObject } from "../interfaces/interfaces";

export const UserContext = createContext<UserObject|null|undefined>(null);
  
  