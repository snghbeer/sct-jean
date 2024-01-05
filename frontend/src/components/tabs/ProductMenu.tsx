import { useContext, useEffect, useRef, useState } from "react";
import {
  IonCol,
  IonList,
  useIonAlert,
  RefresherEventDetail,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCardTitle,
  IonContent,
  IonicSlides,
  IonIcon,
  IonItem,
  IonHeader,
  IonMenu,
  IonSplitPane,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonToast,
  IonAlert,
  IonSpinner,
  IonBadge,
  IonMenuToggle,
  IonPage,
  IonButton,
  IonBackButton,
  IonButtons,
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import {
  CartPropItems,
  CategoryOfCategory,
  CategoryProps,
  DataObject,
  DetailedPageProps,
  IPaySessionMethod,
  ISliderImage,
  PayMethod,
} from "../interfaces/interfaces";
import {
  arrowUpCircleSharp,
  cartSharp,
  chevronDownCircleOutline,
  constructSharp,
  informationCircleSharp,
  readerOutline,
  trashOutline,
} from "ionicons/icons";
import useQueryParam from "../util/useQryParameters";
/* import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, EffectFade } from "swiper";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";

import "@ionic/react/css/ionic-swiper.css"; */
import { CategoryNav } from "./categoryNav";
import { PlusMinusButton } from "../plusMinusButton";
import { RecordItemComponent } from "../recordItemComponent";
import { StorageContextt } from "../util/StorageContext";
import { TableConfigComponent } from "../configTableComponent";
import { apiUrl, stripeUrl } from "../../config";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { PaySession } from "../interfaces/PaymentInterface";
import ItemInfo from "./ItemInfo";
//import { Howl } from "howler";
import CustomSegment from "./CustomSegment";
import CustomInput from "../CustomInput";
import {
  groupCategoriesBySuperCategory,
  isNative,
  isTablet,
} from "../util/helpFunctions";
import { DebugContext, PfContext, TableContext } from "../util/CartContext";
import { CheckoutModal } from "../checkoutModal";

const MenuPage = (props: CartPropItems) => {
  const [presentAlert] = useIonAlert();
  const [orderProcessing, setProcess] = useState(false);

  const [selectedCategory, setCategory] = useState<string | undefined>("all");
  const [selectedSuperCategory, setSuperCategory] = useState<
    CategoryOfCategory | undefined
  >();

  const [items, setItems] = useState<DetailedPageProps[]>();
  const [categories, setCategories] = useState<CategoryProps[]>([]);

  const [cartItems, setCartItems] = useState(props.cart.toArray());
  const [total, setTotal] = useState(0);
  const contentRef = useRef<HTMLIonContentElement | null>(null);

  const [selectedCat, setCat] = useState<CategoryOfCategory>(
    CategoryOfCategory.Food
  );
  const [emptyCartAlert, setAlert] = useState(false);
  const [registerSucces, setSucces] = useState(false);

  const [paySession, setCanPay] = useState<PaySession | null | undefined>(null);

  const store = useContext(StorageContextt);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState<number | undefined>(0);

  const pff = useContext(PfContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [addedItem, setAddedItem] = useState<string|null|undefined>(null);
  const tableContext = useContext(TableContext);

  const [payMethod, setPaymethod] = useState<IPaySessionMethod|undefined>(/* { method: null, id: null} */)

  function selectPaymentMethod(aMethod: PayMethod){
    setPaymethod((prevState) => ({ ...prevState!, method: aMethod }));
  }


  const searchByName = (array: CategoryProps[], name: string) => {
    return array.find((item) => item.name === name);
  };

  function filterProductsBySuperCategory(
    products: DetailedPageProps[],
    superCategoryId: string
  ) {
    return products.filter((product) => {
      // Find the category object to which the product belongs
      const category = categories.find(
        (cat) => cat._id === product.item.category
      );

      // Check if the category's superCategory field matches the given superCategoryId
      return category?.superCategory === superCategoryId;
    });
  }

  useEffect(() => {
    if (selectedSuperCategory) {
      const selectedSuperCat = searchByName(
        props.superCategories!,
        selectedSuperCategory
      );
      const filteredProducts = filterProductsBySuperCategory(
        props.items!,
        selectedSuperCat?._id!
      );
      setItems(filteredProducts);
    }
  }, [selectedSuperCategory]);

  const scrollToTop = () => {
    contentRef.current && contentRef.current.scrollToTop(500);
  };

  function calculateTotal() {
    setTotal(props.cart.calculateTotal());
  }

  //e.g. http://localhost:8100/menu?table=105
  //we use query parameters to identify non-users that want to order
  const [table] = useQueryParam("table", "102");

  const fetchPaymentSession = async (url: string) => {
    try {
      if (Capacitor.getPlatform() === "web") {
        openNewWindow(url);
      } else await openInAppBrowser(url);
    } catch (error) {
      console.error(error);
    }
  };

  async function openInAppBrowser(url: string) {
    await Browser.open({ url: url });
    Browser.addListener("browserFinished", async () => {
      await updatePaySession();
    });
  }

  function openNewWindow(url: string) {
    var paymentWindow = window.open(url, "_blank");
    var checkPaymentInterval = setInterval(async function () {
      if (paymentWindow && paymentWindow.closed) {
        clearInterval(checkPaymentInterval);
        await updatePaySession();
      }
    }, 1000);
  }

  async function updatePaySession() {
    try {
      const checkoutSession = JSON.parse(
        await store?.store?.get("checkoutSession")
      );
      if (checkoutSession) {
        const response = await fetch(
          `${stripeUrl}/stripe/payment-status?id=${checkoutSession.id}`
        );
        const data = await response.json();
        if (data.session.payment_status === "paid") {
          setSucces(true);
          setIsOpenModal(false);
        } else {
          await fetch(checkoutSession.cancel_url);
          setIsOpenModal(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCanPay(null);
      props.cart.clearCart();
      updateCartItems();
      props.setUpdated!(true);
      setTimeout(() => {
      }, 2500);
    }
  }

  function round(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  async function validateCart() {
    if(!payMethod) return  presentAlert({
      header: "Payment method missing",
      subHeader: "Please select a payment method",
      buttons: ["OK"],
    });
    
    if (isEmpty()) setAlert(true);
    else {
      const records = props.cart.toRecords();
      const vat = round(0.21 * total);
      const realTotal = total + vat;
      const record = {
        total: round(realTotal), //btw/tva/vat included
        items: records,
        table: parseInt(tableContext.table || table),
      };
      if(payMethod.method === PayMethod.CARD){
        const url = `${apiUrl}/product_manager/product/sell`;
        try {
          setProcess(true);
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: record,
            }),
          });

          const data = await response.json();
          const dataUrl = data.response;
          //console.log(dataUrl);

          if (data.success) {
            console.log(data);
            setCanPay(dataUrl.session);
            setIsOpenModal(true);
            await store?.store?.set(
              "checkoutSession",
              JSON.stringify(dataUrl.session)
            );
            await store?.store?.set("paymentMethod", JSON.stringify({method: payMethod.method, id: null}));
            setProcess(false);
          } else {
            presentAlert({
              header: data.message,
              buttons: ["OK"],
            });
          }
        } catch (err) {
          console.log(err);
          presentAlert({
            header: "Something went wrong",
            subHeader: "Try again later",
            buttons: ["OK"],
          });
        }
      } else {
        const url = `${apiUrl}/product_manager/product/cash`;
        setProcess(true);
        const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {...record, id: payMethod?.id},
            }),
        });
        const data = await response.json();
        if (data.success) {
          await store?.store?.set("paymentMethod", JSON.stringify({
            method: payMethod.method,
            id: data.orderId
          }));
          setProcess(false)
          setSucces(true);

          setCanPay(null);
          props.cart.clearCart();
          updateCartItems();
          props.setUpdated!(true);
        }
      }
    }
  }

  function removeFromCart(aProductName: string) {
    props.cart.removeFromCart(aProductName);
    updateCartItems();
    props.setUpdated!(true);
  }

  const updateCartItems = () => {
    setCartItems(props.cart.toArray());
    calculateTotal();
  };

  const addToCart = (aProduct: DataObject, clickedElement: HTMLElement, promo?: number) => {
    props.cart.addToCart(1, aProduct, promo);
    updateCartItems();
    props.setUpdated!(true);
    
    setAddedItem(aProduct._id);

    setTimeout(() => {
      setAddedItem(null);
    }, 500);
    //sound.play();
  };

  const updateItemQty = (aProductName: string, qty: number | string) => {
    // Convert qty to a number if it is a string
    const numericQty = typeof qty === "string" ? parseInt(qty, 10) : qty;

    // Check if numericQty is a valid number
    if (isNaN(numericQty)) removeFromCart(aProductName);

    if (numericQty === 0) {
      removeFromCart(aProductName);
    } else {
      props.cart.updateItem(aProductName, numericQty);
      updateCartItems();
      props.setUpdated!(true);
    }
  };

  function increaseItem(aProductName: string) {
    props.cart.increaseItem(aProductName);
    updateCartItems();
    props.setUpdated!(true);
  }

  function decreaseItem(aProductName: string) {
    props.cart.decreaseItem(aProductName);
    updateCartItems();
    props.setUpdated!(true);
  }

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(async () => {
      await props?.fetchCats!();
      await props?.fetchItems!();
      // Any calls to load data go here
      //await getItems();
      event.detail.complete();
    }, 1000);
  }

  function addNote(aProductName: string, note: string) {
    props.cart.addNote(aProductName, note);
    props.setUpdated!(true);
  }

  function isEmpty() {
    return props.cart.isEmpty();
  }

  function showInfo(idx: number) {
    setSelectedItem(idx);
    setIsOpen(true);
  }

  async function cancelOrder() {
    const checkoutSession = JSON.parse(
      await store?.store?.get("checkoutSession")
    );
    if(checkoutSession && paySession){
      await fetch(checkoutSession.cancel_url);
      setIsOpenModal(false);
      setCanPay(null);
      props.cart.clearCart();
      updateCartItems();
      props.setUpdated!(true);
    }
  }

  useEffect(() => {
    async function checkSessionPayMethod(){
      const pmRaw = await store?.store?.get("paymentMethod")
      if(pmRaw){
        const pm = JSON.parse(pmRaw);
        setPaymethod(pm)
      }
    }

    calculateTotal();
    checkSessionPayMethod()
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    setItems(props.items);
  }, [props.items]);

  useEffect(() => {
    if (props.categories) {
      const selectedSuperCategory = searchByName(
        props.superCategories!,
        selectedCat
      );
      setCategories(
        props.categories!.filter(
          (cat) => selectedSuperCategory?._id === cat.superCategory
        )
      );
    }
  }, [props.categories]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setItems(props.items!);
    } else {
      setItems(
        props.items!.filter((item) => item?.item.category === selectedCategory)
      );
    }
  }, [selectedCategory]);

  const itemPromo = (item: DataObject) =>
    props.promotions!.find((promo) => promo.product === item._id);

  return (
    <IonContent id="menuPage" class={`menuContainer `} fullscreen>
      <IonSplitPane when={windowWidth >= 1560} contentId="orderBar">
        <IonMenu
          type="overlay"
          class="orderBar"
          side="end"
          contentId="orderBar"
        >
          <IonHeader>
            <IonToolbar class="orderToolbar">
              <IonTitle class="ion-text-center">Basket</IonTitle>
            </IonToolbar>
          </IonHeader>
          <div>
            <div className="orderListContainer">
              <div className="orderList" style={{ paddingTop: "0.25rem" }}>
                {cartItems?.map((item, index) => {
                  return (
                    <IonItem class="orderItem ion-no-padding" key={index}>
                      <IonRow class="orderRow" style={{ width: "100%" }}>
                        <IonCol size="5" class="itemName">
                          <RecordItemComponent addNote={addNote} item={item} />
                        </IonCol>
                        <IonCol
                          size="2"
                          sizeXl="2"
                          class="itemPrice ion-text-end"
                        >
                          {round(item[1]?.product.price!)}
                        </IonCol>
  
                        <CustomInput
                          product={item[1]!.product.name!}
                          value={item[1]!.numberOfItems}
                          setValue={updateItemQty}
                        />
                        <IonCol size="auto" class="itemQuantity">
                          <PlusMinusButton
                            class="orderAction"
                            increaseFunction={() =>
                              increaseItem(item[1]!.product.name)
                            }
                            decreaseFunction={() =>
                              decreaseItem(item[1]!.product.name)
                            }
                          />
                        </IonCol>
                        <IonCol size="auto" class="itemQuantity ion-text-end">
                          <IonIcon
                            onClick={() =>
                              removeFromCart(item[1]!.product.name)
                            }
                            size={window.innerWidth > 1560 ? "large" : "small"}
                            icon={trashOutline}
                          ></IonIcon>
                        </IonCol>
                      </IonRow>
                    </IonItem>
                  );
                })}
              </div>
              
              <div className="orderFooter">
                <div style={{paddingTop: '0.75rem'}}>
                  {!payMethod || !payMethod?.method ? (
                    <>
                    <IonItem>
                    <IonSelect style={{width: '100%'}} interface="action-sheet" placeholder="Payment method" onIonChange={(e) => selectPaymentMethod(e.target.value)}>
                      <IonSelectOption value={PayMethod.CASH}>Cash</IonSelectOption>
                      <IonSelectOption value={PayMethod.CARD}>Card</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                    </>
                  ): 
                  (<>
                  <IonLabel>Payment method: {payMethod.method}</IonLabel>
                  </>)
                  }
                   <IonNote class="payment-note">Note: Once you select a payment method you can not change until the end of your stay</IonNote>

                </div>
                <IonRow style={{ maxHeight: "30px" }}>
                  <IonCol>
                    <p>Subtotal: </p>
                  </IonCol>
                  <IonCol class="ion-text-end">
                    {" "}
                    <p> € {total.toFixed(2)}</p>
                  </IonCol>
                </IonRow>
                <IonRow style={{ maxHeight: "30px" }}>
                  <IonCol>
                    <p className="p_vat">VAT: </p>
                  </IonCol>
                  <IonCol class="ion-text-end">
                    {" "}
                    <p className="p_vat"> € {round(total * 0.21)}</p>
                  </IonCol>
                </IonRow>
                <IonRow /* style={{ marginBottom: "10%", maxHeight: "30px" }} */>
                  <IonCol>
                    <p>Total: </p>
                  </IonCol>
                  <IonCol class="ion-text-end">
                    {" "}
                    <p> € {(total + round(total * 0.21)).toFixed(2)}</p>
                  </IonCol>
                </IonRow>
                <div className="footerContent">
                  <button
                    onClick={validateCart}
                    style={{ maxWidth: "150px", width: "100%" }}
                    className="btn41-43 btn-43 zzz_btn"
                  >
                    {orderProcessing ? (
                      <IonSpinner name="crescent"></IonSpinner>
                    ) : (
                      "Checkout"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </IonMenu>
        <IonPage id="orderBar">
          <IonHeader /* hidden={pf.isNative} */>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/" />
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonHeader>
            {/*  <CustomSegment onChange={handleToggleChange}></CustomSegment> */}
            <CategoryNav
              categories={categories}
              selected={selectedCategory}
              setSelected={setCategory}
              setSuper={setSuperCategory}
              supercategory={selectedSuperCategory}
            />
          </IonHeader>
          <IonContent
            slot="fixed"
            ref={contentRef}
            scrollEvents={true}
            className="ion-padding"
          >
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
            <>
              {paySession ? (
                <CheckoutModal
                  isOpen={isOpenModal}
                  cancelOrder={cancelOrder}
                  fetchPaymentSession={fetchPaymentSession}
                  session={paySession}
                  total={total}
                  cartItems={cartItems}
                />
              ) : (
                <></>
              )}
            </>
            <IonList class="menulist ion-padding">
              <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                <IonRefresherContent
                  pullingIcon={chevronDownCircleOutline}
                  refreshingSpinner="circles"
                />
              </IonRefresher>
              <IonMenuButton class="myMenuBtn" menu="end">
                <IonIcon size="large" icon={readerOutline} />
              </IonMenuButton>

              <IonGrid>
                <IonRow>
                  <IonCol>
                    <h2 className="tableNum">Nr° {tableContext.table || table}</h2>
                  </IonCol>
                </IonRow>
                <IonRow>
                  {items?.map((item, idx) => (
                    <IonCol
                      key={`${item.id}-${idx}`}
                      size="12"
                      sizeXl="3"
                      sizeMd="6"
                      sizeLg="4"
                      className="fadeIn ion-margin-bottom productCol "
                      style={{ animationDelay: `${idx / 10}s` }}
                    >
                      {/* <IonCard> */}
                      <div
                        className={`${
                          addedItem === item.id ? 'gelatine' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          const promo = props.promotions?.find(
                            (promoItem) => promoItem.product === item.id
                          );

                          addToCart(item.item, e.target as HTMLElement, promo?.promotion);
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <img
                            className="productImg"
                            alt="productImg"
                            src={item.item.image}
                          />
                          <div>
                            {itemPromo(item.item) ? (
                              <IonBadge
                                color="danger"
                                style={{
                                  position: "absolute",
                                  top: "10%",
                                  right: "20%",
                                  transform: "translate(50%, -50%)",
                                  fontSize: "100%",
                                }}
                              >
                                {itemPromo(item.item)?.promotion === 0.5
                                  ? "1 + 1 free"
                                  : `-${
                                      itemPromo(item.item)?.promotion! * 100
                                    }%`}
                              </IonBadge>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="cardHeader">
                        <IonCardTitle class="menu_card_title ion-text-lg-wrap ion-text-md-wrap ion-text-sm-wrap">
                          <IonRow class="prodName">
                            <IonCol>{item.item.name}</IonCol>
                          </IonRow>
                          <IonRow class="utilRow">
                            <IonCol style={{ paddingTop: "2px" }}>
                              <p className="price">
                                € {item.item.price.toFixed(2)}
                              </p>
                            </IonCol>
                            <IonCol size="auto" class="ion-text-end">
                              <IonIcon
                                onClick={() => showInfo(idx)}
                                class="infoIcon"
                                /* color="primary" */
                                icon={informationCircleSharp}
                              />
                            </IonCol>
                          </IonRow>
                        </IonCardTitle>
                        <p className="compositionItems">
                          {item?.item.composition!.length === 1
                            ? item?.item.composition![0]
                            : item?.item.composition!.length === 2
                            ? `${item?.item.composition![0]}, ${
                                item?.item.composition![1]
                              }`
                            : item?.item
                                .composition!.slice(0, 3)
                                .map((comp, idx) => {
                                  return `${comp}${idx < 2 ? ", " : "..."}`;
                                })}
                        </p>
                      </div>
                    </IonCol>
                  ))}
                </IonRow>
                {items ? (
                  <ItemInfo
                    item={items![selectedItem!]?.item}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                  />
                ) : (
                  <></>
                )}
              </IonGrid>
              <IonIcon
                class="ion-float-end  upBtn"
                style={{ marginBottom: "15%" }}
                onClick={scrollToTop}
                icon={arrowUpCircleSharp}
              />
            </IonList>
          </IonContent>
        </IonPage>
      </IonSplitPane>
    </IonContent>
  );
};

export default MenuPage;
