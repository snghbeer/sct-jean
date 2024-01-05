import Page from "./pages/Page";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import { BarcodeScanner } from "@capacitor-community/barcode-scanner";

import "./styles.css";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { ChartComponent } from "./chart";

const serverUrl = "http://localhost:5000";

enum ViewMode {
  Today,
  Weekly,
  Monthly
}

export default function QRCodeGenerator() {
  const [input, setInputValue] = useState("");
  const [qrSelected, setQr] = useState("barcode");
  const [codeURL, setCode] = useState("");

  function renderQR(inp: string) {
    QRCode.toDataURL(
      inp,
      { errorCorrectionLevel: "H", width: 256 },
      function (err, canvas) {
        if (err) throw err;
        setCode(canvas);
      }
    );
  }

  function renderBarcode(inp: string) {
    JsBarcode("#barcode", inp, { displayValue: false });
  }

  function handleInput(event: Event) {
    const inp = (event.target as HTMLInputElement).value;
    setInputValue(inp);
    try {
      if (qrSelected === "qrcode") renderQR(inp);
      else renderBarcode(inp);
    } catch (err) {}
  }

  function handleMode(mode: string) {
    switch (mode) {
      case "barcode":
        setQr("barcode");
        setInputValue("");
        setCode("");
        break;
      case "qrcode":
        setQr("qrcode");
        setInputValue("");
        setCode("");
        break;
      default:
        break;
    }
  }

  const checkPermission = async () => {
    // check or request permission
    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.granted) {
      // the user granted permission
      startScan();
      setTimeout(() => {
        stopScan();
      }, 10000);
      //return true;
    }

    return false;
  };

  const startScan = async () => {
    try {
      await BarcodeScanner.hideBackground(); // make background of WebView transparent
      document.body.classList.add("qrscanner"); // add the qrscanner class to body

      /* const element = document.querySelector("#scanner-ui");
      element?.classList.add("qrscanner"); */

      const result = await BarcodeScanner.startScan(); // start scanning
      document.body.classList.remove("qrscanner");
      if (result.hasContent) {
        //console.log(`QR code scanned: ${result.content}`);
        setInputValue(result.content);
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
    }
  };

  const stopScan = async () => {
    try {
      await BarcodeScanner.stopScan(); // Stop scanning
      document.body.classList.remove("qrscanner"); // Remove the qrscanner class from body
      /* const element = document.querySelector("#scanner-ui");
      element?.classList.remove("qrscanner"); */
    } catch (error) {
      console.error("Error stopping QR code scanning:", error);
    }
  };

  const menuQr = async () => {
    const url = `${window.location.origin}/menu`;
    setInputValue(url);
  };

  useEffect(() => {

    async function fetchSalesRand() {
      try {
        const response = await fetch(`${serverUrl}/sales_random_month`);
        const data = await response.json();
        //console.log(data)
      } catch (err) {
        console.error(err);
      }
    }
    //fetchSalesRand();
  }, []);

  const content = (
    <>
      {/* <div className="ion-padding">
        <h1>Code generator</h1>
        <IonCard className="mycard">
          <IonList>
            <IonItem>
              <IonSelect
                value={qrSelected}
                aria-label="code"
                placeholder="Select code"
                onIonChange={(e) => handleMode(e.target.value)}
              >
                <IonSelectOption defaultChecked={true} value="barcode">
                  Barcode
                </IonSelectOption>
                <IonSelectOption value="qrcode">QR code</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
          <IonCardContent>
            <IonRow class="ion-padding ion-justify-content-center">
              <img id="barcode" src={codeURL} alt="" />
            </IonRow>
            <IonItem fill="outline">
              <IonLabel position="floating">Enter value</IonLabel>
              <IonInput
                onIonChange={(event) => handleInput(event)}
                placeholder="Enter text"
                value={input}
              ></IonInput>
            </IonItem>
            <div style={{ margin: "0 auto" }}>
              <Link className="customLink" to={`/product/${input}`}>
                <button className="btn41-43 btn-43">Show detail</button>
              </Link>
              <button onClick={menuQr} className="btn41-43 btn-43">
                Menu QR
              </button>
              <button onClick={checkPermission} className="btn41-43 btn-43">
                Scan
              </button>
            </div>
          </IonCardContent>
        </IonCard>
      </div> */}
      <ChartComponent />
    </>
  );
  return <Page title="Sales" child={content} backUrl="/" />;
}

//export { QRCodeGenerator };
