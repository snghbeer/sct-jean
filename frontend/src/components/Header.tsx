import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
} from "@ionic/react";
//import { NotificationHeader } from "./interfaces/interfaces";
import {  menuOutline } from "ionicons/icons";

export const Header = () => {

  return (
    <IonHeader>
      <IonToolbar >
        <IonButtons slot="start">
          <IonMenuButton menu="start" >
            <IonIcon aria-hidden={true} size="large" icon={menuOutline}>
            </IonIcon>
          </IonMenuButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};
