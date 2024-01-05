import { IonLabel, IonInput, IonText } from "@ionic/react";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { RecordItem } from "./interfaces/interfaces";

interface RecordItemComponentProps{
    addNote: (key:string, note:string) => void;
    item: [string, RecordItem | undefined]
}

export const RecordItemComponent = (props: RecordItemComponentProps) => {
  const [hiddenNote, setHiddenNote] = useState(true);
  const [note, setNote] = useState<string|undefined>();
  const inputRef: MutableRefObject<HTMLIonInputElement | null> = useRef(null);

  const openInput = () => {
    if (inputRef.current) {
      setHiddenNote(false);
      inputRef.current.setFocus();
    }
  };

  return (
    <>
      <IonLabel>{props.item[1]!.product.name}</IonLabel>
      <IonText onClick={openInput} className="orderNote">
        {!note ? "Add note" : note}
      </IonText>
      <IonInput
        ref={inputRef}
        id="myInput"
        class="noteInput"
        type="text"
        hidden={hiddenNote}
        onIonBlur={(e) => {
          props.addNote(props.item[1]!.product.name, e.target.value as string);
          setNote(e.target.value as string)
          setHiddenNote(true);
        }}
      />
    </>
  );
};
