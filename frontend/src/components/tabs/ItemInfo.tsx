import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
} from "@ionic/react";
import { enterAnimation, leaveAnimation } from "../util/helpFunctions";
import { IProductInfo } from "../interfaces/interfaces";

function ItemInfo(props: IProductInfo) {
  return (
    <IonModal
      isOpen={props.isOpen}
      enterAnimation={enterAnimation}
      leaveAnimation={leaveAnimation}
      onDidDismiss={() => props.setIsOpen(false)}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Info</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => props.setIsOpen(false)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem >
          <IonThumbnail slot="start">
            <img alt="Silhouette"
              className="productInfoImg"
              src={props.item?.image}
            />
          </IonThumbnail>
          <IonLabel>{props.item?.name}</IonLabel>
        </IonItem>
        <p className="ion-text-center ion-text-md-start">
            {props.item?.description}
        </p>
        <IonAccordionGroup>
          <IonAccordion value="first">
            <IonItem slot="header" class="itemAccordionLabel">
              <IonLabel>Composition</IonLabel>
            </IonItem>
            {props.item?.composition?.map((comp, idx) => {
              return(
                <div key={idx} className="ion-padding" slot="content">
                 {comp}
                </div>
              )
            })}
          </IonAccordion>
        </IonAccordionGroup>
      </IonContent>
    </IonModal>
  );
}

export default ItemInfo;
