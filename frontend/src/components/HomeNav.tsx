import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonToolbar,
  IonicSlides,
} from "@ionic/react";
import React, { useContext, useEffect, useState } from "react";
import {
  arrowBackCircleOutline,
  arrowBackCircleSharp,
  arrowBackSharp,
  calendarSharp,
  callSharp,
  fastFoodSharp,
  informationCircleSharp,
} from "ionicons/icons";
import { Link, useHistory, useLocation } from "react-router-dom";
import { ISliderImage, PayMethod } from "./interfaces/interfaces";
import { apiUrl } from "../config";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, EffectFade } from "swiper";
import { PfContext, TableContext } from "./util/CartContext";
import { TableConfigComponent } from "./configTableComponent";
import { table } from "console";
import { StorageContextt } from "./util/StorageContext";
import logo from "./assets/logo.png";
import { Capacitor } from "@capacitor/core";
import { Header } from "./Header";

const items = [
  {
    title: "Roomservice",
    icon: fastFoodSharp,
    url: "/menu",
  },
  {
    title: "Reservation & Activity",
    icon: calendarSharp,
    url: "/activity",
  },
  {
    title: "Hotel information",
    icon: informationCircleSharp,
    url: "/info",
  },
  {
    title: "Call reception",
    icon: callSharp,
    url: "/call",
  },
];

export default function HomeNav() {
  const [swipeImgs, setImgs] = useState<ISliderImage[] | undefined>();
  const [showMenu, setShow] = useState(false);
  const tableContext = useContext(TableContext);
  const pf = useContext(PfContext);
  const store = useContext(StorageContextt);

  const [payMethod, setPaymethod] = useState<PayMethod|undefined>()

  async function fetchImgs() {
    try {
      const url = apiUrl + "/product_manager/slider";
      const imgsRes = await fetch(url);
      const imgs = await imgsRes.json();
      setImgs(imgs.sliders);
    } catch (err) {
      console.error(err);
    }
  }

  async function getTableSession() {
    const sessString = await store?.store?.get("tableSession");
    if (sessString) {
      const sess = JSON.parse(sessString);
      console.log(sess);
      tableContext.setTable!(sess.id);
    }
  }

  useEffect(() => {
    fetchImgs();
    getTableSession();
  }, [store?.store, tableContext.table, tableContext.setTable]);

  return (
    <IonPage>
      <>
        {swipeImgs ? (
          <>
            {showMenu ? (
              <IonContent  className="homeMenuContainer ion-align-items-center">
                {Capacitor.getPlatform() === "web" && !pf.isNative ? (
                  <Header />
                ) : (
                  <></>
                )}
                <div className="vertical-center">
                  <IonRow
                    style={{ width: "100%" }}
                    class="ion-float-start ion-padding-start ion-padding-top"
                  >
                    <Link onClick={() => setShow(false)} to={"/"}>
                      <IonIcon
                        color="primary"
                        class="fadeIn"
                        style={{
                          fontSize: "3.5rem",
                          animationDelay: `${4 / 10}s`,
                        }}
                        icon={arrowBackCircleOutline}
                      ></IonIcon>
                    </Link>
                  </IonRow>
                  <IonRow
                    style={{ width: "100%", height: "100%" }}
                    class="ion-justify-content-center ion-padding"
                  >
                    {items.map((item, idx) => {
                      return (
                        <IonCol
                          style={{ width: "50%" }}
                          class=" homeMenuItem ion-padding"
                          key={idx}
                        >
                          <Link
                            style={{
                              textDecoration: "none",
                              animationDelay: `${idx / 10}s`,
                            }}
                            className="homeMenuCard fadeIn"
                            to={item.url}
                          >
                            <IonCardHeader class="centeredCardHeader">
                              <IonIcon
                                class="homeIcon"
                                color="primary"
                                icon={item.icon}
                              ></IonIcon>
                            </IonCardHeader>
                            <IonCardTitle style={{fontWeight: 'bold'}} class="centeredCardTitle" color={'primary'}>
                              {item.title}
                            </IonCardTitle>
                          </Link>
                        </IonCol>
                      );
                    })}
                  </IonRow>
                </div>
                {pf.isTablet && !tableContext.table ? (
                  <TableConfigComponent
                    isOpen={tableContext.isOpen}
                    table={tableContext.table}
                    setTable={tableContext.setTable}
                  />
                ) : (
                  <></>
                )}
                <div className="ion-float-end ion-padding-end">
                  <img className="minilogo" src={logo} alt="nivon" />
                  Nivon
                </div>
              </IonContent>
            ) : (
              <IonContent>
                <div className="slider-container ">
                  <Swiper
                    className="slidedown-in-enter-tab"
                    effect="coverflow"
                    draggable={false}
                    centeredSlides={true}
                    allowTouchMove={false}
                    loop={true}
                    modules={[
                      IonicSlides,
                      Autoplay,
                      EffectFade,
                      EffectCoverflow,
                    ]}
                    speed={6500}
                    noSwiping={true}
                    autoplay={true}
                  >
                    {swipeImgs?.map((image, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="swiper-container">
                          <img
                            className="slideImg"
                            src={image.image}
                            alt="swipe"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="welcome-btn-container fadeIn">
                    <button
                      onClick={() => setShow(true)}
                      className="button-76  gelatineInf"
                    >
                      Welcome
                    </button>
                  </div>
                </div>
              </IonContent>
            )}
          </>
        ) : (
          <></>
        )}
      </>
    </IonPage>
  );
}
