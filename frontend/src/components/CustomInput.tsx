import { IonCol, IonInput } from '@ionic/react'
import React, { useEffect, useState } from 'react'

interface CustomInputProps{
    product: string;
    value: number;
    setValue?: (key:string, value: number) => void;
}

export default function CustomInput(props: CustomInputProps) {
    const [focused, setFocused] = useState(false)
    const [qty, setQty] = useState<number|undefined>()

    function submitInputChange(){
        props.setValue!(props.product, qty!)
        setFocused(false)
    }

    function handleInputChange(newVal: number|string|null|undefined){
        if(!newVal || newVal === "") setQty(0);
        else {
            setQty(newVal as number);
        }
    }

    useEffect(() => {
        setQty(props.value)
    }, [props.setValue])

  return (
    <IonCol onClick={() => setFocused(true)} onBlur={submitInputChange} size="auto" class="qtyBordered itemQuantity ion-text-end">
        {focused ? (
            <IonInput type='number' min={0} onIonChange={(e) => handleInputChange(e.target.value)} style={{maxWidth: '30px'}} value={qty}/>
        ) :(<>
        x{props.value}
        </>)}
  </IonCol>
  )
}
