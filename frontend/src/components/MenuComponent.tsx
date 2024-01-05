import { useState, useEffect, useContext } from "react";
import {
  IonRouterOutlet,
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import Page from "./pages/Page";
import "./styles.css";
import MenuPage from "./tabs/ProductMenu";

import {
  CategoryProps,
  DetailedPageProps,
  SqliteDTO,
  DataObject,
  StoreProps,
  ISliderImage,
  PromotionDTO,
} from "./interfaces/interfaces";
import CartController from "./interfaces/controllers/CartController";
import { CartContext, PfContext } from "./util/CartContext";
import { Loader } from "./Loader";

import {
  insertProdsSessionQry2,
  getCategoriesSession,
  getProductsSession,
  insertCatsSessionnQry2,
} from "./util/sqlQueries";
import { apiUrl } from "../config";
import { UserContext } from "./util/SessionContext";
import { StorageContextt } from "./util/StorageContext";

export default function MenuManager(store: StoreProps) {
  const [supercats, setSuperCategories] = useState<CategoryProps[]>([]);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [items, setItems] = useState<DetailedPageProps[]>([]);

  const [promos, setPromos] = useState<PromotionDTO[]>([]);

  const [loading, setLoading] = useState(true);
  const [cart] = useState<CartController>(new CartController());
  const [cartUpdated, setCartUpdated] = useState(false);
  const user = useContext(UserContext);
  const pf = useContext(PfContext);

  const miniStore = useContext(StorageContextt);

  async function fetchCategories() {
    try{
      const url = `${apiUrl}/product_manager/category/all`;
      const response = await fetch(url);
      const data = await response.json();
      let jsonString = JSON.stringify(data);
      /* let qry = insertCatsSessionnQry2(jsonString);
      await store.connection?.execQuery(qry); */
      await miniStore?.store?.set("categories", jsonString)
      setCategories(data.categories);
      setSuperCategories(data.supercategories);
    }
    catch(err){}
  }

  async function fetchItems() {
    await fetch(apiUrl + "/product_manager/product/all")
      .then((response) => response.json())
      .then(async (data) => {
        //console.log(data)
        setPromos(data.promos)
        let prods: DataObject[] = data.products;
        const newItems: DetailedPageProps[] = [];
        for (let i = 0; i < prods.length; i++) {
          prods[i].description = prods[i].description.replace("'", "''");
          newItems.push({
            item: prods[i],
            isOpen: false,
            id: prods[i]._id,
          });
        }
        setItems(newItems);
        const newData = {
          products: newItems,
          activities: data.activities
        }
         //storage
        await miniStore?.store?.set("items", JSON.stringify(newData));
/*         let jsonString = JSON.stringify(newItems);
        let qry = insertProdsSessionQry2(jsonString);
        await store.connection?.execQuery(qry); */
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }

  function updateCart() {
    setCartUpdated(!cartUpdated);
  }

  useEffect(() => {
     const checkCache = async () => {
      try {
        /* let prods: SqliteDTO = (
          await store.connection?.execQuery(getProductsSession)
        )?.values![0]; */
       // const prodsRaw = await miniStore?.store!.get("items")
        //const prods = JSON.parse(prodsRaw)
        //console.log(prods)
        
        await fetchCategories()
        await fetchItems()
        //if (!prods) fetchItems();
        //else setItems(JSON.parse(prods.json_data));

        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }; 
    if (loading && miniStore?.store) checkCache();
  }, [loading, miniStore?.store]);


  //DONT TOUCH THIS
  const renderContent = (
    <CartContext.Provider
    value={{ updated: cartUpdated, setUpdated: updateCart }}
  >
    <IonContent >
      <IonContent fullscreen>
          <MenuPage
              categories={categories}
              items={items}
              cart={cart}
              setUpdated={setCartUpdated}
              updated={cartUpdated}
              fetchItems={fetchItems}
              fetchCats={fetchCategories}
              superCategories={supercats}
              setItems={setItems}
              promotions={promos}
            />
      </IonContent>
    </IonContent>
    
    </CartContext.Provider>
  );

  return (<>{!loading ? renderContent : <Loader />}</> );
}
