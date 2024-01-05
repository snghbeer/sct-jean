import "./styles.css";
import { Link, Redirect } from "react-router-dom";
import Page from "./pages/Page";
import { ActiveSessionProp } from "./interfaces/interfaces";
import { IonButton, IonContent, IonGrid, IonRow, IonCol } from "@ionic/react";

const DashboardContainer = (props: ActiveSessionProp) => {
  const content = (
    <IonContent class="ion-padding ion-text-center">
      <IonGrid class="centered_content">
        <IonRow class="ion-justify-content-center ion-align-items-center" style={{ height: '100%' }}>
          <IonCol>
            <h1>Welcome</h1>
            <Link className="customLink" to="/page/login">
              <button className="btn41-43 btn-43 ion-content-center" style={{ margin: "0 auto", width: "50%" }}>
                Go to login page
              </button>
            </Link>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );

  return <Page child={content} title="Dashboard" backUrl="/" />;
};

export default DashboardContainer;
