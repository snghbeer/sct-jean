import {
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonItem,
  IonLabel,
  IonSpinner,
  IonAlert,
  IonCard,
  IonInput,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  useIonAlert,
  RefresherEventDetail,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import Page from "./pages/Page";
import { SessionDTO, BusyDates } from "./interfaces/interfaces";

import { format, parseISO } from "date-fns";
import { apiUrl } from "../config";
import { UserContext } from "./util/SessionContext";
import SessComponent from "./SessionComponent";
import { enterAnimation, isDatePassed, leaveAnimation } from "./util/helpFunctions";
import { StorageContextt } from "./util/StorageContext";
import { chevronDownCircleOutline } from "ionicons/icons";

const SessionComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<SessionDTO>();
  const [sessions, setSessions] = useState<SessionDTO[]>();
  const [isOpen, setIsOpen] = useState(false);
  const [canFilter, setCanFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date(Date.now()).toISOString());

  const [busyDates, setBusyDates] = useState<BusyDates[]>();
  const [alertOpen, setAlert] = useState(false);
  const [presentAlert] = useIonAlert();


  const user = useContext(UserContext);
  const store = useContext(StorageContextt);

  const setTitle = (newValue: string) => {
    setData((prevState) => ({ ...prevState!, name: newValue }));
  };

  const setDate = (newValue: string) => {
    setData((prevState) => ({ ...prevState!, date: newValue }));
  };

  const setStartTime = (newValue: number) => {
    setData((prevState) => ({ ...prevState!, startTime: newValue }));
  };

  const setEndTime = (newValue: number) => {
    setData((prevState) => ({ ...prevState!, endTime: newValue }));
  };


  const setDuration = () => {
    if (data?.endTime! > data?.startTime!) {
      const duration = data?.endTime! - data?.startTime!;
      setData((prevState) => ({ ...prevState!, duration: duration }));
    }
  };

  const getSessionsOfADay = async (isoString: string) => {
    const formattedDate  = isoString.split("+")
    const url = `${apiUrl}/product_manager/session/today?date=${formattedDate[0]}`;
    try{
      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + user?.token,
        },
      });
      const result = await res.json();
      setSessions(result.sessions);

      const temp = result.sessions.map((sess: any) => {
        return {
          date: format(new Date(sess.date), "yyyy-MM-dd"),
          textColor: `${
            isDatePassed(new Date(sess.date)) ? "#000000" : "#800080"
          }`,
          backgroundColor: `${
            isDatePassed(new Date(sess.date)) ? "#797979" : "#ffc0cb"
          }`,
        };
      });
      //console.log(temp);
      setBusyDates(temp);
    }
    catch (err) {
      console.log(err)
      presentAlert({
        header: 'Something went wrong',
        subHeader: 'Try again later',
        buttons: ['OK'],
      })
    }
  }

  const getSessions = async () => {
    const url = apiUrl + "/product_manager/session";
    try{
      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + user?.token,
        },
      });
      const result = await res.json();
      //console.log(result);
      setSessions(result.sessions);
      //temp store
      store?.store?.set("sessions", JSON.stringify(result.sessions))
      const temp = result.sessions.map((sess: any, idx: number) => {
        return {
          date: format(new Date(sess.date), "yyyy-MM-dd"),
          textColor: `${
            isDatePassed(new Date(sess.date)) ? "#000000" : "#800080"
          }`,
          backgroundColor: `${
            isDatePassed(new Date(sess.date)) ? "#797979" : "#ffc0cb"
          }`,
        };
      });
      //console.log(temp);
      setBusyDates(temp);
      setIsLoading(false);
    }
    catch (err) {
      presentAlert({
        header: 'Something went wrong',
        subHeader: 'Try again later',
        buttons: ['OK'],
      })
    }
  };

  const onSubmit = async () => {
    if(!data?.name || data?.name === ""){
      setAlert(true)
    } else{
      
      const url = apiUrl + "/product_manager/session";
      const jsonData = data;
      //console.log(jsonData);
      const now = Date.now();
      const defaultTime = 1000 * 60 * 60 
      if (!jsonData.startTime) jsonData!.startTime = now;
      if (!jsonData.endTime) jsonData!.endTime = now + defaultTime;
      if (!jsonData.date) jsonData!.date = new Date(now).toISOString();
      const duration = jsonData.endTime! - jsonData.startTime!;
      jsonData.duration = duration;
      console.log(jsonData);
        try{
        const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user?.token,

        },
        body: JSON.stringify(jsonData),
      });
      const result = await res.json();
      console.log(result);
      }
      catch(err){
        presentAlert({
          header: 'Something went wrong',
          subHeader: 'Try again later',
          buttons: ['OK'],
        })
      }  
    }
  };

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(async () => {
      await getSessions();
      event.detail.complete();
    }, 1000);
  }

  useEffect(() => {

    if (user && isLoading) getSessions();
    //getSessions()
  }, [ user, isLoading ]);

  useEffect(() => {}, [busyDates]);

  useEffect(() => {}, [sessions]);

  const content = (
      <div>
              <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent
          pullingIcon={chevronDownCircleOutline}
          refreshingSpinner="circles"
        />
      </IonRefresher>
        <IonAlert
        isOpen={alertOpen}
        header="Empty title"
        subHeader="A session needs a title!"
        buttons={['OK']}
        onDidDismiss={() => setAlert(false)}
      ></IonAlert>
      <IonCard class="ion-padding m20">
        <IonItem fill="outline">
          <IonLabel position="floating">Title</IonLabel>
          <IonInput
            type="text"
            onIonChange={(e) => setTitle(e.target.value as string)}
          />
        </IonItem>
        <IonRow class="ion-justify-content-center ion-margin-horizontal">
          <IonCol class="right-element">
              <div className="circle over"></div>
              <IonLabel class="textover">Over</IonLabel>
          </IonCol>
          <IonCol>
            <div className="circle incoming"></div>
            <IonLabel>Pending</IonLabel>
          </IonCol>
        </IonRow>
        <IonRow class="ion-justify-content-center ion-margin">
          <IonDatetime
            id="datetime"
            presentation="date"
            locale="fr-BE"
            onIonBlur={async (e) =>  
              //getSessions()
              {
                const sess = await store?.store?.get("sessions")
                setSessions(JSON.parse(sess))
              }
            }
            onIonChange={
              async (e) => {
                getSessionsOfADay(e.target.value as string)
                //console.log(e.target.value as string)
                setDate(e.target.value as string);
                //setCanFilter(!canFilter)
                //setDateFilter(e.target.value as string)
              }
              //{setDate(format(parseISO(e.target.value as string), 'd/MM/yyyy'))}
            }
            highlightedDates={busyDates}
            
          ></IonDatetime>
        </IonRow>
        <IonRow>
          <IonCol class="ion-padding ">
            <IonRow class="ion-justify-content-center">
              <IonLabel class="ion-margin">Start</IonLabel>
              <IonDatetimeButton
                class="dateBtn"
                datetime="startTime"
              ></IonDatetimeButton>
            </IonRow>
          </IonCol>

          <IonCol class="ion-padding">
            <IonRow class="ion-justify-content-center">
              <IonLabel class="ion-margin">End</IonLabel>
              <IonDatetimeButton datetime="endTime"></IonDatetimeButton>
            </IonRow>
          </IonCol>

          <IonModal keepContentsMounted={true}
          enterAnimation={enterAnimation}
          leaveAnimation={leaveAnimation}
          >
            <IonDatetime
              id="startTime"
              presentation="time"
              onIonChange={(e) => {
                //console.log(e.target.value as string)
                setStartTime(parseISO(e.target.value as string).getTime())
              }
              }
            ></IonDatetime>
          </IonModal>
          <IonModal keepContentsMounted={true}>
            <IonDatetime
              id="endTime"
              presentation="time"
              onIonChange={(e) => {
                setEndTime(parseISO(e.target.value as string).getTime())
              }}
            ></IonDatetime>
          </IonModal>
        </IonRow>
        <IonRow class="ion-justify-content-center">
          <button
            style={{ width: "50%" }}
            className="btn41-43 btn-43 ion-float-end"
            onClick={onSubmit}
          >
            Create
          </button>
        </IonRow>
      </IonCard>
      <IonList inset>
        <IonGrid class="ion-margin-top">
          <IonRow >
            <IonCol size="4" sizeXs="3">
              <IonHeader>
                Session
              </IonHeader>
            </IonCol>
            <IonCol size="3" sizeXs="2">
              <IonHeader>
              Date
              </IonHeader>
            </IonCol>
            <IonCol size="1" sizeXs="2">
              <IonHeader>
              Start
              </IonHeader>
            </IonCol>
            <IonCol size="1" sizeXs="2">
              <IonHeader>
              End
              </IonHeader>
            </IonCol>
            <IonCol size="1" sizeXs="2" >
              <IonHeader>
              Duration
              </IonHeader>
            </IonCol>
            <IonCol ></IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid class="mygrid">
          {!isLoading ? (
            <SessComponent sessions={sessions} isOpen={isOpen} setIsOpen={setIsOpen} 
            canFilter={canFilter} dateToFilter={dateFilter}/>
          ) : (
            <IonRow class="ion-justify-content-center">
              <IonSpinner name="crescent"></IonSpinner>
            </IonRow>
          )}
        </IonGrid>
      </IonList>
      </div>
  );

  return <Page child={content} title="Sessions" />;
};

export default SessionComponent;
