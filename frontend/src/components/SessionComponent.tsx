import {
  IonRow,
  IonCol,
  IonLabel,
  IonIcon,
  IonActionSheet, useIonAlert
} from "@ionic/react";
import { format, parseISO } from "date-fns";
import { ellipsisHorizontalSharp } from "ionicons/icons";
import { SessionComponentProps, SessionDTO } from "./interfaces/interfaces";
import { useContext, useEffect, useState } from "react";
import { haveSameDay, isDatePassed } from "./util/helpFunctions";
import { apiUrl } from "../config";
import { UserContext } from "./util/SessionContext";


const SessComponent = (props: SessionComponentProps) => {
  const [selected, setSelected] = useState(0);
  const [sessions, setSessions] = useState<SessionDTO[]>();
  const [presentAlert] = useIonAlert();

  const user = useContext(UserContext);

  function select(idx: number) {
    props.setIsOpen(true);
    setSelected(idx);
  }

  const closeSession = async (sessionId: string) => {
    try{
      const url = apiUrl + "/product_manager/session/close";
      const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + user?.token,
      },
      body: JSON.stringify({ sessionId: sessionId}),
      });
      const result = await res.json();
      if(result.success){
        const row = document.getElementById(`sess_${sessionId}`)
        row?.classList.add("over2");
      }
    }
    catch(err){
      presentAlert({
        header: 'Something went wrong',
        subHeader: 'Try again later',
        buttons: ['OK'],
      })
    }
  }

  useEffect(() => {
    if(props.canFilter) setSessions(props?.sessions!.filter((sess) => haveSameDay(new Date(sess.date), new Date(props.dateToFilter as string))))
  },[props.dateToFilter])

  const content = props.sessions?.map((item, index) => {
    const itemDate = new Date(item.date!)
    return (
      <IonRow id={`sess_${item._id}`} key={index} class={`${isDatePassed(itemDate) || item.closed ? "over2" : ""}`}>
        <IonCol size="4" sizeXs="3">
          <IonLabel>{item.name}</IonLabel>
        </IonCol>
        <IonCol class="ion-padding-end" size="3" sizeXs="2">
          <IonLabel>{format(parseISO(item.date), "d/MM/yy")}</IonLabel>
        </IonCol>
        <IonCol size="1" sizeXs="2">
          <IonLabel>
            {format(itemDate, "HH:mm")}
          </IonLabel>
        </IonCol>

        <IonCol size="1" sizeXs="2">
          <IonLabel>
            {format(new Date(item.startTime! + item.duration), "HH:mm")}
          </IonLabel>
        </IonCol>

        <IonCol size="1" sizeXs="2" >
          <IonLabel>
            {Math.floor(item.duration / 1000 / 60)}
            {window.innerWidth > 600 ? " minutes" : " min."}
          </IonLabel>
        </IonCol>
        <IonCol class="ion-text-end" size="auto">
          <IonIcon
            id="click-trigger"
            class="myIconBtn ion-float-end"
            onClick={() => isDatePassed(itemDate)|| item.closed  ? null : select(index) }
            icon={ellipsisHorizontalSharp}
            size={window.innerWidth > 600 ? "large" : "small"}
          />
        </IonCol>
      </IonRow>
    );
  });
  return (
    <>
      {content}
      <IonActionSheet
        isOpen={props.isOpen}
        buttons={[
          {
            text: "Close",
            role: "destructive",
            data: {
              action: "delete",
            },
            handler: () => {
              console.log(`Deleting ${props?.sessions![selected]._id}`);
              closeSession(props?.sessions![selected]._id)
            },
          },
          {
            text: "Cancel",
            role: "cancel",
            data: {
              action: "cancel",
            },
          },
        ]}
        onDidDismiss={() => props.setIsOpen(false)}
      ></IonActionSheet>
    </>
  );
};

export default SessComponent;
