import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonToolbar,
} from "@ionic/react";
import React, { useContext } from "react";
import hotel from '../assets/hotel.jpg'
import { constructSharp, refreshSharp } from "ionicons/icons";
import { DebugContext, TableContext } from "../util/CartContext";
import { StorageContextt } from "../util/StorageContext";

export default function HotelInfo() {
  const debugContext = useContext(DebugContext);
  const tableContext = useContext(TableContext);
  const storage = useContext(StorageContextt);

  async function resetSession(){
    storage?.store?.set("paymentMethod", null)
  }

  return (
    <IonPage>
      <IonHeader /* hidden={pf.isNative} */>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="vertical-center">
          <IonRow
            class="ion-justify-content-center"
            style={{ width: "100%", height: "80%" }}
          >
            <IonCard class="hotelInfoCard fadeIn">
              <img
                className="hotelInfoImg"
                alt="Silhouette of mountains"
                src={hotel}
              />
              <IonCardHeader>
                <IonCardTitle>Wifi</IonCardTitle>
                <IonCardSubtitle>dDQSD5221DQSD4dqsO</IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent>
              <IonCardTitle>Room number</IonCardTitle>
              <IonCardSubtitle>{tableContext.table}</IonCardSubtitle>
              <IonCardTitle>e-Mail</IonCardTitle>
              <IonCardSubtitle>info@hotel.com</IonCardSubtitle>

              <IonButton
                class="ion-float-end"
                onClick={debugContext.setDebugMode}
              >
                <IonIcon
                  icon={constructSharp}
                />
              </IonButton>
              <IonButton
                class="ion-float-end"
                onClick={resetSession}
              >
                <IonIcon
                  icon={refreshSharp}
                />
              </IonButton>
              </IonCardContent>
            </IonCard>
          </IonRow>
        </div>
      </IonContent>
    </IonPage>
  );
}
