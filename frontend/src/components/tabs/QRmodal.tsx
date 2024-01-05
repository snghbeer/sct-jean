import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonRow, createAnimation } from "@ionic/react"
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { enterAnimation, leaveAnimation } from "../util/helpFunctions";
import { apiUrl } from "../../config";

interface ShowQRProps{
    showQR: boolean;
    setShowQR: (value: boolean) => void;
    table: string
}

const QRModal = (props: ShowQRProps) => {
    const [codeURL, setCode] = useState("");

    useEffect(() => {
        function renderQR() {
          const url = process.env.REACT_APP_CLIENT_URL
            QRCode.toDataURL(
              `${url}/menu?table=${props.table}`,
              { errorCorrectionLevel: "H", width: 256 },
              function (err, canvas) {
                if (err) throw err;
                setCode(canvas);
              }
            );
        }
        if(props.table) renderQR()
    }, [props.table])

    return(
        <IonModal 
        enterAnimation={enterAnimation}
        leaveAnimation={leaveAnimation} 
        isOpen={props.showQR} onDidDismiss={() => props.setShowQR(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Modal</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => props.setShowQR(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent class="ion-padding ion-text-center ">
            <IonRow class="ion-padding ion-justify-content-center centered_content">
              <img className="qrImg" id="barcode" src={codeURL} alt="" />
            </IonRow>
        </IonContent>
      </IonModal>
    )
}

export default QRModal;
