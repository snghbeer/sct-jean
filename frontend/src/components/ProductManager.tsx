import { useState, useEffect, useContext } from "react";
import {
  IonLabel,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonRouterOutlet,
  IonContent,
  IonPage,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Page from "./pages/Page";
import "./styles.css";
import { IonReactRouter } from "@ionic/react-router";
import {  AdminRoute } from "../routes/protectedRoute";

import { home, library } from "ionicons/icons";

import HomePage from "./tabs/Inventory";
import AddCategoryContainer from "./tabs/AddCategoryPage";
import {
  CategoryProps,
  UserObject,
  SqliteDTO,
  StoreProps,
  UserPrivileges,
} from "./interfaces/interfaces";
import {CartContext} from "./util/CartContext";
import { Loader } from "./Loader";

import {
  getCategoriesSession,
  insertCatsSessionnQry2,
} from "./util/sqlQueries";
import { apiUrl } from "../config";
import { UserContext } from "./util/SessionContext";
import { groupCategoriesBySuperCategory } from "./util/helpFunctions";
import { StorageContextt } from "./util/StorageContext";

const isAdmin = (user: UserObject) => user && (user.role === UserPrivileges.Admin || user.role === UserPrivileges.Manager);

export default function ProductManager() {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [superCats, setSuperCats] = useState<CategoryProps[]>([])

  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(false);

  const [cartUpdated, setCartUpdated] = useState(false);
  const [selectedTab, setSelectedTab] = useState('inventory');
  const user = useContext(UserContext)
  const ministore = useContext(StorageContextt);

  
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
    let jsonString = JSON.stringify(data);
    await ministore?.store?.set("categories", jsonString)

/*     const groups = groupCategoriesBySuperCategory(data.categories, data.supercategories)
    const activityCat = (data.supercategories as CategoryProps[]).find((item:CategoryProps) => item.name === "food")
    setCategories(groups[activityCat?._id!]); */
    setCategories(data.categories);
    setSuperCats(data.supercategories)
    setLoading(false);
  }

  function updateCart() {
    setCartUpdated(!cartUpdated);
  }

  useEffect(() => {
    if (loading && ministore?.store) fetchCategories();
  }, [loading, ministore?.store]);

   useEffect(() => {
    if (updated) {
      fetchCategories();
      setUpdated(false);
    }
  }, [updated]);

  useEffect(() => {
    if (user?.role === UserPrivileges.Admin || user?.role === UserPrivileges.Manager) {
       user?.socket?.on("updateProducts", (data: any) => {
       //handles real-time updates of products
       
       return () => {
         user?.socket?.off("updateProducts"); //on unmount
       };
     });
   }
 }, [user?.socket, updated]);


  const renderContent = (
    <IonPage>
      <IonHeader>
        <IonToolbar >
          <IonTitle >{selectedTab}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent >
          <CartContext.Provider
            value={{ updated: cartUpdated, setUpdated: updateCart }}
          >
            
            <IonReactRouter>
              <IonTabs onIonTabsDidChange={(event) => setSelectedTab(event.detail.tab)}>
                <IonRouterOutlet>
                  <AdminRoute
                    user={user!}
                    path="/product_manager"
                    exact={true}
                    component={() => (
                      <AddCategoryContainer
                      updated={updated}
                      setUpdated={setUpdated}
                      categories={categories}
                      superCategories={superCats}
                      token={user?.token}
                    />
                    )}
                  />
                  <AdminRoute
                    user={user!}
                    path="/manager"
                    exact={true}
                    component={() => (
                      <HomePage
                      updated={updated}
                      setUpdated={setUpdated}
                      categories={categories}
                      superCategories={superCats}
                      setCategories={setCategories}
                    />
                    )}
                  />
                </IonRouterOutlet>

                <IonTabBar 
                hidden={!isAdmin(user!)} 
                slot="bottom" >
                  <IonTabButton
                      tab="Product manager"
                      href="/product_manager"
                    >
                      <IonIcon icon={home} />
                      <IonLabel>Product manager</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="Inventory" href="/manager">
                      <IonIcon icon={library} />
                      <IonLabel>Inventory</IonLabel>
                    </IonTabButton>
                </IonTabBar>
          
              </IonTabs>
            </IonReactRouter>
          </CartContext.Provider>

      </IonContent>
    </IonPage>
  );

  return (
    <>
      {!loading ? (
        renderContent
      ) : (
        <Page child={<Loader />} />
      )}
    </>
  );
}