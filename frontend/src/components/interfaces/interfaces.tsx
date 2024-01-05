import { Storage } from "@ionic/storage";
import CartController from "./controllers/CartController";
import {Socket} from 'socket.io-client';
import { Route, RouteComponentProps } from "react-router";
import {MySQLiteDBConnection} from './controllers/Database'
import { PaySession } from "./PaymentInterface";

export interface ActiveSessionProp {
  active?: boolean;
  setActive?: (active: boolean) => void;
  signout?: () => void;
  storage?: Storage;
  user?: UserObject;
  setUser?: (user: UserObject | null) => void;
  setNotif?:(active: boolean) => void;
  db?: MySQLiteDBConnection;
}

export interface ProtectedComponent extends Route, ActiveSessionProp {
  component: () => JSX.Element
}

export interface NotificationHeader{
  notified: boolean;
  user?: UserObject;

}

export type PageProps = {
  child: React.ReactNode,
  title?: string,
  backUrl?: string,
}

export interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

export interface LocationProp {
  locationPath: string;
}

export interface LogoutProp {
  setActive: (active: boolean) => void;
  signout: (storage:Storage) => void;
}

export interface DataObject{
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  _id?: string;
  composition?: string[];
}

export interface ProductDTO{
  id: string;
  isOpen: boolean;
  item: DataObject;
}

export interface DetailedPageProps {
  item: DataObject;
  image?: string;
  id?: string;
  isOpen: boolean;
  setClose?: (close: boolean) => void;
  setIsOpen?(): void;
  categories?: CategoryProps[];
  setItems?: (items: DetailedPageProps[]) => void;
  updated?: boolean;
  setUpdated?: (updated: boolean) => void;
  success?: boolean;
  setSuccess?: (updated: boolean) => void;

}

export interface ProductManagerProps {
  categories?: CategoryProps[];
  superCategories?: CategoryProps[];
  items?: DetailedPageProps[];
  fetchItems?: () => void;
  fetchCats?: () => void;
}

export interface UpdatedProp extends ProductManagerProps{
  updated: boolean;
  setUpdated: (updated: boolean) => void;
  setItems?: (items: DetailedPageProps[]) => void;
  setCategories?: (items: CategoryProps[]) => void;
  token?: string;
  store?: StoreProps;
}

export interface PromotionDTO{
  product: string;
  productName: string;
  promotion: number;
}

export interface CartPropItems extends ProductManagerProps{
  cart: CartController;
  setUpdated?: (updated: boolean) => void;
  updated?: boolean;
  user?: UserObject;
  table?: string;
  setTable?: (table: string) => void;
  swipeImgs?: ISliderImage[];
  setItems?: (items: DetailedPageProps[]) => void;
  isLoading?: boolean;
  setIsLoading?: (val: boolean) => void;
  promotions?: PromotionDTO[];
}

export interface CatProps{
  categories: CategoryProps[];
  supercategories: CategoryProps[];
}

export interface CategoryComponentProps{
  category: CategoryProps;
  categories: CategoryProps[];
  setCategories?: (categories: CategoryProps[]) => void;
  updateCategories?: (categories: CategoryProps[]) => void;
}

export interface CategoryProps {
  _id: string;
  name: string;
  superCategory?: string;
}

export type ProductProps = {
  name: string;
  category: string;
  description: string;
  quantity?: number;
  price?: number;
  image?: File;
  composition?: string[];
  promotion?: number;
};


export type RecordItem = {
  numberOfItems: number;
  product: DataObject;
  recordTotal: number;
  note?: string;
}

export interface RecordDTO{
  _id: string;
  records?: RecordItemDTO[];
  date: string;
  total: number;
  by?: number;
  confirmed?: boolean;
  fulfilled?: boolean;
  isOpen?: boolean;
  setOpen?: (bool: boolean) => void;
  waiter?: string;
  validate?: () => void;
}

export type RecordItemDTO = {
  amount: number;
  price: number;
  product: string;
  _id?: string;
}


export  interface RecordItemInterface {
  numberOfItems: number;
  product: DataObject;
  recordTotal: number;
}

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  notif: (data: Buffer) => void;
  new_order: (data: OrderNotification) => void;
  refresh: (data: Buffer) => void; //refresh records orders at real time
  updateProducts: (data: Buffer) => void;
  endCall: () => void;
  callAccepted: () => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  new_order: () => void;
  callRequest: () => void;
  declineCall: () => void;
  acceptCall: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export enum UserPrivileges{
  Admin,
  Manager,
  User
}

export interface UserObject {
  username: string;
  email?: string;
  password?: string;
  cpassword?: string;
  role?: UserPrivileges;
  token?: string;
  socket?: Socket<ServerToClientEvents, ClientToServerEvents> | null | undefined;
  uid?: string;
}

export interface ProductDetailPageProps extends RouteComponentProps<{id: string;}> {}


///SQL Lite
export interface JsonListenerInterface {
  jsonListeners: boolean,
  setJsonListeners: React.Dispatch<React.SetStateAction<boolean>>,
}
export interface existingConnInterface {
  existConn: boolean,
  setExistConn: React.Dispatch<React.SetStateAction<boolean>>,
}

export interface SqliteDTO{
  id: number;
  json_data:string;
}

export interface StoreProps{
  connection: MySQLiteDBConnection | undefined | null;
  isReady: boolean |undefined | null;
}

export interface OrderNotification{
  id: string;
  message: string;
}

export interface TableObject {
  start: number;
  end: number;
}

export interface TableDTO {
  subId: number;
  closed: boolean;
  total: number;
  _id: string;
}

export interface SessionDTO{
  _id:string;
  name: string,
  date: string;
  startTime: number;
  endTime: number;
  duration: number, 
  total: number, 
  closed: boolean;
}

export interface BusyDates{
    date: string,
    textColor: string,
    backgroundColor: string,
  
}

export interface SessionComponentProps{
  sessions: SessionDTO[] |undefined;
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
  canFilter: boolean;
  dateToFilter?: string;
}

export interface SidebarProps extends ActiveSessionProp{
  open?: boolean;
  onClose?: () => void;
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

export enum CategoryOfCategory {
  Food = "food",
  Activity = "activity",
}

export interface CategoryProperties{
  supercategory?: string
  setSuper: (value: CategoryOfCategory) => void;
  categories: CategoryProps[];
  selected: string|undefined;
  setSelected: (value: string) => void;

}

export interface PlusMinusButtonProps{
  increaseFunction: (value:any) => void;
  decreaseFunction: (value:any) => void;
  class?: string;
}

export interface ISliderImage{
  _id: string;
  image: string;
}

export interface IProductInfo{
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
  item?: DataObject;
}

export interface CompositionInputProps{
  composition: string[];
  setComposition: (value: string[]) => void
}

export interface ViewModeProps{
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

export enum ViewMode{
  Classic,
  Resto,
  Hotel,
  Classic2
}


export interface IPricingForm{
  duration: string;
  pricing: string;
}

export interface IPricingOption{
  duration: number;
  pricing: number;
}

export interface PricingOptionProps{
  setOptions: (val: IPricingOption[]) => void;
  pricingOptions: IPricingOption[];
}

export type ActivityProps = {
  name: string;
  category: string;
  description: string;
  durationOptions: IPricingOption[];
  start: Date;
  end: Date;
  image: File;
  location?: string;
};

export interface IActivity  {
  _id: string;
  name: string;
  category: string;
  image: string;
  fname?: string;
  durationOptions: IPricingOption[];
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

export interface ICheckoutProps{
  isOpen: boolean;
  cancelOrder: () => void;
  session?: PaySession|null|undefined;
  fetchPaymentSession?: (url: string) => Promise<void>
  total: number;
  cartItems:  [string, RecordItem | undefined][]
}

export enum PayMethod {
  CASH = "cash",
  CARD = "card"
}

export interface IPaySessionMethod{
  method: PayMethod|null;
  id: string|null;
}