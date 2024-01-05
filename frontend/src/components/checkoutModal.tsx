import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonRow,
  IonCol,
  IonGrid,
} from "@ionic/react";
import { useEffect } from "react";
import { ICheckoutProps } from "./interfaces/interfaces";
import { enterAnimation, leaveAnimation, round } from "./util/helpFunctions";

export const CheckoutModal = (props: ICheckoutProps) => {

  async function payNow() {
    await props.fetchPaymentSession!(props.session?.url!);
  }

  useEffect(() => {
    //console.log(props.cartItems)
  },[])

  return (
    <IonModal
      enterAnimation={enterAnimation}
      leaveAnimation={leaveAnimation}
      onDidDismiss={() => props.cancelOrder()}
      isOpen={props.isOpen}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Checkout</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRow>
          <IonCol>
            <IonHeader>
              <b>Product</b>
            </IonHeader>
          </IonCol>
          <IonCol size="3" class="ion-text-end">
            <IonHeader>
              <b>Quantity</b>
            </IonHeader>
          </IonCol>
        </IonRow>
        <IonGrid class="checkoutList">
          {
            props?.cartItems?.map((item) => {
              return(
                <IonRow>
                  <IonCol>
                  {item[1]?.product.name}
                  </IonCol>
                  <IonCol class="ion-text-end" size="3">
                     {item[1]?.numberOfItems}
                  </IonCol>

                </IonRow>
              )
            })
          }
        </IonGrid>
          <div className="checkoutFooter">
          <IonRow style={{ marginTop: "10%", maxHeight: "30px" }}>
          <IonCol>
            <p>Subtotal: </p>
          </IonCol>
          <IonCol class="ion-text-end">
            {" "}
            <p> € {props.total.toFixed(2)}</p>
          </IonCol>
        </IonRow>
        <IonRow style={{ maxHeight: "30px" }}>
          <IonCol>
            <p className="p_vat">VAT: </p>
          </IonCol>
          <IonCol class="ion-text-end">
            {" "}
            <p className="p_vat"> € {round(props.total * 0.21)}</p>
          </IonCol>
        </IonRow>
        <IonRow style={{ marginBottom: "10%", maxHeight: "30px" }}>
          <IonCol>
            <p>Total: </p>
          </IonCol>
          <IonCol class="ion-text-end">
            {" "}
            <p> € {(props.total + round(props.total * 0.21)).toFixed(2)}</p>
          </IonCol>
        </IonRow>
        <IonRow class="ion-justify-content-center">
          <button
            onClick={payNow}
            style={{ maxWidth: "150px", width: "100%" }}
            className="btn41-43 btn-43 zzz_btn"
          >
            Pay
          </button>
        </IonRow>
          </div>
      </IonContent>
    </IonModal>
  );
};
