import { useContext, useState } from "react";
import {
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonToast,
} from "@ionic/react";
import { Link } from "react-router-dom";
import Page from "../pages/Page";

import { ActiveSessionProp, UserObject } from "../interfaces/interfaces";
import { useForm, SubmitHandler } from "react-hook-form";
import {io} from 'socket.io-client';

//import { insertUserSessionQry } from "../util/sqlQueries";

import "../styles.css";
import { apiUrl, serverUrl } from "../../config";
import { loginUser } from "./utils";
import { StorageContextt } from "../util/StorageContext";
import { insertUserSessionQry } from "../util/sqlQueries";

function SignupContainer() {
  //const [presentToast] = useIonToast();
  const [registerSucces, setSucces] = useState(false);
  const [resMsg, setMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserObject>();
  const onSubmit: SubmitHandler<UserObject> = async (data) => {
    //console.log(data);
    await registerUser(data, (res) => {
      //console.log(res.data)
      setMsg(res.data.message);
      setSucces(true);
    });
  };

  async function registerUser(userObject: UserObject, callback: (res: any) => void) {
    const url = apiUrl + "/register" 
    await fetch(url, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userObject)
    })
  }

  const myContainer = (
    <>
      <IonContent >
        <IonToast
          isOpen={registerSucces}
          position="top"
          message={resMsg}
          duration={2000}
          buttons={[
            {
              text: "Dismiss",
              role: "cancel",
            },
          ]}
        />

        <IonList class="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonItem fill="outline">
            <IonLabel position="floating">Username</IonLabel>
            <IonInput {...register("username", { required: true })}/>
            {errors.username && <p className="error_msg">Username is required</p>}
          </IonItem>
          <IonItem fill="outline">
            <IonLabel position="floating">Email</IonLabel>
            <IonInput {...register("email", { required: true })} />
            {errors.email && <p className="error_msg">Email is required</p>}

          </IonItem>
          <IonItem fill="outline">
            <IonLabel position="floating">Password</IonLabel>
            <IonInput type="password"
              {...register("password", { required: true })} />
              {errors.password && <p className="error_msg">Password is required</p>}
          </IonItem>
          <IonItem fill="outline">
            <IonLabel position="floating">Confirm password</IonLabel>
            <IonInput type="password"
              placeholder="Confirm password"
              {...register("cpassword", { required: true })}/>
             {errors.cpassword && <p className="error_msg">You must also confirm your password!</p>}
          </IonItem>
          <IonItem class="ion-margin">
            <button className="btn41-43 btn-43" type="submit">
              Sign up
            </button>
          </IonItem>
          </form>
        </IonList>
      </IonContent>
    </>
  );

  return <Page child={myContainer} title="Signup" backUrl="/page/login" />;
}

function LoginContainer(props: ActiveSessionProp) {
  const [resMsg, setMsg] = useState("");
  const [update, setUpdate] = useState(false);
  const store = useContext(StorageContextt);

  const [inputFields, setInputFields] = useState({
    username: "",
    password: "",
  });

  const handleInput = (ev: Event) => {
    const { id, value } = ev.target as HTMLIonInputElement;
    setInputFields((oldState) => ({
      ...oldState,
      [id]: value,
    }));
  };

  const submitInput = async () => {
    if (inputFields.username === "" || inputFields.password === "") {
      console.log("Empty fields");
    } else {
      const userInput = inputFields;
 
       await loginUser(userInput, async (res) => {
        
        if (res.success) {
          console.log(res)
          //sqlite
 
          //const userData = {...userInput, token: res.token, id: res.id, role: res.role};
          //await store?.store?.set("userSession", JSON.stringify(userData));
          let vals = [userInput.username, userInput.password, res.role, res.token]
          await props?.db!.runQuery(insertUserSessionQry, vals); 

          const sock = io(serverUrl!)
          props?.setActive!(true);
          props?.setUser!({
            username: userInput.username,
            password: userInput.password,
            role: res.role, 
            token: res.token,
            uid: res.id,
            socket: sock
          })
        }else{
          setMsg(res.message)
          setUpdate(true)
        }
      });  
    }
  };

  const myContainer = (
    <>
      <IonContent >
      <IonToast
          isOpen={update}
          position="top"
          message={resMsg}
          duration={3000}
          onDidDismiss={() => setUpdate(false)}
          buttons={[
            {
              text: "Dismiss",
              role: "cancel",
            },
          ]}
        />
        <IonList class="ion-padding">
          <IonItem fill="outline" className="my_item">
            <IonLabel position="floating">Username</IonLabel>
            <IonInput
              id="username"
              placeholder="Enter username"
              onIonChange={handleInput}
              value={inputFields.username}
            ></IonInput>
          </IonItem>
          <IonItem fill="outline" className="my_item">
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              id="password"
              type="password"
              onIonChange={handleInput}
              value={inputFields.password}
            ></IonInput>
          </IonItem>
          <IonItem class="ion-margin">
            <button className="btn41-43 btn-43 " onClick={submitInput}>
              Login
            </button>
          </IonItem>
          <IonItem class="ion-margin" detail={false} routerLink="/page/signup"> 
          <button className="btn41-43 btn-43 " onClick={submitInput}>
          Sign up
            </button>
          </IonItem>
          <IonItem>
            <p>
              You're new?{" "}
              <Link
                className=" btn41-43b  btn-43b customLink"
                to="/page/signup"
              >
                Sign up here
              </Link>
            </p>
          </IonItem>
        </IonList>
      </IonContent>
    </>
  );

  return <Page child={myContainer} title="Login" backUrl="/" />;
}
export { LoginContainer, SignupContainer };
