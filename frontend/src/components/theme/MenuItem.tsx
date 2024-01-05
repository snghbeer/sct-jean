import {
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuToggle,
} from "@ionic/react";
import {
  logInOutline,
  logInSharp,
  logOutOutline,
  logOutSharp,
} from "ionicons/icons";
import { ActiveSessionProp, LocationProp } from "../interfaces/interfaces";


export const LoginMenuItem = (props: LocationProp) => {
  return (
    <IonMenuToggle autoHide={false}>
      <IonItem
        className={props.locationPath === "/page/login" ? "selected" : ""}
        routerLink="/page/login"
        routerDirection="none"
        lines="none"
        detail={false}
      >
        <IonIcon slot="start" ios={logInOutline} md={logInSharp} />
        <IonLabel>Login</IonLabel>
      </IonItem>
    </IonMenuToggle>
  );
};

export const LogoutMenuItem = (props: ActiveSessionProp) => {

  return (
    <IonMenuToggle autoHide={false}>
      <IonItem lines="none" button onClick={() => {
        console.log("Logging out");
        props.signout!();
      }}
        routerLink="/"
        routerDirection="none"
      >
        <IonIcon slot="start" ios={logOutOutline} md={logOutSharp} />
        <IonLabel>Logout</IonLabel>
      </IonItem>
    </IonMenuToggle>
  );
};
