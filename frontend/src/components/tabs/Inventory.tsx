import { useContext, useEffect, useState } from "react";
import {
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonRow,
  IonGrid,
  IonCol,
  IonSearchbar,
  SearchbarCustomEvent,
  IonContent,
  IonToast,
  IonActionSheet,
  IonButton,
  IonIcon,
  IonInput,
} from "@ionic/react";
import { chevronDownCircleOutline, ellipsisHorizontalSharp } from "ionicons/icons";
import "../styles.css";
//import {capitalizeFirstLetter} from "../util/helpFunctions";

import { DetailedItemPage } from "./DetailedProductModal";
import {
  CatProps,
  CategoryComponentProps,
  CategoryProps,
  DataObject,
  DetailedPageProps,
  SqliteDTO,
  UpdatedProp,
} from "../interfaces/interfaces";
import { apiUrl } from "../../config";
import { getProductsSession, insertCatsSessionnQry2, insertProdsSessionQry2 } from "../util/sqlQueries";
import { UserContext } from "../util/SessionContext";
import { Loader } from "../Loader";
import { StorageContextt } from "../util/StorageContext";

const CategoryInputComponent = (props: CategoryComponentProps) => {
  const [input, setInput] = useState<string>("")
  const user = useContext(UserContext);

  function handleInput(event: Event){
    const inp = (event.target as HTMLInputElement).value;
    setInput(inp!);
  }

  async function updateCategory(){
    if(input || input !== ""){
      const url = apiUrl + `/product_manager/category/${props.category._id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user?.token,
        },
        body: JSON.stringify({
          name: input
        })
      })
      const resData = await response.json();
      console.log(resData);
      props.setCategories!(resData.categories!)
    }
  }

  async function deleteCategory(){
    const url = apiUrl + `/product_manager/category/${props.category._id}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + user?.token,
      }
    })
    if(response.ok){
      const newCategories = props.categories.filter((cat) => cat._id !== props.category._id)
      props.updateCategories!(newCategories)
    } 
  }

  return (
    <>
      <IonRow style={{width: '100%'}}>
        <IonCol>
        <IonInput
          type="text"
          value={input}
          onIonChange={handleInput}
          placeholder={props.category.name}
      ></IonInput>
        </IonCol>
         <IonCol size="auto">
         <button onClick={updateCategory} className="btn41-43 btn-43">
            Apply
        </button>
         </IonCol>
         <IonCol size="auto">
         <button onClick={deleteCategory} className="btn41-43 btn-43 btn-delete">
            Delete
        </button>
         </IonCol>
      </IonRow>
    </>
  );
}

const HomePage = (props: UpdatedProp) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [items, setItems] = useState<DetailedPageProps[]>();
  
  const [searchItems, setSearchItems] = useState<DetailedPageProps[]>();
  const [searchQuery, setSearchQuery] = useState<string | undefined>();

  const [loading, setLoading] = useState(true);
  const user = useContext(UserContext);
  const ministore = useContext(StorageContextt);

  const [showNotif, setShow] = useState(false);

  function openDetailPage(index: number) {
    if (isOpen) setIsOpen(false);
    else {
      setSelectedItem(index);
      setIsOpen(true);
    }
  }

  async function fetchItems() {
    await fetch(apiUrl + "/product_manager/product/all", {
      credentials: "include",
      headers: {
        Authorization: "Bearer " + user?.token,
      },
    })
      .then((response) => response.json())
      .then(async (data) => {
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
        //storage
        const newData = {
          products: newItems,
          activities: data.activities
        }
        setItems(newItems);
        await ministore?.store?.set("items", JSON.stringify(newData));
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }

  async function updateItems(items: DetailedPageProps[]) {
    setIsOpen(false);
    setItems(items);
  }

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(async () => {
      // Any calls to load data go here
      await fetchItems();
      //setItems(props.items!);
      event.detail.complete();
    }, 1000);
  }

  async function handleSearch(ev: SearchbarCustomEvent) {
    ev.preventDefault();
    setSearchQuery(ev.target.value!);
    const search = items?.filter(
      (item) =>
        item?.item.name
          .toLocaleLowerCase()
          .startsWith(ev.target.value!.toLocaleLowerCase()) ||
        item?.item.name
          .toLocaleLowerCase()
          .includes(ev.target.value!.toLocaleLowerCase())
    );
    setSearchItems(search!);
  }

  async function updateCategories(cats: CatProps){
    let jsonString = JSON.stringify(cats);
    await ministore?.store?.set("categories", jsonString)

 /*    let qry = insertCatsSessionnQry2(jsonString);
    await props.store!.connection?.execQuery(qry);  */
    props.setCategories!(cats.categories); 
  }

  async function setCategoriesLocal(cats: CategoryProps[]){
    const newCats = {
      categories: cats,
      supercategories: props.superCategories
    }
    //console.log(newCats)
    //update local storage
    let jsonString = JSON.stringify(newCats);
    let qry = insertCatsSessionnQry2(jsonString);
    await props.store!.connection?.execQuery(qry);  
    props.setCategories!(cats); 
  }

  async function fetchCategories() {
    const url = apiUrl + "/product_manager/category/all";
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 
        Authorization: "Bearer " + user?.token,
        'Content-Type': 'application/json' 
      },
    });
    const data = await response.json();
    //console.log(data)
    await updateCategories(data as CatProps) 
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const content = (
    <>
      <IonContent>
        <IonToast
          cssClass="ion-text-center"
          isOpen={showNotif}
          position="top"
          message="Product updated successfully!"
          duration={2000}
          onDidDismiss={() => setShow(false)}
        />
        <IonList inset={true} class="m_top">
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              pullingIcon={chevronDownCircleOutline}
              refreshingSpinner="circles"
            />
          </IonRefresher>
          <IonSearchbar
            value={searchQuery}
            onIonChange={handleSearch}
          ></IonSearchbar>
          <IonGrid>
            <IonRow>
              <IonCol
                size="8"
                sizeXl="8"
                sizeLg="8"
                sizeMd="7"
                sizeSm="6"
                sizeXs="6"
              >
                <h4>Product</h4>
              </IonCol>
              <IonCol class="ion-margin-start ion-text-center">
                <h4>Total</h4>
              </IonCol>
              <IonCol class="ion-text-end">
                <h4>Price</h4>
              </IonCol>
            </IonRow>
          </IonGrid>

          <>
            {searchQuery || searchQuery === "" ? (
              <>
                {searchItems?.map((item, index) => {
                  return (
                    <IonItem
                      key={index}
                      className="inventory_items"
                      button
                      detail={false}
                      onClick={() => openDetailPage(index)}
                    >
                      <IonAvatar slot="start">
                        <img src={item.item.image} alt="avatar" />
                      </IonAvatar>
                      <IonCol
                        size="8"
                        sizeXl="8"
                        sizeLg="8"
                        sizeMd="7"
                        sizeSm="6"
                        sizeXs="6"
                      >
                        <IonLabel>{item.item.name}</IonLabel>
                      </IonCol>
                      <IonCol
                        size="2"
                        sizeXs="2"
                        class="ion-margin-start ion-text-center"
                      >
                        <IonLabel>{item.item.quantity}</IonLabel>
                      </IonCol>
                      <IonCol class="ion-text-end">
                        <IonLabel>{item.item.price.toFixed(2)}</IonLabel>
                      </IonCol>
                    </IonItem>
                  );
                })}
              </>
            ) : (
              <>
                {items?.map((item, index) => {
                  return (
                    <IonItem
                      key={index}
                      className="inventory_items"
                      button
                      detail={false}
                      onClick={() => openDetailPage(index)}
                    >
                      <IonAvatar slot="start">
                        <img src={item.item.image} alt="avatar" />
                      </IonAvatar>
                      <IonCol
                        size="8"
                        sizeXl="8"
                        sizeLg="8"
                        sizeMd="7"
                        sizeSm="6"
                        sizeXs="6"
                      >
                        <IonLabel>{item.item.name}</IonLabel>
                      </IonCol>
                      <IonCol
                        size="2"
                        sizeXs="2"
                        class="ion-margin-start ion-text-center"
                      >
                        <IonLabel>{item.item.quantity}</IonLabel>
                      </IonCol>
                      <IonCol class="ion-text-end">
                        <IonLabel>{item.item.price.toFixed(2)}</IonLabel>
                      </IonCol>
                    </IonItem>
                  );
                })}
              </>
            )}
          </>
        </IonList>
        {items ? (
          <DetailedItemPage
            item={items[selectedItem]?.item}
            image={items[selectedItem]?.item.image}
            id={items[selectedItem]?.id}
            isOpen={isOpen}
            setClose={setIsOpen}
            setIsOpen={() => openDetailPage(selectedItem)}
            categories={props.categories}
            updated={showNotif}
            setUpdated={setShow}
            setItems={updateItems}
          />
        ) : (
          <></>
        )}
        <div className="ion-padding">
          <IonRow>
            <IonCol>
            </IonCol>
            <IonCol class="ion-text-end" size="auto">
              <button onClick={fetchCategories} className="btn41-43 btn-43">
                Refresh
              </button>
            </IonCol>
          </IonRow>
          <IonGrid>
            <IonRow>
              <IonCol size="6" sizeXs="4">
                <h4>Category</h4>
              </IonCol>
            </IonRow>
            <>
            {props.categories ? (
              <>
              {props.categories?.map((cat, idx) => {
              return (
                <IonItem key={idx}>
                    <CategoryInputComponent category={cat} categories={props.categories!} setCategories={props.setCategories} updateCategories={setCategoriesLocal} />  
                </IonItem>
              );
            })}
              </>
            ) : (<></>)}
            </>
          </IonGrid>
        </div>
      </IonContent>
    </>
  );
  return <>{!loading ? content : <Loader />}</>;
};

export default HomePage;
