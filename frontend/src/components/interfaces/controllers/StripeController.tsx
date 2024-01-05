import React, { useState, useEffect } from 'react';
import { IonContent, IonList, IonItem } from '@ionic/react';
import { PaySession } from '../PaymentInterface';
import useQueryParam from "../../util/useQryParameters";
import { apiUrl } from "../../../config";
import { Browser } from '@capacitor/browser';
import { isPlatform } from '@ionic/react';

const PaymentSucces = () => {
  const [data, setData] = useState();
  const [sid] = useQueryParam('sid', '');

  //http://localhost:8100/success?sid=cs_test_a1dgiJyGuSepsM5zQaeRVTyGywmdx7fFnbezT4lWBaXhC1HyDBJtWpVord
  useEffect(() => {
    if(sid){
      console.log(`Session: ${sid}`);
      fetch(`${apiUrl}/success?sid=${sid}`)
       .then((response) => response.json())
       .then((data) => {
         console.log(data.session)
         const paySession:PaySession = data.session
         console.log(paySession.payment_status)
       }); 
    } 
/*     else{
      if(isPlatform("android") || isPlatform("ios")) Browser.close();
      else window.close();
    } */
  }, []);

  return (
    <IonContent>
        <h3>HI</h3>
    </IonContent>
  );
};

export default PaymentSucces;
