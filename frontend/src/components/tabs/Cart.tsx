import { useState, useEffect, useContext } from "react";
import {
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonCol,
  IonGrid,
  IonRow,
  IonInput,
  IonIcon,
  IonToast,
  IonContent,
  useIonAlert,
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonAlert,
} from "@ionic/react";
import { CartPropItems } from "../interfaces/interfaces";
import { arrowBackSharp, trashOutline } from "ionicons/icons";
import { apiUrl } from "../../config";
import { CartContext } from "../util/CartContext";
import Page from "../pages/Page";
import { Link } from "react-router-dom";
import { PaySession } from "../interfaces/PaymentInterface";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { PlusMinusButton } from "../plusMinusButton";
import { Keyboard } from "@capacitor/keyboard";
import { RecordItemComponent } from "../recordItemComponent";
import cartSharp from "../assets/cart-sharp.svg";

const Cart = (props: CartPropItems) => {
  const { updated, setUpdated } = useContext(CartContext);
  const [emptyCartAlert, setAlert] = useState(false);

  const [total, setTotal] = useState(0);
  const [registerSucces, setSucces] = useState(false);
  const [presentAlert] = useIonAlert();

  function openNewWindow(url: string, aSession: PaySession) {
    var paymentWindow = window.open(url, "_blank");
    var checkPaymentInterval = setInterval(async function () {
      if (paymentWindow && paymentWindow.closed) {
        clearInterval(checkPaymentInterval);
        //console.log("Payment successful!");
        const response = await fetch(
          `${apiUrl}/pay/payment-status?sid=${aSession?.id}`
        );
        const data = await response.json();
        //setSession(data.session)
      }
    }, 1000);
  }

  const fetchPaymentSession = async () => {
    try {
      const response = await fetch(`${apiUrl}/pay/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch checkout session");
      }
      const data = await response.json();
      console.log(data);
      //setSession(data.session);
      //setpaid(data.session.payment_status)
      if (Capacitor.getPlatform() === "web") {
        openNewWindow(data.url, data.session);
      } else await Browser.open({ url: data.url });
    } catch (error) {
      console.error(error);
    }
  };

  async function validateCart() {
    if (!props.cart.isEmpty()) {
      const url = `${apiUrl}/product_manager/product/sell`;
      const records = props.cart.toRecords();
      const record = {
        total: total.toFixed(2),
        items: records,
        table: parseInt(props.table!),
      };
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + (props.user?.token || ""),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: record,
          }),
        });

        const data = await response.json();
        //console.log(data);

        if (data.success) {
          setSucces(true);
          props.cart.clearCart();
        }
      } catch (err) {
        presentAlert({
          header: "Something went wrong",
          subHeader: "Try again later",
          buttons: ["OK"],
        });
      }
    } else {
      setAlert(true)
     /*  presentAlert({
        cssClass: "custom-alert",
        header: "Your cart is empty",
        message: `
        To validate your order, you need to order something
        <img className='cartIcon' src="${cartSharp}" alt="cartEmpty"/>
      `,
        buttons: ["OK"],
      }); */
    }
  }

  function removeFromCart(aProductName: string) {
    props.cart.removeFromCart(aProductName);
    props.setUpdated!(true);
  }

  function updateAmount(aProductName: string, amount: number) {
    props.cart.updateItem(aProductName, amount);
    props.setUpdated!(true);
  }

  function increaseItem(aProductName: string) {
    props.cart.increaseItem(aProductName);
    props.setUpdated!(true);
  }

  function decreaseItem(aProductName: string) {
    props.cart.decreaseItem(aProductName);
    props.setUpdated!(true);
  }

  function calculateTotal() {
    return props.cart.calculateTotal();
  }

  function addNote(aProductName: string, note: string) {
    props.cart.addNote(aProductName, note);
    props.setUpdated!(true);
  }

  useEffect(() => {
    setTotal(calculateTotal());
  }, []);

  useEffect(() => {
    if (updated) {
      //props.setUpdated!(false);
      setUpdated!();
      setTotal(calculateTotal());
    }
  }, [updated]);

  useEffect(() => {
    if (registerSucces) {
      setTotal(calculateTotal());
    }
  }, [registerSucces]);

  const content = (
    <>
      <IonAlert
        isOpen={emptyCartAlert}
        onDidDismiss={() => setAlert(false)}
        cssClass="custom-alert"
        header={"Your cart is empty"}
        message={`
        To validate your order, you need to order something
        <img 'className="cartIcon"' src="${cartSharp}" alt="cartEmpty"/>
      `}
        buttons={["OK"]}
      />

      <IonToast
        isOpen={registerSucces}
        position="top"
        message="Your order has been processed successfully!"
        duration={3000}
        onDidDismiss={() => setSucces(false)}
        buttons={[
          {
            text: "Dismiss",
            role: "cancel",
          },
        ]}
      />
      <IonCard class="ion-margin-top">
        <IonCardHeader>
          <IonCardTitle>
            <h1>Table {props.table}</h1>
          </IonCardTitle>
        </IonCardHeader>
      </IonCard>
      <IonList inset>
        <IonGrid>
          <IonRow style={{ width: "100%" }} class="">
            <IonCol size="2"></IonCol>
            <IonCol size="4" sizeXs="3" class="ion-padding-start">
              Order
            </IonCol>
            <IonCol size="2" sizeMd="2" sizeXs="2">
              Quantity
            </IonCol>
            <IonCol
              size="2"
              sizeMd="2"
              sizeXs="2"
              class="ion-text-end ion-padding-end "
            >
              Price
            </IonCol>
            <IonCol size="auto" sizeXs="1"></IonCol>

            <IonCol size="auto" sizeXs="1"></IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid class="checkoutItems">
          {props.cart.toArray()!.map((item, index) => {
            return ( 
              <IonItem key={index}>
                <IonRow class="orderRow" style={{ width: "100%" }}>
                  <IonCol size="2">
                    {" "}
                    <img
                      src={item[1]!.product.image}
                      className="avatar"
                      alt="avatar"
                    />
                  </IonCol>
                  <IonCol size="4" sizeXs="3">
                    <RecordItemComponent addNote={addNote} item={item} />
                  </IonCol>
                  <IonCol
                    size="2"
                    sizeMd="2"
                    sizeXs="2"
                    class="ion-text-center ion-align-items-center"
                  >
                    <IonInput
                      className="quantityInput"
                      style={{ border: "1px solid" }}
                      type="number"
                      min={1}
                      value={item[1]!.numberOfItems}
                      onIonBlur={(ev) => {
                        updateAmount(item[1]!.product.name, +ev.target.value!);
                      }}
                    ></IonInput>
                  </IonCol>
                  <IonCol class="ion-text-end" size="2" sizeMd="2" sizeXs="2">
                    {item[1]!.product.price.toFixed(2)}
                  </IonCol>
                  <IonCol class="ion-align-items-center">
                    <PlusMinusButton
                      class="checkoutAction orderAction"
                      increaseFunction={() =>
                        increaseItem(item[1]!.product.name)
                      }
                      decreaseFunction={() =>
                        decreaseItem(item[1]!.product.name)
                      }
                    />
                  </IonCol>
                  <IonCol size="auto" sizeXs="1" class="ion-text-end">
                    <IonIcon
                      onClick={() => removeFromCart(item[1]!.product.name)}
                      size={window.innerWidth > 400 ? "large" : "small"}
                      icon={trashOutline}
                    ></IonIcon>
                  </IonCol>
                </IonRow>
              </IonItem>
            );
          })}
        </IonGrid>
      </IonList>
      <IonCard class="ion-padding">
        <IonRow>
          <IonCol size="8" sizeXs="4" class="ion-margin-start">
            <h1>Subtotal</h1>
          </IonCol>

          <IonCol></IonCol>
          <IonCol></IonCol>
          <IonCol class="ion-margin-end ion-text-end">
            <h1>{total.toFixed(2)}</h1>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="8" sizeXs="4" class="ion-margin-start">
            <h1>VAT</h1>
          </IonCol>

          <IonCol></IonCol>
          <IonCol></IonCol>
          <IonCol class="ion-margin-end ion-text-end">
            <h1>{(total * 0.21).toFixed(2)}</h1>
          </IonCol>
        </IonRow>
        <IonRow
          style={{ borderTop: "1px solid black" }}
          class="ion-margin-start "
        >
          <IonCol size="8" sizeXs="4">
            <h1>Total</h1>
          </IonCol>

          <IonCol></IonCol>
          <IonCol></IonCol>
          <IonCol
            class="ion-margin-end ion-text-end"
            style={{ color: "black" }}
          >
            <h1>{(total * 1.21).toFixed(2)}</h1>
          </IonCol>
        </IonRow>
      </IonCard>
      <IonRow class="cart_card ion-padding ion-justify-content-center">
        <button onClick={validateCart} className="btn41-43 btn-43 zzz_btn">
          Pay
        </button>
      </IonRow>
    </>
  );

  return (
    <IonContent id="cartPage" class="ion-padding slide-in-enter">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cart</IonTitle>
          <IonButtons slot="start">
            <Link to="menu">
              <IonIcon icon={arrowBackSharp} size="large" />
            </Link>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {content}
    </IonContent>
  );
};

export default Cart;
