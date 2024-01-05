import {
  IonAvatar,
  IonCard,
  IonHeader,
  IonItem,
  IonLabel,
  IonRow,
  IonTitle,
} from "@ionic/react";
import Page from "./pages/Page";
import { useState, useContext, useEffect } from "react";
import {
  ProductDetailPageProps,
  DataObject,
  SqliteDTO,
  DetailedPageProps,
} from "./interfaces/interfaces";
import { capitalizeFirstLetter } from "./util/helpFunctions";
import { Loader } from "./Loader";
//import useQueryParam from "./util/useQryParameters";
import { StorageContext } from "./storage";
import { getProductsSession } from "./util/sqlQueries";

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ match }) => {
  const [data, setData] = useState<DataObject>();
  const [loading, setLoading] = useState(true);
  const {connection} = useContext(StorageContext);

  useEffect(() => {
    const checkCache = async () => {
      try {
        let prods: SqliteDTO = (await connection?.execQuery(getProductsSession))
          ?.values![0]; //await storage?.get("products");
        let parsedProds: DetailedPageProps[] = JSON.parse(prods.json_data);
        const aProd = parsedProds.find(
          (product) => product.id === match.params.id
        );
        if (aProd) {
          setData(aProd.item);
          setLoading(false);
        }
        //else await fetchItem(match.params.id)
      } catch (err) {
        console.log(err);
      }
    };
    if (connection) checkCache();
  }, [connection]);

  const content = (
    <IonRow
      class="ion-justify-content-center ion-align-items-center"
      style={{ height: "70%" }}
    >
      <>
        {loading ? (
          <Loader />
        ) : (
          <IonCard class="ion-padding" style={{ width: "90%" }}>
            <IonHeader>
              <IonTitle class="text-center ion-text-center">
                Product {match.params.id}
              </IonTitle>{" "}
            </IonHeader>
            <IonAvatar className="detailedPage_avatar ion-margin">
              <img src={data?.image} alt="" />
            </IonAvatar>
            <IonItem>
              <IonLabel position="fixed">
                <b>Name</b>
              </IonLabel>
              <IonLabel>{capitalizeFirstLetter(data?.name as string)}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel position="fixed">Description</IonLabel>
              <IonLabel>{data?.description}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel position="fixed">Total</IonLabel>
              <IonLabel>{data?.quantity.toString()}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel position="fixed">Price</IonLabel>
              <IonLabel>{data?.price.toString()}</IonLabel>
            </IonItem>
            
          </IonCard>
        )}
      </>
    </IonRow>
  );

  return <Page child={content} title="Product detail" backUrl="/" />;
};

export default ProductDetailPage;
