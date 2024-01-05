import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonRow,
  IonToolbar,
} from "@ionic/react";
import React from "react";

export default function ActivityMenu() {
  return (
    <IonPage>
      <IonHeader /* hidden={pf.isNative} */>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonRow
        class="ion-justify-content-center fadeIn"
        style={{ width: "100%", marginTop: "-10%" }}
      >
        <div className="containerBadge ">
          <div className="coming-soon-badge">
            <p className="badge-text">Coming soon</p>
          </div>
        </div>
      </IonRow>
    </IonPage>
  );
}
