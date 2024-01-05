import {
  IonContent,
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonInput,
  IonActionSheet,
  useIonAlert,
  RefresherEventDetail,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { platform } from "os";
import { useContext, useEffect, useState } from "react";
import Page from "./pages/Page";
import {
  checkmarkDone,
  checkmarkSharp,
  chevronDownCircleOutline,
  closeSharp,
  ellipsisHorizontalSharp,
} from "ionicons/icons";
import { useForm, SubmitHandler } from "react-hook-form";
import { TableObject, TableDTO, UserPrivileges } from "./interfaces/interfaces";
import { apiUrl } from "../config";
import { UserContext } from "./util/SessionContext";
import QRModal from "./tabs/QRmodal";

const OrderDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const user = useContext(UserContext);
  const [presentAlert] = useIonAlert();

  const [selected, setSelected] = useState("");
  const [showQR, setShowQR] = useState(false);

  const [data, setData] = useState<TableDTO[]>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TableObject>();

  async function getTables() {
    try {
      const url = apiUrl + "/product_manager/room";
      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + user?.token },
      });
      const data = await res.json();
      setData(data.rooms);
      //console.table(data);
      setIsLoading(false);
    } catch (err) {
      presentAlert({
        header: "Something went wrong",
        subHeader: "Try again later",
        buttons: ["OK"],
      });
    }
  }

  const onSubmit: SubmitHandler<TableObject> = async (data) => {
    try {
      const url = apiUrl + "/product_manager/room";
      if (data.start < data.end) {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
             Authorization: "Bearer " + user?.token,
          },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        console.log(result);
      }
    } catch (err) {
      presentAlert({
        header: "Something went wrong",
        subHeader: "Try again later",
        buttons: ["OK"],
      });
    } finally {
      await getTables();
    }
  };

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(async () => {
      await getTables();
      event.detail.complete();
    }, 1000);
  }

  useEffect(() => {
    if (isLoading && user) getTables();
  }, [isLoading, data, user]);

  const content = (
    <IonContent>

      {user?.role === UserPrivileges.Admin ? (
        <IonCard class="ion-padding">
          <form onSubmit={handleSubmit(onSubmit)}>
            <IonItem fill="outline">
              <IonLabel position="floating">Start</IonLabel>
              <IonInput
                type="number"
                {...register("start", { required: true })}
              />
              {errors.start && <p className="error_msg">Start is required</p>}
            </IonItem>
            <IonItem fill="outline">
              <IonLabel position="floating">End</IonLabel>
              <IonInput
                type="number"
                {...register("end", { required: true })}
              />
              {errors.end && <p className="error_msg">End is required</p>}
            </IonItem>
            <button
              className="btn41-43 btn-43 btn300 ion-float-end"
              type="submit"
            >
              Generate
            </button>
          </form>
        </IonCard>
      ) : (
        <></>
      )}
      <IonList inset>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent
          pullingIcon={chevronDownCircleOutline}
          refreshingSpinner="circles"
        />
      </IonRefresher>
        <IonGrid>
          <IonRow class="ion-padding">
            <IonCol size="8" sizeXs="7">
              <IonHeader>
                <b>Table n°</b>
              </IonHeader>
            </IonCol>
            <IonCol>
              <IonHeader>
                <b>Open</b>
              </IonHeader>
            </IonCol>
            <IonCol>
              <IonHeader>
                <b>Total</b>
              </IonHeader>
            </IonCol>
            <IonCol class="ion-text-end ion-float-end">
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          {!isLoading ? (
            data?.map((item, index) => {
              return (
                <IonItem key={index}>
                  <IonCol size="8" sizeXs="7">
                    <IonLabel>{item.subId}</IonLabel>
                  </IonCol>
                  <IonCol>
                    <IonIcon
                      icon={item.closed ? closeSharp : checkmarkSharp}
                      size={window.innerWidth > 400 ? "large" : "small"}
                    />
                  </IonCol>
                  <IonCol>{item.total ? item.total : 0}</IonCol>
                  <IonCol class="ion-text-end">
                    <IonIcon
                      id="click-trigger"
                      class="myIconBtn"
                      onClick={() => {
                        setIsOpen(true)
                        setSelected(item.subId.toString())
                        console.log(`Clicked on table ${item._id}`)
                      }}
                      icon={ellipsisHorizontalSharp}
                      size={"large"}
                    />
                  </IonCol>
                </IonItem>
              );
            })
          ) : (
            <IonRow class="ion-justify-content-center">
              <IonSpinner name="crescent"></IonSpinner>
            </IonRow>
          )}
        </IonGrid>
      </IonList>
      <QRModal showQR={showQR} setShowQR={setShowQR} table={selected}/>
      <IonActionSheet
        isOpen={isOpen}
        buttons={[
          {
            text: "Close",
            role: "destructive",
            data: {
              action: "delete",
            },
          },
          {
            text: "QR code",
            data: {
              action: "show",
            },
            handler: () => {
              console.log(`QR code of ${selected}`)
              setShowQR(true)

            }
          },
          {
            text: "Cancel",
            role: "cancel",
            data: {
              action: "cancel",
            },
          },
        ]}
        onDidDismiss={() => setIsOpen(false)}
      ></IonActionSheet>
    </IonContent>
  );
  return <Page child={content} title="Tables" />;
};

export default OrderDashboard;
