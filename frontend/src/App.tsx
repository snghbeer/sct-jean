import { useEffect, useRef, useState } from "react";

import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonPage,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

import {
  SignupContainer,
  LoginContainer,
} from "./components/session/LoginContainer";
import Menu from "./components/Menu";
import ProductManager from "./components/ProductManager";
import AdminOrderPage from "./components/AdminOrderPage";
import ProductDetailPage from "./components/DetailedProductPage";

import { Header } from "./components/Header";
import StatComponent from "./components/stats";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./components/theme/variables.css";
import "./components/styles.css";

import { UserObject, UserPrivileges, ViewMode } from "./components/interfaces/interfaces";
import {  io } from "socket.io-client";

import { ProtectedRoute } from "./routes/protectedRoute";
import { useStore, StorageContext } from "./components/storage";
import { apiUrl, serverUrl } from "./config";
import { loginUser } from "./components/session/utils";
import { UserContext } from "./components/util/SessionContext";
import { StorageContextt } from "./components/util/StorageContext";

import OrderDashboard from "./components/Tables";
import SessionComponent from "./components/Session";
import { Storage } from "@ionic/storage";
import MenuManager from "./components/MenuComponent";
import { Capacitor } from "@capacitor/core";
import { isNative, isTablet, isTabletOrWeb, isWebView } from "./components/util/helpFunctions";
import { DebugContext, PfContext, TableContext } from "./components/util/CartContext";
import ViewModeContext from "./components/theme/viewModeContext";
import { AddActivityComponent } from "./components/tabs/AddActivityComponent";
import { checkUserSessionCache } from "./components/util/sqlQueries";
import CustomKioskPlugin from "./plugins/CustomKioskPlugin";
import HomeNav from "./components/HomeNav";
import ActivityMenu from "./components/tabs/ActivityMenu";
import HotelInfo from "./components/tabs/HotelInfo";
import CallComponent from "./components/tabs/CallComponent";

const isAdmin = (user: UserObject) => {
  return (
    user &&
    (user.role === UserPrivileges.Admin || user.role === UserPrivileges.Manager)
  );
};

setupIonicReact();

const App: React.FC = () => {
  const [activeSession, setActiveSession] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Classic);
  const [store, setStore] = useState<Storage>();
  const [debugMode, setDebugMode] = useState(false);


  const [tab, setTab] = useState(false);
  const [mob, setMob] = useState(false);
  const [isweb, setwb] = useState(false);

  const { connection, isReady } = useStore();
  const [aUser, setUser] = useState<UserObject | null>();
  const [tokenRefreshed, setTokenRefreshed] = useState(false);
  const timer = useRef<NodeJS.Timeout|null>(null);
  const [table, setTable] = useState<string | undefined>();

  const enableDebug = async () => {
    // Clear the existing timer when the button is pressed down again
    await toggleLockMode()

    /* clearTimeout(timer.current!);
    // Start a new timer
     timer.current = setTimeout(async() => {
      console.log('Button has been pressed for 3 seconds');
      await toggleLockMode()
    }, 3000); */
  };

  const cancelEnableDebug = (): void => {
    // Clear the timer when the button is released
    clearTimeout(timer.current!);
    setDebugMode(false);
  };


  async function toggleLockMode(){
    const newDebugMode = !debugMode;
    setDebugMode(newDebugMode);
    if (newDebugMode) await CustomKioskPlugin.disableKioskMode();
    else await CustomKioskPlugin.enableKioskMode();
  }

  async function checkCache() {
    try {
      let ret = await connection?.execQuery(checkUserSessionCache);
      let user = ret?.values![0]; /* JSON.parse(await store?.get("userSession")) */ 
      if (user) {
        const sock = io(serverUrl!, {
          query: { sessionId: "hDXHgLq7IUb9ot5-AAAJ" },
          reconnection: false,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });
        user.socket = sock;
        setUser(user);
        setActiveSession(true);

        sock.on("connect", () => {
          //console.log(sock.id);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUserSession() {
    aUser?.socket?.on("connect", async () => {
      if (aUser?.role === UserPrivileges.Admin) console.log("User is an admin");
      else if (aUser?.role === UserPrivileges.Manager)
        console.log("User is a manager");
      else console.log("User is not an admin");

      return () => {
        aUser?.socket?.disconnect();
      };
    });
  }

  function handleViewMode(aMode: ViewMode){
    switch(aMode){
      case ViewMode.Classic:{
        setViewMode(ViewMode.Classic)
        document.body.classList.remove("resto")
        document.body.classList.remove("hotel")
        document.body.classList.remove("classic2")

        document.body.classList.add("classic")
/*         document.documentElement.style.setProperty('--ion-font-family', 'AppFont');*/        document.documentElement.style.setProperty('--ion-color-primary', '#c09a33');
        document.documentElement.style.setProperty('--ion-color-primary-rgb', '214,175,70');
        document.documentElement.style.setProperty('--ion-color-primary-contrast', '#000000');
        document.documentElement.style.setProperty('--ion-color-primary-contrast-rgb', ' 0,0,0');
        document.documentElement.style.setProperty('--ion-color-primary-shade', '#bc9a3e');
        document.documentElement.style.setProperty('--ion-color-primary-tint', '#dab759');
        break;
      }
      case ViewMode.Resto:{
        setViewMode(ViewMode.Resto)
        document.body.classList.remove("classic")
        document.body.classList.remove("hotel")
        document.body.classList.remove("classic2")

        document.body.classList.add("resto")
        document.documentElement.style.setProperty('--ion-color-primary', '#f1a842');
        document.documentElement.style.setProperty('--ion-color-primary-rgb', '212,125,3');
        document.documentElement.style.setProperty('--ion-color-primary-contrast', '#ffffff');
        document.documentElement.style.setProperty('--ion-color-primary-contrast-rgb', '0,0,0');
        document.documentElement.style.setProperty('--ion-color-primary-shade', '#bb6e03');
        document.documentElement.style.setProperty('--ion-color-primary-tint', '#d88a1c');

        break;
      }
      case ViewMode.Hotel:{
        setViewMode(ViewMode.Hotel)
        document.body.classList.remove("resto")
        document.body.classList.remove("classic")
        document.body.classList.remove("classic2")

        document.body.classList.add("hotel")
        document.documentElement.style.setProperty('--ion-color-primary', '#9a4115');
        document.documentElement.style.setProperty('--ion-color-primary-rgb', '154,65,21');
        document.documentElement.style.setProperty('--ion-color-primary-contrast', '#ffffff');
        document.documentElement.style.setProperty('--ion-color-primary-contrast-rgb', '255, 255, 255');
        document.documentElement.style.setProperty('--ion-color-primary-shade', '#883912');
        document.documentElement.style.setProperty('--ion-color-primary-tint', '#a4542c');
        break;
      }
      case ViewMode.Classic2:{
        document.body.classList.remove("resto")
        document.body.classList.remove("classic")
        document.body.classList.remove("hotel")

        document.body.classList.add("classic2")
        /* document.documentElement.style.setProperty('--ion-font-family', 'Roboto, Helvetica Neue, sans-serif'); */
        document.documentElement.style.setProperty('--ion-color-primary', '#9a8174');
        document.documentElement.style.setProperty('--ion-color-primary-rgb', '154,129,116');
        document.documentElement.style.setProperty('--ion-color-primary-contrast', '#000000');
        document.documentElement.style.setProperty('--ion-color-primary-contrast-rgb', '0,0,0');
        document.documentElement.style.setProperty('--ion-color-primary-shade', '#887266');
        document.documentElement.style.setProperty('--ion-color-primary-tint', '#a48e82');
        break;
      }
      default: break;
    }
  }

  
  useEffect(() => {
    const initStore = async () => {
      const store = new Storage();
      await store.create();
      setStore(store);
    };

    async function checkPf() {
      const istab = await isTablet();
      const isMobile = await isNative();
      const iswb = await isWebView();

      setMob(isMobile);
      setwb(iswb);
      setTab(istab)

    }
 
    initStore();
    checkPf();


  }, []);

  useEffect(() => {
    async function fetchView(){
      let cachedViewMode = await store?.get("view");
      if(!cachedViewMode){
        const dataFetch = await fetch(`${apiUrl}/product_manager/view`)
        cachedViewMode = await dataFetch.json()
        handleViewMode(cachedViewMode.view.mode as ViewMode)
        await store?.set("view", cachedViewMode.view.mode);
      }else {
        await store?.set("view", cachedViewMode);
        handleViewMode(cachedViewMode as ViewMode)
      }
      
    }
    if (store && connection && isReady) {
      checkCache();
      //fetchView()
    }

  }, [store, connection, isReady]);

  useEffect(() => {
    if (aUser?.socket) {
      setActiveSession(true);
      fetchUserSession();
    } else setActiveSession(false);
  }, [aUser?.socket]);

  useEffect(() => {
    if (activeSession && !tokenRefreshed && aUser) {

      const refreshToken = (newval: string) => {
        setUser((prevState) => ({ ...prevState!, token: newval }));
        setTokenRefreshed(true);
      };
      (async () => {
        const userCred = {
          username: aUser.username,
          password: aUser.password!,
        };
        await loginUser(userCred, (res) => {
          if (res.success) {
            refreshToken(res.token);
          } else {
            console.log(res.message);
          }
        });
      })();
    }
  }, [activeSession, tokenRefreshed, aUser]);

  return (
    <>
    <DebugContext.Provider 
      value={{
        debugMode: debugMode, 
        setDebugMode: enableDebug,
        releaseDebugMode: cancelEnableDebug
      }}>
      <ViewModeContext.Provider value={{mode: viewMode, setMode: handleViewMode}}>
        <PfContext.Provider value={{ isNative: mob, isTablet: tab, isWebView: isweb }}>
          <UserContext.Provider value={aUser}>
            <StorageContext.Provider
              value={{ connection: connection, isReady: isReady }}
            >
              <StorageContextt.Provider value={{ store: store }}>
                <TableContext.Provider value={{table: table, setTable: setTable, isOpen: (table === undefined)}}>
                <IonApp className="scanner-hide">
                  {
                    //DONT TOUCH THIS
                    <IonPage id="main-content">
                      
                      <IonReactRouter>
                      {Capacitor.getPlatform() === "web" && !mob ? 
                      (<Menu
                        db={connection!}
                        active={activeSession}
                        setActive={setActiveSession}
                        setUser={setUser}
                        mode={viewMode}
                        setMode={handleViewMode}
                      />) : (<></>)} 
                        
                        <IonRouterOutlet id="main">
                          <Route path="/" exact={true}>
                              <Redirect to="/home" />
                          </Route>
                          <Route
                            path="/page/login"
                            component={() =>
                              !aUser ? (
                                LoginContainer({
                                  db: connection!,
                                  setUser: setUser,
                                  active: activeSession,
                                  setActive: setActiveSession,
                                })
                              ) : (
                                <Redirect to="/menu" />
                              )
                            }
                            exact={true}
                          />
                          <Route
                            path="/page/signup"
                            component={
                              () =>
                              !aUser ? (
                                SignupContainer()
                              ) : (
                                <Redirect to="/menu" />
                              )
                            }
                            exact={true}
                          />
                          <Route
                            path="/home"
                            exact={true}
                          >
                            <HomeNav />
                          </Route>
                          <Route
                            path="/activity"
                            exact={true}
                          >
                            <ActivityMenu />
                          </Route>
                          <Route
                            path="/call"
                            exact={true}
                          >
                            <CallComponent />
                          </Route>
                          <Route
                            path="/menu"
                            exact={true}
                          >
                            <MenuManager connection={connection} isReady={isReady} />
                          </Route>
                          <Route
                            path="/info"
                            exact={true}
                          >
                            <HotelInfo />
                          </Route>
                          <Route
                            path="/manager"
                            exact={true}
                            component={() => aUser && isAdmin(aUser)
                                ? <ProductManager />
                                : null
                            }
                          />
                          <Route
                            path="/tables"
                            exact={true}
                            render={() =>
                              aUser && isAdmin(aUser) ? <OrderDashboard /> : null
                            }
                          />
                          <Route
                            path="/session"
                            exact={true}
                            component={SessionComponent}
                          ></Route>
                          <Route
                            path="/admin/orders"
                            exact={true}
                            render={() =>
                              aUser && isAdmin(aUser) ? <AdminOrderPage /> : null
                            }
                          />
                                                  <Route
                            path="/activity_manager"
                            exact={true}
                            render={() =>
                              aUser && isAdmin(aUser) ? <AddActivityComponent connection={connection} isReady={isReady}/> : null
                            }
                          />

                          <Route
                            path="/sales"
                            component={StatComponent}
                          />
                          <ProtectedRoute
                            isAuthenticated={activeSession}
                            path="/product/:id"
                            component={ProductDetailPage}
                          />
                        </IonRouterOutlet>
                      </IonReactRouter>
                    </IonPage>
                  }
                </IonApp>
                </TableContext.Provider>
              </StorageContextt.Provider>
            </StorageContext.Provider>
          </UserContext.Provider>
        </PfContext.Provider>
      </ViewModeContext.Provider>
    </DebugContext.Provider>
   
    </>
  );
};

export default App;
