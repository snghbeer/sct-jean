import { RecordDTO } from "./interfaces/interfaces";
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonLabel,
  IonItem,
  IonCard,
  IonList,
  IonRow,
  IonCol,
  createAnimation,
} from "@ionic/react";
import { enterAnimation, leaveAnimation, round } from "./util/helpFunctions";
import { Printer, PrinterOriginal, PrintOptions } from '@awesome-cordova-plugins/printer'
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { apiUrl } from "../config";

export const DetailedRecordPage = (props: RecordDTO) => {

  async function print(){
    try{
      if(Capacitor.getPlatform() === "web") window.print()
      else await Printer.print('<b>Hello Cordova!</b>')
    }
    catch(err){
      console.error(err);
    }
  }

  async function openInAppBrowser() {
    await Browser.open({ url: `${apiUrl}/product_manager/records/${props._id}` });
  }
  
  return (
    <IonModal 
    enterAnimation={enterAnimation}
    leaveAnimation={leaveAnimation}
    isOpen={props.isOpen}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Details</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => props.setOpen!(false)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {false ? (
          <>
            <IonSpinner name="crescent"></IonSpinner>
          </>
        ) : (
          <IonCard className="ion-padding ">
            <IonItem>
              <IonLabel>Id</IonLabel>
              <IonLabel class="ion-text-end">{props._id}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Ordered on</IonLabel>
              <IonLabel class="ion-text-end">{new Date(props.date).toLocaleString()}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Table</IonLabel>
              <IonLabel class="ion-text-end">{props.by}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Paid</IonLabel>
              <IonLabel class="ion-text-end">{props.confirmed ? "Yes" : "No"}</IonLabel>
            </IonItem>
            <IonList class="recordList">
              <IonRow>
                <IonCol size="8" sizeXs="4">
                  <IonLabel>Products</IonLabel>
                </IonCol>
                <IonCol class="ion-text-end">
                  <IonLabel>Quantity</IonLabel>
                </IonCol>
                <IonCol class="ion-text-end">
                  <IonLabel>Price/u</IonLabel>
                </IonCol>
              </IonRow>
              {/*Loop over list of item in an order*/}
              {props.records?.map((product, idx) => {
                return (
                  <IonItem key={idx}>
                    <IonCol size="8" sizeXs="4">
                      <IonLabel>{product.product}</IonLabel>
                    </IonCol>
                    <IonCol class="ion-text-end">
                      <IonLabel>{product.amount}</IonLabel>
                    </IonCol>
                    <IonCol class="ion-text-end">
                      <IonLabel>{product.price}</IonLabel>
                    </IonCol>
                  </IonItem>
                );
              })}
            </IonList>
            <IonItem>
                <IonLabel>Subtotal</IonLabel>
                <IonLabel class="ion-text-end">{round(props.total*0.79)}</IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel>Vat</IonLabel>
                <IonLabel class="ion-text-end">{round(props.total*0.21)}</IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel>Total</IonLabel>
                <IonLabel class="ion-text-end">{props.total}</IonLabel>
            </IonItem>
          </IonCard>
        )}
        <IonRow class="ion-float-right ion-margin-horizontal ion-justify-content-center ion-nowrap">
          <IonCol ><button onClick={props.validate} className="btn41-43 btn-43 zzz_btn">Validate</button></IonCol>
{/*           <IonCol ><button onClick={openInAppBrowser} className="btn41-43 btn-43 zzz_btn">Print</button></IonCol>
 */}
        </IonRow>
      </IonContent>
    </IonModal>
  );
};
