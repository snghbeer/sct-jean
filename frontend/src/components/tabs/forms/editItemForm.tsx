import { useEffect, useState } from "react";
import {
    IonContent,
    IonList,
    IonCard,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonHeader,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonBackButton,
    useIonPicker,
    IonCardTitle,
    IonTextarea,
    IonPage,
    IonMenuButton,
  } from "@ionic/react";


const EditItemForm = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [present] = useIonPicker();

    const openPicker = async () => {
        present({
          columns: [
            {
              name: "languages",
              options: [
                {
                  text: "JavaScript",
                  value: "javascript",
                },
                {
                  text: "TypeScript",
                  value: "typescript",
                },
                {
                  text: "Rust",
                  value: "rust",
                },
                {
                  text: "C#",
                  value: "c#",
                },
              ],
            },
          ],
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Confirm",
              handler: (value) => {
                //window.alert(`You selected: ${value.languages.value}`);
                setCategory(
                  (value.languages.value as String).charAt(0).toUpperCase() +
                    (value.languages.value as String).slice(1)
                );
              },
            },
          ],
        });
      };


    return (
        <>
      <IonCard className="form_cardd">
        <IonItem>
          <IonCardTitle>
            <strong className="card_title">Add a product</strong>
          </IonCardTitle>
        </IonItem>
        <IonList>
          <IonItem fill="outline">
            <IonLabel position="floating">Product name</IonLabel>
            <IonInput />
          </IonItem>

          <IonItem fill="outline">
            <IonLabel position="floating">Price</IonLabel>

            <IonInput />
          </IonItem>
          <IonItem fill="outline">
            <IonLabel position="floating">Description</IonLabel>
            <IonTextarea />
          </IonItem>

          <IonItem fill="outline">
            <IonLabel position="floating">Amount</IonLabel>
            <IonInput />
          </IonItem>

          <IonItem>
            <button className='btn41-43 btn-43' onClick={openPicker}>
              Select category
            </button>
            <IonLabel id="cat_name">{category}</IonLabel>
          </IonItem>
          <button className='btn41-43 btn-43'>Add product</button>
        </IonList>
      </IonCard>
    </>
    )
}