import {
  useIonAlert,
  IonToast,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonDatetimeButton,
  IonDatetime,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonHeader,
} from "@ionic/react";
import { closeSharp } from "ionicons/icons";
import { useState, useRef, useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { apiUrl } from "../../config";
import {
  IPricingOption,
  ActivityProps,
  ProductProps,
  PricingOptionProps,
  StoreProps,
  CategoryProps,
  IPricingForm,
  UserObject,
  IActivity,
} from "../interfaces/interfaces";
import {
  capitalizeFirstLetter,
  groupCategoriesBySuperCategory,
  jsonToFormData,
} from "../util/helpFunctions";
import { Loader } from "../Loader";
import Page from "../pages/Page";
import { insertCatsSessionnQry2 } from "../util/sqlQueries";
import { UserContext } from "../util/SessionContext";
import { format, parseISO } from 'date-fns';

interface IonDatetimeChangeEventDetail {
  value: string;
}

interface IonDatetimeCustomEvent extends CustomEvent {
  detail: IonDatetimeChangeEventDetail;
}

const PricingInputComponent = (props: PricingOptionProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<IPricingForm>();

  const submitForm: SubmitHandler<IPricingForm> = async (data) => {
    const durationValue = parseInt(data.duration, 10);
    const pricingValue = parseFloat(data.pricing);

    const pricingOption: IPricingOption = {
      duration: durationValue,
      pricing: pricingValue,
    };
    console.log(pricingOption);
    const updatedPricings = [...props.pricingOptions, pricingOption];
    props.setOptions(updatedPricings);
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <IonRow style={{ width: "100%" }}>
      <IonCol>
        <IonLabel position="floating">Duration</IonLabel>
        <IonInput
          step="1"
          min={1}
          {...register("duration", { required: true })}
          type="number"
        ></IonInput>
        {errors.duration && <p className="error_msg">Duration is required</p>}
      </IonCol>
      <IonCol>
        <IonLabel position="floating">Price</IonLabel>
        <IonInput
          step="0.01"
          min={0.01}
          {...register("pricing", { required: true })}
          type="number"
        ></IonInput>
        {errors.pricing && <p className="error_msg">Price is required</p>}
      </IonCol>
      <IonCol class="ion-align-self-end" size="auto">
        <button className="btn41-43 btn-43" onClick={handleSubmit(submitForm)}>
          <b>Encode</b>
        </button>
      </IonCol>
    </IonRow>
  );
};

export const AddActivityComponent = (store: StoreProps) => {
  const [showAlert, setShowAlert] = useState(false);
  const user = useContext(UserContext);

  const [category, setCategory] = useState("");
  const [addSuccess, setSuccess] = useState(false);
  const [presentAlert] = useIonAlert();

  const [pricings, setPricings] = useState<IPricingOption[]>([]);
  const [file, setFile] = useState<File | undefined>(undefined);
  const values = useRef({
    file: false,
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [superCats, setSuperCats] = useState<CategoryProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleStartDateChange = (event: CustomEvent) => {
    setStartDate(event.detail.value);
    console.log(event.detail.value);
  };

  const handleEndDateChange = (event: CustomEvent) => {
    setEndDate(event.detail.value);
    console.log(event.detail.value);
  };

  async function fetchCategories() {
    const url = apiUrl + "/product_manager/category/all";
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        Authorization: "Bearer " + user?.token,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    let jsonString = JSON.stringify(data);
    let qry = insertCatsSessionnQry2(jsonString);
    await store.connection?.execQuery(qry);

    const groups = groupCategoriesBySuperCategory(
      data.categories,
      data.supercategories
    );
    const activityCat = (data.supercategories as CategoryProps[]).find(
      (item: CategoryProps) => item.name === "activity"
    );
    setCategories(groups[activityCat?._id!]);
    setSuperCats(data.supercategories);
    setIsLoading(false);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityProps>();

  const submitForm: SubmitHandler<ActivityProps> = async (data) => {
    const url = apiUrl + "/product_manager/activity";
    if (!values.current.file) {
      presentAlert({
        header: "Image missing",
        subHeader: "You need to add a picture",
        buttons: ["OK"],
      });
      return false;
    }
    if (!startDate || !endDate) {
      presentAlert({
        header: "Dates missing",
        subHeader: "You need to add a start and end date",
        buttons: ["OK"],
      });
      return false;
    }
    if (!category || category === "") {
      presentAlert({
        header: "Category missing",
        subHeader: "You need to add a category",
        buttons: ["OK"],
      });
      return false;
    }
    if (pricings.length === 0) {
      presentAlert({
        header: "Pricing missing",
        subHeader: "You need at least 1 price model",
        buttons: ["OK"],
      });
      return false;
    }

    const pricingsJson = JSON.stringify(pricings);

    data.category = category;
    data.start = startDate!;
    data.end = endDate!;
    let formData = new FormData();
    formData.append("image", file!, file!.name);
    formData.append("durationOptions", pricingsJson);

    jsonToFormData(data, formData);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + user?.token,
        },
        body: formData,
      });
      if (response.ok) setSuccess(true);
    } catch (err) {
      console.log(err);
    }
  };

  const isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0 && utcDay !== 6;
  };

  const onFileChange = (fileChangeEvent: any) => {
    values.current.file = fileChangeEvent.target.files[0];
    setFile(fileChangeEvent.target.files[0]);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const content = (
    <div>
      <>
        <IonToast
          isOpen={addSuccess}
          position="top"
          message={"Product added successfully"!}
          onDidDismiss={() => setSuccess(false)}
          duration={2000}
          buttons={[
            {
              text: "Dismiss",
              role: "cancel",
            },
          ]}
        />

        <IonList inset class="ion-padding">
          <IonItem>
            <IonLabel>
              <h1>Activity</h1>
            </IonLabel>
          </IonItem>
          <IonItem fill="outline">
            <IonLabel position="floating">Title</IonLabel>
            <IonInput {...register("name", { required: true })} />
            {errors.name && <p className="error_msg">Title is required</p>}
          </IonItem>
          <IonItem fill="outline">
            <IonLabel position="floating">Description (optional)</IonLabel>
            <IonTextarea {...register("description", { required: true })} />
            {errors.description && (
              <p className="error_msg">Description is required</p>
            )}
          </IonItem>

          <IonItem>
            <IonSelect
              {...register("category")}
              onIonChange={(ev) => setCategory(ev.target.value)}
              interfaceOptions={{
                header: "Select a category",
              }}
              aria-label="category"
              placeholder="Select category"
              interface="alert"
            >
              {categories?.map((category: CategoryProps, idx: number) => {
                return (
                  <IonSelectOption key={idx} value={category.name}>
                    {capitalizeFirstLetter(category.name)}
                  </IonSelectOption>
                );
              })}
            </IonSelect>
          </IonItem>

          <IonItem>
            <PricingInputComponent
              pricingOptions={pricings}
              setOptions={setPricings}
            />
          </IonItem>
          <IonGrid
            style={{ width: "50%" }}
            class="pricingTable ion-no-padding ion-margin-bottom"
          >
            <IonRow class="pricingHeaderTable ion-padding-start ">
              <IonCol class="borderedLeft">Duration</IonCol>
              <IonCol class="ion-text-end ion-padding-end ">Price (€)</IonCol>
            </IonRow>
            {pricings?.map((aPricing, idx) => {
              return (
                <IonRow class="ion-padding-start " key={idx}>
                  <IonCol class="borderedLeft">{aPricing.duration}</IonCol>
                  <IonCol class="ion-text-end ion-padding-end ">
                    {aPricing.pricing}
                    <IonIcon
                      color="danger"
                      style={{ cursor: "pointer", marginBottom: "-10px" }}
                      size="large"
                      icon={closeSharp}
                    ></IonIcon>
                  </IonCol>
                </IonRow>
              );
            })}
          </IonGrid>
          <IonItem>
            <IonRow style={{ width: "100%" }}>
              <IonCol>
                <IonAccordionGroup>
                  <IonAccordion value="start">
                    <IonItem lines="inset" slot="header">
                      <IonLabel>Starts</IonLabel>
                      <IonDatetimeButton slot="end" datetime="start-date" />
                    </IonItem>
                    <div className="ion-padding" slot="content">
                    <IonDatetime
                      id="start-date"
                      onIonChange={handleStartDateChange}
                      /* isDateEnabled={isWeekday} */
                      slot="content"
                      presentation="date-time"
                    />
                    </div>

                  </IonAccordion>
                </IonAccordionGroup>
              </IonCol>
              <IonCol>
                <IonAccordionGroup>
                  <IonAccordion value="end">
                    <IonItem lines="inset" slot="header">
                      <IonLabel>Ends</IonLabel>
                      <IonDatetimeButton slot="end" datetime="end-date" />
                    </IonItem>
                    <div className="ion-padding" slot="content">
                      <IonDatetime
                        id="end-date"
                        onIonChange={handleEndDateChange}
                        /* isDateEnabled={isWeekday} */
                        slot="content"
                        presentation="date-time"
                      />
                    </div>

                  </IonAccordion>
                </IonAccordionGroup>
              </IonCol>
            </IonRow>
          </IonItem>

          <IonItem>
            <div className="input-group mb-3">
              <input
                type="file"
                className="form-control"
                onChange={(ev) => onFileChange(ev)}
              />
            </div>
          </IonItem>

          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header="Alert"
            message="Please select a category"
            buttons={["OK"]}
          />
          <button
            className="btn41-43 btn-43"
            onClick={handleSubmit(submitForm)}
          >
            <b>Add</b>
          </button>
        </IonList>
      </>
      <ActivityManagementComponent />
    </div>
  );

  return <Page child={isLoading ? <Loader /> : content} />;
};

const ActivityManagementComponent = () => {
  const [activities, setActivities] = useState<IActivity[]>()
  const [selectedDate, setSelectedDate] = useState<Date>();

  const user = useContext(UserContext);

  //should only fetch for current month starting from today
  async function fetchActivities(){
    const url = apiUrl + "/product_manager/activity";
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + user?.token,
      },
    });
    const dataRes: IActivity[] = (await response.json()).activities;
    console.log(dataRes);
    setActivities(dataRes);
  }

  async function fetchBookings(id: string){
    const url = apiUrl + `/product_manager/activity/bookings/${id}`;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + user?.token,
      },
    });
    const resData = await response.json();
    console.log(resData)
  }
  
  useEffect(() =>{
    fetchActivities()
  },[])

  useEffect(() => {
    if (selectedDate) {
      const month = format(selectedDate, 'MMMM');
      const aDay = format(selectedDate, 'dd MMMM');

      console.log(`Check if there are local bookings are for ${aDay}`);
      console.log(`If not: fetch only bookings for ${aDay} ${month}`);
      console.log(`If bookings are in current month: don't fetch`);

    }
  }, [selectedDate]);


  return (
    <>
      <IonGrid class="ion-padding ion-margin-bottom">
        <IonRow style={{ width: "100%" }}>
          <IonCol>
            <IonHeader><h5>Activity</h5></IonHeader>
          </IonCol>
          <IonCol size="2">
            <IonHeader><h5>Start</h5></IonHeader>
          </IonCol>
          <IonCol size="2">
            <IonHeader><h5>End</h5></IonHeader>
          </IonCol>
        </IonRow>
        {activities?.map((activ, idx) => {
          return (
            <IonRow class="activityItem" onClick={() => {
              console.log(activ._id)
              fetchBookings(activ._id)
            }} style={{cursor: 'pointer'}} key={idx}>
              <IonCol>{activ.name}</IonCol>
              <IonCol size="2">{format(new Date(activ.start), 'HH:mm')}</IonCol>
              <IonCol size="2">{format(new Date(activ.end), 'HH:mm')}</IonCol>
              {/* 
               <IonCol size="2">{format(new Date(activ.start), 'HH:mm - dd-MM-yy ')}</IonCol>
              <IonCol size="2">{format(new Date(activ.end), 'HH:mm - dd-MM-yy ')}</IonCol>
              */}
            </IonRow>
          );
        })}
      </IonGrid>
      <>
      <IonRow class="ion-justify-content-center ion-margin-horizontal">
        <IonCol class="right-element">
          <div className="circle over"></div>
          <IonLabel class="textover">Over</IonLabel>
        </IonCol>
        <IonCol>
          <div className="circle incoming"></div>
          <IonLabel>Pending</IonLabel>
        </IonCol>
      </IonRow>
      <IonRow class="ion-justify-content-center ion-margin">
        <IonDatetime
          onIonChange={(e) => {
            if (typeof e.detail.value === 'string') {
              const dateFromIonDatetime = e.detail.value;
              const dateObject = parseISO(dateFromIonDatetime);
              setSelectedDate(dateObject);
            }
          }}
          id="datetime"
          presentation="date"
          locale="fr-BE"
        ></IonDatetime>
      </IonRow>
      </>
    </>
  );
};
