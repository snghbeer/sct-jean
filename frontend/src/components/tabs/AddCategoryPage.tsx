import { useState, useRef, useContext, useEffect, ChangeEvent } from "react";
import {
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  useIonPicker,
  IonTextarea,
  IonToast,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonContent,
  RefresherEventDetail,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonCol,
  IonSpinner,
  useIonAlert,
  IonChip,
  IonIcon,
  InputChangeEventDetail,
  IonGrid,
  IonAccordion,
  IonAccordionGroup,
  IonDatetime,
  IonDatetimeButton,
  IonNote,
} from "@ionic/react";
import "./styles.css";

import { capitalizeFirstLetter, jsonToFormData } from "../util/helpFunctions";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  ProductProps,
  UpdatedProp,
  CategoryProps,
  ISliderImage,
  CompositionInputProps,
  ActivityProps,
  IPricingOption,
  PricingOptionProps,
} from "../interfaces/interfaces";
import { Swiper, SwiperSlide } from "swiper/react";
import { apiUrl } from "../../config";
import { UserContext } from "../util/SessionContext";
import {
  chevronDownCircleOutline,
  closeSharp,
  pin,
  pinSharp,
} from "ionicons/icons";

import { Navigation, Pagination, A11y } from "swiper";
import "swiper/swiper-bundle.min.css";
import { StorageContextt } from "../util/StorageContext";

const CompositionInput = (props: CompositionInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  function handleInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    setInputValue(input);
  }

  // Replace handleInputKeyPress with handleInputKeyUp
  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === "Enter") {
      addCompositionItem();
    }
  };

  const addCompositionItem = () => {
    if (inputValue.trim() !== "") {
      const updatedComposition = [...props.composition, inputValue.trim()];
      props.setComposition(updatedComposition);
      setInputValue("");
    }
  };

  const removeChip = (index: number) => {
    const updatedComposition = [...props.composition];
    updatedComposition.splice(index, 1);
    props.setComposition(updatedComposition);
  };

  return (
    <>
      <IonItem fill="outline">
        <IonLabel position="floating">Composition</IonLabel>
        <IonInput
          type="text"
          value={inputValue}
          onIonInput={handleInput}
          onKeyUp={handleInputKeyUp}
        />
      </IonItem>
      <IonItem>
        {props.composition?.map((comp, idx) => (
          <IonChip key={idx}>
            <IonLabel>{comp}</IonLabel>
            <IonIcon
              icon={closeSharp}
              onClick={() => removeChip(idx)}
            ></IonIcon>
          </IonChip>
        ))}
      </IonItem>
    </>
  );
};


const AddSliderComponent = (props: UpdatedProp) => {
  const [name, setName] = useState("");
  const [defaultIndex, setDefaultIndex] = useState(0);
  const miniStore = useContext(StorageContextt);

  const [file, setFile] = useState<File | undefined>(undefined);
  const values = useRef({
    file: false,
  });

  const [swipeImgs, setImgs] = useState<ISliderImage[] | undefined>();

  async function addSlider() {
    if (file) {
      let formData = new FormData();
      formData.append("image", file!, file!.name);

      const url = apiUrl + "/product_manager/slider";
      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: "Bearer " + props.token,
        },
        body: formData,
      };
      await fetch(url, requestOptions)
        .then((response) => response.json())
        .then(async (data) => {
          setImgs(data.sliders);
          await miniStore?.store?.set("sliders", JSON.stringify(data.sliders));
        })
        .catch((err) => console.log(err));
    } else {
      console.error("No file specified");
    }
  }

  async function deleteSlider() {
    const url = apiUrl + "/product_manager/slider";
    const data = {
      id: swipeImgs![defaultIndex]._id,
    };
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.token,
      },
      body: JSON.stringify(data),
    };
    await fetch(url, requestOptions)
      .then((response) => response.json())
      .then(async (data) => {
        //console.log(data);
        setImgs(data.sliders);
        await miniStore?.store?.set("sliders", JSON.stringify(data.sliders));
      })
      .catch((err) => console.log(err));
  }

  function handleInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    setName(input);
  }

  const onFileChange = (fileChangeEvent: any) => {
    values.current.file = fileChangeEvent.target.files[0];
    setFile(fileChangeEvent.target.files[0]);
  };

  useEffect(() => {
    async function fetchImgs() {
      const url = apiUrl + "/product_manager/slider";
      const imgsRes = await fetch(url);
      const imgs = await imgsRes.json();
      setImgs(imgs.sliders);
      //console.log(imgs)
    }
    fetchImgs();
  }, []);

  /*   const superCatComponent = (
    <IonList inset class="ion-padding">
    <IonItem class="item_btn">
      <IonLabel>
        <h1>Add a super category</h1>
      </IonLabel>
    </IonItem>
    <IonItem fill="outline">
      <IonLabel position="floating">Category name</IonLabel>
      <IonInput
        onIonChange={(event) => handleInput(event)}
        placeholder="Enter something"
        value={name}
      ></IonInput>
    </IonItem>

    <IonItem class="ion-margin">
      <button className="btn41-43 btn-43" onClick={() => addCategory()}>
        Submit
      </button>
    </IonItem>
  </IonList>
  ) */

  return (
    <>
      <div className="ion-margin-top ion-padding">
        <h1>Add a carousel</h1>
        {swipeImgs ? (
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={50}
            draggable={true}
            autoplay={true}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            onSlideChange={(swiper) => setDefaultIndex(swiper.activeIndex)}
            defaultValue={defaultIndex}
          >
            {swipeImgs.map((image, idx) => (
              <SwiperSlide key={idx}>
                <img className="miniSwiperImg" src={image.image} alt="swipe" />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <IonSpinner name="crescent"></IonSpinner>
        )}
        <IonRow className="ion-justify-content-center ion-margin-top">
          <button
            style={{ maxWidth: "100px", width: "100%" }}
            className="btn41-43 btn-43 btn-delete"
            onClick={deleteSlider}
          >
            Delete
          </button>
        </IonRow>
        <IonRow class="ion-margin-top">
          <IonCol>
            <input
              type="file"
              className="form-control"
              onChange={(ev) => onFileChange(ev)}
            />
          </IonCol>
          <IonCol>
            <button
              style={{ maxWidth: "100px", width: "100%" }}
              className="btn41-43 btn-43 zzz_btn "
              onClick={addSlider}
            >
              Add
            </button>
          </IonCol>
        </IonRow>
      </div>
    </>
  );
};

const AddCategoryContainer = (props: UpdatedProp) => {
  const [name, setName] = useState("");
  const [catName, setCatName] = useState("");

  async function addCategory() {
    const url = apiUrl + "/product_manager/category/new";
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.token,
      },
      body: JSON.stringify({ name: name, category: catName }),
    };
    await fetch(url, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (!data.error) props.setUpdated(true);
      })
      .catch((err) => console.log(err));
  }

  function handleInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    setName(input);
  }

  function handleCatInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    setCatName(input);
  }

  return (
    <>
      <IonList inset class="ion-padding">
        <IonItem class="item_btn">
          <IonLabel>
            <h1>Add a category</h1>
          </IonLabel>
        </IonItem>
        <IonItem fill="outline">
          <IonLabel position="floating">Category name</IonLabel>
          <IonInput
            onIonChange={(event) => handleInput(event)}
            placeholder="Enter something"
            value={name}
          ></IonInput>
        </IonItem>

        <IonItem>
          <IonSelect
            onIonChange={(event) => handleCatInput(event)}
            aria-label="category"
            placeholder="Select category"
            interface="alert"
          >
            <IonSelectOption value={"food"}>Food</IonSelectOption>
            <IonSelectOption value={"activity"}>Activity</IonSelectOption>
          </IonSelect>
        </IonItem>
        <button className="btn41-43 btn-43 " onClick={() => addCategory()}>
          Submit
        </button>
      </IonList>
    </>
  );
};

const AddCProductContainer = (props: UpdatedProp) => {
  const [showAlert, setShowAlert] = useState(false);
  const [category, setCategory] = useState("");
  const [addSuccess, setSuccess] = useState(false);
  const [presentAlert] = useIonAlert();

  const [composition, setComposition] = useState<string[]>([]);
  const [file, setFile] = useState<File | undefined>(undefined);
  const values = useRef({
    file: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductProps>();

  const submitForm: SubmitHandler<ProductProps> = async (data) => {
    const url = apiUrl + "/product_manager/product/new";
    if (!values.current.file) {
      presentAlert({
        header: "Image missing",
        subHeader: "You need to add a picture",
        buttons: ["OK"],
      });
      return false;
    }
    data.category = category;
    data.composition = composition;
    if (category === "") setShowAlert(true);
    else {
      //const jsonString = JSON.stringify(data);

      let formData = new FormData();
      formData.append("image", file!, file!.name);
      jsonToFormData(data, formData);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + props.token,
          },
          body: formData,
        });
        if (response.ok) setSuccess(true);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const onFileChange = (fileChangeEvent: any) => {
    values.current.file = fileChangeEvent.target.files[0];
    setFile(fileChangeEvent.target.files[0]);
  };

  const customActionSheetOptions = {
    header: "Select a category",
  };

  return (
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
            <h1>Add a product</h1>
          </IonLabel>
        </IonItem>
        <IonItem fill="outline">
          <IonLabel position="floating">Product name</IonLabel>
          <IonInput {...register("name", { required: true })} />
          {errors.name && <p className="error_msg">Name is required</p>}
        </IonItem>

        <IonItem fill="outline">
          <IonLabel position="floating">Price</IonLabel>
          <IonInput
            type="number"
            step="0.01"
            min={0.01}
            {...register("price", { min: 0.01, required: true })}
          />
          {errors.price && <p className="error_msg">Price is required</p>}
        </IonItem>
        <IonItem fill="outline">
          <IonLabel position="floating">Description</IonLabel>
          <IonTextarea {...register("description", { required: true })} />
          {errors.description && (
            <p className="error_msg">Description is required</p>
          )}
        </IonItem>
        <CompositionInput
          composition={composition}
          setComposition={setComposition}
        />
        <IonItem fill="outline">
          <IonLabel position="floating">Amount</IonLabel>
          <IonInput
            type="number"
            min={0}
            {...register("quantity", { min: 0, required: true })}
          />
          {errors.quantity && <p className="error_msg">Amount is required</p>}
        </IonItem>

        <IonItem>
          <IonSelect
            {...register("category")}
            onIonChange={(ev) => setCategory(ev.target.value)}
            interfaceOptions={customActionSheetOptions}
            aria-label="category"
            placeholder="Select category"
            interface="alert"
          >
            {props.categories?.map((category: CategoryProps, idx: number) => {
              return (
                <IonSelectOption key={idx} value={category.name}>
                  {capitalizeFirstLetter(category.name)}
                </IonSelectOption>
              );
            })}
          </IonSelect>
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
        <button className="btn41-43 btn-43" onClick={handleSubmit(submitForm)}>
          <b>Add</b>
        </button>
      </IonList>
    </>
  );
};

const InventoryContainer = (props: UpdatedProp) => {
  //const user = useContext(UserContext);

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(async () => {
      //await fetchCategories();
      event.detail.complete();
    }, 1000);
  }

  const content = (
    <IonContent>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent
          pullingIcon={chevronDownCircleOutline}
          refreshingSpinner="circles"
        />
      </IonRefresher>
      <AddSliderComponent
        updated={props.updated}
        setUpdated={props.setUpdated}
        token={props.token}
      />
      <AddCategoryContainer
        /* superCategories={superCats} */
        updated={props.updated}
        setUpdated={props.setUpdated}
        token={props.token}
      />
      <AddCProductContainer
        updated={props.updated}
        categories={props.categories}
        setUpdated={props.setUpdated}
        token={props.token}
      />
    </IonContent>
  );
  return content;
};

export default InventoryContainer;
