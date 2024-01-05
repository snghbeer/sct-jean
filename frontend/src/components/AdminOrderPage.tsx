import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSpinner,
  RefresherEventDetail,
  useIonAlert,
} from "@ionic/react";
import Page from "./pages/Page";

import "./styles.css";
import { useContext, useEffect, useState } from "react";
import { OrderNotification, RecordDTO, UserPrivileges } from "./interfaces/interfaces";
import { DetailedRecordPage } from "./DetailedRecordModal";
import { apiUrl } from "../config";
import {
  checkmarkOutline,
  chevronDownCircleOutline,
  closeOutline,
} from "ionicons/icons";
import { UserContext } from "./util/SessionContext";
import { OrderController } from "./interfaces/controllers/OrderController";

//import { Printer, PrinterOriginal, PrintOptions } from '@awesome-cordova-plugins/printer'
import print from 'print-js'; 

const AdminOrderPage = () => {
  //const [records, setRecords] = useState<RecordDTO[]>()
  const [selectedRecord, setRecord] = useState("");
  const [item, setItem] = useState<RecordDTO | undefined>(undefined);
  const [recordItems, setRecords] = useState<RecordDTO[]>([])
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updated, setUpdated] = useState(false);
  const [presentAlert] = useIonAlert();
  const user = useContext(UserContext);
  const [orderController] = useState<OrderController>(new OrderController());

  async function fetchRecords() {
    try {
      const url = `${apiUrl}/product_manager/records/all`;
      const response = await fetch(url, {
        headers: { Authorization: "Bearer " + user?.token },
      });
      const data = await response.json();
      const orders = data.records;
      //console.log(orders)
      orderController.initOrders(orders);
      setRecords(orders)
      setIsLoading(false);
    } catch (err) {
      presentAlert({
        header: "Something went wrong",
        subHeader: "Try again later",
        buttons: ["OK"],
      });
    }
  }

  function openDetailedRecord(index: string) {
    setRecord(index);
    const anOrder = orderController.getItem(index);
    setItem(anOrder);
    //console.log(anOrder)
    setIsOpen(!isOpen);
  }

  async function takeOrder() {
    const temp = orderController.getItem(selectedRecord);

    if (temp && !temp.fulfilled && user) {
      try {
        const url = `${apiUrl}/product_manager/records/lock/${selectedRecord}`;
        const response = await fetch(url, {
          credentials: "include",
          headers: {
            Authorization: "Bearer " + user.token,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            data: {
              name: user.username,
            },
          }),
        });

        setIsOpen(!isOpen);
      } catch (err) {
        presentAlert({
          header: "Something went wrong",
          subHeader: "Try again later",
          buttons: ["OK"],
        });
      }
    } else {
      await fetchRecords(); //just refresh data
    }
  }

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(async () => {
      await fetchRecords();
      event.detail.complete();
    }, 1000);
  }

   async function printDoc(){
    try{
      //if(Capacitor.getPlatform() === "web") window.print()
      //else await Printer.print('<b>Hello Cordova!</b>')
      print({ printable: 'Hello world!', type: 'raw-html' })
    }
    catch(err){
      console.error(err);
    }
  } 


  //handles real-time updates of orders
  useEffect(() => {
    if (
      user?.role === UserPrivileges.Admin ||
      user?.role === UserPrivileges.Manager
    ) {
      fetchRecords()
      user?.socket?.on("refresh", (data: any) => {
        console.log(data);
        //handles real-time updates of orders
        const record: RecordDTO = data.order;
        //close modal the selected order has already been taken by someone else
        if (isOpen && selectedRecord === record._id) setIsOpen(!isOpen);

        const update = {
          _id: record._id,
          records: record.records,
          date: record.date,
          total: record.total,
          waiter: record.waiter,
          fulfilled: record.fulfilled,
        };
        orderController.updateItem(record._id, update);
        setUpdated(!updated);
        return () => {
          user?.socket?.off("refresh"); //on unmount
        };
      });
      user?.socket?.on("new_order", async (data: OrderNotification) => {
        //console.log(data);
        await fetchRecords();
      });
    }
  }, [user?.socket, updated]);

  const content = (
    <>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent
          pullingIcon={chevronDownCircleOutline}
          refreshingSpinner="circles"
        />
      </IonRefresher>
      <IonContent>
        <IonList inset>
          <button
            style={{ maxWidth: "300px" }}
            className="btn41-43 btn-43"
            onClick={printDoc}
          >
            Print
          </button>
          <IonGrid>
            <IonRow class="ion-padding">
              <IonCol sizeXs="3">
                <IonHeader>
                  Id
                </IonHeader>
              </IonCol>
              <IonCol  sizeXs="3">
                <IonHeader>
                 Date
                </IonHeader>
              </IonCol>
              <IonCol class="ion-padding-horizontal" sizeXs="3">
                <IonHeader>
                  Waiter
                </IonHeader>
              </IonCol>
              <IonCol  class="ion-text-end">
                <IonHeader>
                  Closed
                </IonHeader>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonGrid>
            {!isLoading ? (
              recordItems!.map((record, index) => {
                return (
                  <IonItem
                    button
                    key={record._id}
                    onClick={() => openDetailedRecord(record._id)}
                  >
                    <IonCol sizeXs="3">
                      <IonLabel>{record._id}</IonLabel>
                    </IonCol>
                    <IonCol sizeXs="3">
                      <IonLabel>
                        {new Date(record.date).toLocaleString()}
                      </IonLabel>
                    </IonCol>
                    <IonCol
                      class="ion-padding-horizontal"
                      sizeXs="3"
                    >
                      <IonLabel class="ion-margin-start">
                        {record?.waiter ||
                        record?.waiter !== "" ||
                        record?.waiter === undefined
                          ? record?.waiter
                          : "None"}
                      </IonLabel>
                    </IonCol>
                    <IonCol class="ion-text-end">
                      <IonIcon
                        icon={
                          record.fulfilled ? checkmarkOutline : closeOutline
                        }
                        size={window.innerWidth > 400 ? "large" : "small"}
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
      </IonContent>
      {item ? (
        <DetailedRecordPage
          _id={selectedRecord}
          date={item?.date}
          records={item?.records}
          by={item?.by}
          confirmed={item.confirmed}
          total={item?.total}
          isOpen={isOpen}
          setOpen={setIsOpen}
          validate={takeOrder}
        />
      ) : (
        <></>
      )}
    </>
  );
  return <Page child={content} title="Orders" />;
};

export default AdminOrderPage;
