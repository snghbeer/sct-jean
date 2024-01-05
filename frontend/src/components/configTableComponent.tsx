import { IonAlert } from "@ionic/react";
import { useContext, useState } from "react";
import { insertTableSessionQry } from "./util/sqlQueries";
import { StorageContextt } from "./util/StorageContext";
import { TableConfigProps } from "./util/CartContext";

export const TableConfigComponent = (props: TableConfigProps) => {
  const store = useContext(StorageContextt);

  async function saveTableConfig(id: number) {
    //storage
    let jsonString = JSON.stringify({
        id: id
    });
   await store?.store?.set("tableSession", jsonString)
   props.setTable!(id.toString());
}

  return (
    <IonAlert
      isOpen={props.isOpen}
      header="Please enter a table id"
      buttons={[
        {
            text: "OK",
            handler: async (alertData) => {
                await saveTableConfig(parseInt(alertData.tableInput))
            }
        }
      ]}
      inputs={[
        {
        name: 'tableInput',
          type: "number",
          placeholder: "Id",
        },
      ]}
    ></IonAlert>
  );
};
