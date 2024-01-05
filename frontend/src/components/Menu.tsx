import { useContext } from "react";
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonToast,
  useIonToast,
  IonBadge,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import { useLocation } from "react-router-dom";
import {
  homeOutline,
  homeSharp,
  notifications,
  idCardSharp,
  calendarSharp,
  listSharp,
  statsChartSharp,
  menuSharp,
  bookSharp,
} from "ionicons/icons";
import "./Menu.css";

import {
  AppPage,
  UserPrivileges,
  OrderNotification,
  SidebarProps,
  ViewMode,
} from "./interfaces/interfaces";
import { useEffect, useState } from "react";
import { LogoutMenuItem, LoginMenuItem } from "./theme/MenuItem";
import { LocalNotifications } from "@capacitor/local-notifications";

import logo from "./assets/logo.png";
import { apiUrl, serverUrl } from "../config";
import { UserContext } from "./util/SessionContext";
import { StorageContextt } from "./util/StorageContext";
import { deleteUserSessionQry } from "./util/sqlQueries";

const appPages: AppPage[] = [
  {
    title: "Home",
    url: "/home",
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: "Menu",
    url: "/menu",
    iosIcon: bookSharp,
    mdIcon: bookSharp,
  }
];

const managerPages: AppPage[] = [
  {
    title: "Orders",
    url: "/admin/orders",
    iosIcon: notifications,
    mdIcon: notifications,
  },   
  {
    title: "Sales",
    url: "/sales",
    iosIcon: statsChartSharp,
    mdIcon: statsChartSharp,
  },
  {
    title: "Manager",
    url: "/manager",
    iosIcon: listSharp,
    mdIcon: listSharp,
  },

  {
    title: "Tables",
    url: "/tables",
    iosIcon: idCardSharp,
    mdIcon: idCardSharp,
  },
  {
    title: "Activity Manager",
    url: "/activity_manager",
    iosIcon: calendarSharp,
    mdIcon: calendarSharp,
  },
/*   {
    title: "Sessions",
    url: "/session",
    iosIcon: calendarSharp,
    mdIcon: calendarSharp,
  }, */
];

const Menu = (props: SidebarProps) => {
  const [notifs, setNotifs] = useState(0);
  const [showNotif, setShow] = useState(false);
  const [present] = useIonToast();
  const user = useContext(UserContext);
  const store = useContext(StorageContextt);

  const location = useLocation();

  async function signOut() {
    //await props.storage!.set("user", null);
    await props.db?.execQuery(deleteUserSessionQry);
    //await store?.store?.set("userSession", null);
    const url = apiUrl + "/logout";
    const response = await fetch(url, {
      credentials: "include",
      method: "POST",
      headers: {
        Authorization: "Bearer " + user?.token,
      },
    });
    const data = await response.json();
    if (data) {
      console.log(data);
      props?.setActive!(false);
      props?.setUser!(null);
    }
  }

  const presentToast = (msg: string) => {
    present({
      message: msg,
      duration: 1500,
      position: "top",
    });
  };

  const scheduleNotification = (data: OrderNotification) => {
    LocalNotifications.checkPermissions().then(async (result) => {
      if (result.display === "granted") {
        // permission granted
        await LocalNotifications.schedule({
          notifications: [
            {
              title: `Order ${data.id}`,
              body: data.message,
              id: 1,
              summaryText: data.message,
            },
          ],
        });
      } else {
        // permission not granted
        presentToast("You should enable permissions!");
        LocalNotifications.requestPermissions();
      }
    });
  };

  async function handleViewChange(view:ViewMode){
    props.setMode(view)
    await store?.store?.set("view", view);
    await fetch(`${apiUrl}/product_manager/view`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + user?.token,
      },
      body: JSON.stringify({view: view})
    })
  }

  useEffect(() => {
    if (props.active) console.log("User logged in");
    else console.log("User logged out");
  }, [props.active]);

  useEffect(() => {
    user?.socket?.on("new_order", (data: OrderNotification) => {
      //console.log('Received data2:');
      console.log(data);
      if (
        user?.role === UserPrivileges.Admin ||
        user?.role === UserPrivileges.Manager
      ) {
        setShow(true); //only notify admins or managers
        scheduleNotification(data);
        setNotifs((prev) => prev + 1);
      }
    });
    return () => {
      user?.socket?.disconnect(); // Disconnect the socket when the component unmounts
    };
  }, [user?.socket]);

  useEffect(() => {
    props.setMode(ViewMode.Classic)
  },[])

  return (
    <>
      <IonToast
        cssClass="ion-text-center"
        isOpen={showNotif}
        position="top"
        message="New order received!"
        duration={3000}
        onDidDismiss={() => setShow(false)}
      />
          
      <IonMenu  class="ion-margin-top" contentId="main" type="overlay">
        <IonContent>
          <IonList id="inbox-list">
            <IonListHeader>
            <img
                src={logo}
                alt="logo"
                width={80}
                height={80}
                className="logoheader"
              />
            </IonListHeader>
            {appPages.map((appPage, index) => {
              return (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem
                    className={
                      location.pathname === appPage.url ? "selected" : ""
                    }
                    routerLink={appPage.url}
                    routerDirection="none"
                    lines="none"
                    detail={false}
                  >
                    <IonIcon
                      slot="start"
                      ios={appPage.iosIcon}
                      md={appPage.mdIcon}
                    />
                    <IonLabel>{appPage.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              );
            })}
            {user ? (
              <LogoutMenuItem signout={signOut} />
            ) : (
              <LoginMenuItem locationPath={location.pathname} />
            )}
          </IonList>

          {user?.role === UserPrivileges.Admin ||
          user?.role === UserPrivileges.Manager ? (
            <>
              <IonList>
                <IonListHeader>Manager</IonListHeader>
                {managerPages.map((page, index) => {
                  return (
                    <IonItem
                      key={index}
                      lines="none"
                      routerLink={page.url}
                      routerDirection="forward"
                      detail={false}
                    >
                      <IonIcon
                        slot="start"
                        ios={page.iosIcon}
                        md={page.mdIcon}
                      />
                      <IonLabel>{page.title}</IonLabel>
                      {index === 0 ? (
                        <IonLabel class="ion-justify-end ion-text-end">
                          <IonBadge color={(notifs === 0) ? "" : "danger"} slot="end">{notifs}</IonBadge>
                          </IonLabel>
                      ) : (
                        <></>
                      )}
                    </IonItem>
                  );
                })}
              </IonList>
            </>
          ) : (
            <></>
          )}
                  <IonItem >
                    <IonLabel>Mode</IonLabel>
                    <IonSelect interface="popover" onIonChange={(e) => handleViewChange(e.target.value)}>
                      <IonSelectOption value={ViewMode.Classic}>Classic</IonSelectOption>
                      <IonSelectOption value={ViewMode.Resto}>Resto</IonSelectOption>
                      <IonSelectOption value={ViewMode.Hotel}>Hotel</IonSelectOption>
                      <IonSelectOption value={ViewMode.Classic2}>Original</IonSelectOption>
                    </IonSelect>
                  </IonItem>
        </IonContent>
      </IonMenu>
    </>
  );
};

export default Menu;
