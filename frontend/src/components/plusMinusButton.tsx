import { IonIcon } from "@ionic/react";
import { addSharp, removeSharp } from "ionicons/icons";
import { PlusMinusButtonProps } from "./interfaces/interfaces";

export const PlusMinusButton = (props: PlusMinusButtonProps) => {
  return (
    <div className={props.class}>
      <IonIcon
        class="myIconBtn lined"
        icon={addSharp}
        color="dark"
        onClick={props.increaseFunction}
      />
      <IonIcon
        class="myIconBtn"
        icon={removeSharp}
        color="dark"
        onClick={props.decreaseFunction}
      />
    </div>
  );
};
