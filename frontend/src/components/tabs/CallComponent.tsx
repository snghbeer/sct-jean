import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonCol,
} from "@ionic/react";
import { callSharp } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import Peer, {  MediaConnection } from "peerjs";
import io, { Socket } from "socket.io-client";
import callFx from "./assets/call.wav";
import busy from "./assets/busy.wav";

import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../interfaces/interfaces";

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default function CallComponent() {
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  const [timer, setTimer] = useState(0);
  const [session, setSession] = useState<
    Socket<ServerToClientEvents, ClientToServerEvents> | null | undefined
  >();
  const [callSession, setCall] = useState<MediaConnection | null>();

  const [peerId, setPeerId] = useState<string | undefined>();
  const [socketId] = useState<string>("receptionManager");
  //const user = useContext(UserContext);
  const remoteAudioRef = useRef<HTMLAudioElement>(null); //remote audio
  const audioRef = useRef<HTMLAudioElement>(null); //bip bip
  const repondeurRef = useRef<HTMLAudioElement>(null); //repondeur

  const callButtonRef = useRef<HTMLIonButtonElement>(null);

  const microStream = useRef<MediaStream>(); //my local micro stream

  const peerInstance = useRef<Peer | null>(null);

  //step 1: send request to check if you can call
  const callReception = () => {
    try {
      if (
        peerInstance &&
        peerInstance.current &&
        peerInstance.current.id !== "receptionManager" &&
        session
      ) {
        session.emit("callRequest");
      }
    } catch (error) {
      console.error("Failed to get local stream", error);
    }
  };

  //stop or decline
  const endCall = () => {
    if (isCalling) {
      session?.emit("declineCall");
      stopCall()
    } else console.log("you are not in a call");
  };

  //Step 4: accept call
  const acceptCall = () => {
    if (callSession) {
      session?.emit("acceptCall");
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: { echoCancellation: true } })
        .then((stream: MediaStream) => {
          callSession!.answer(stream);
          microStream.current = stream;

          callSession!.on("stream", (remoteStream: MediaStream) => {
            setIsCalling(true);
            setIsInCall(true);
            console.log("You accepted the call");
            const remoteAudio = new Audio();
            remoteAudio.srcObject = remoteStream;
            remoteAudio.play();
            remoteAudioRef.current!.srcObject = remoteStream;
          });
        })
        .catch((error: any) => {
          console.error("Failed to get local stream", error);
        });
    }
  };

  function stopCall(){
    setIsCalling(false);
    setIsInCall(false)
    if (microStream.current) {
      microStream.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    remoteAudioRef.current!.srcObject = null;
    setCall(null);
    setTimer(0);
    if(audioRef.current){
      audioRef.current.pause();
      audioRef.current.currentTime = 0

    }
  }

  useEffect(() => {
    const peer = new Peer(socketId); //set nothing for customers
    const sock = io(process.env.REACT_APP_CALL_SERVER_URL!, {
      reconnection: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      secure: true
    });
    setSession(sock);
    if (socketId === "receptionManager") {
      sock.emit("registerManager");
    }

    peer.on("open", (id: string) => {
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      console.log("Connection established with peer ");
    });

    //Step 2:  caller: reception is not busy => call reception
    sock.on("callAvailable", async () => {
      const getUserMedia = navigator.mediaDevices.getUserMedia;
      const stream = await getUserMedia({
        video: false,
        audio: { echoCancellation: true },
      });
      const localStream = stream;
      microStream.current = localStream;

      const acall = peerInstance!.current!.call("receptionManager", localStream);
      setIsCalling(stream.active);
      audioRef.current!.play()

      acall.on("stream", (remoteStream: MediaStream) => {
        const remoteAudio = new Audio();
        remoteAudio.srcObject = remoteStream;
        remoteAudio.play();
      });
    });

    // reception is busy
    sock.on("callDeclined", () => {
      console.log("call declined!");
      if(socketId !== "receptionManager"){
        repondeurRef.current?.play()
        stopCall()
      }
    });

    //step 5: caller: call started
    sock.on("callAccepted", () => {
      audioRef.current!.pause();
      audioRef.current!.currentTime = 0;
      setIsInCall(true);
      console.log("Your call started successfully");
    });

    sock.on("endCall", () => {
      console.log("call ended!");
      stopCall()
    });

    peerInstance.current = peer;

    return () => {
      // Clean up the event listeners and close the peer connection
      peer.off("open");
      peer.off("connection");
      peer.destroy();

      sock.off("callAvailable");
      sock.off("callDeclined");
      sock.off("callAccepted");
      sock.off("endCall");
    };
  }, []);

  //Step 3: we got an incoming call
  useEffect(() => {
    if (
      peerInstance &&
      peerInstance.current &&
      peerInstance.current.id === "receptionManager"
    ) {
      peerInstance.current.on("call", (call: MediaConnection) => {
        console.log("Incoming call");
        setIsCalling(true)
        setCall(call);
      });
    }
  }, [peerInstance]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCalling) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000); // Update timer every 1 second (1000 milliseconds)
    } else {
      clearInterval(interval!);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isCalling]);

  //for the caller when reception is not answering within time limit
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isCalling && socketId !== "receptionManager" && !isInCall) {
      timeoutId = setTimeout(async () => {
        session?.emit("declineCall");
        audioRef.current!.pause();
        setIsCalling(false);
        setIsInCall(false);
        audioRef.current!.currentTime = 0;
        console.log("Receptionist is busy!")
      }, 10000);
  
      return () => {
        clearTimeout(timeoutId); // Clear the timeout if the component unmounts or if conditions change
      };
    }
  }, [isCalling, isInCall]);

  return (
    <IonPage>
      <IonHeader /* hidden={pf.isNative} */>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="vertical-center">
          <IonCard class="hotelInfoCard fadeIn">
            <IonHeader class="callHeader">
              <IonToolbar>
                <IonCardTitle class="horizontal-center">
                  Call reception
                </IonCardTitle>
              </IonToolbar>
            </IonHeader>
            <IonCardHeader class="ion-margin-top">
              <IonRow class="horizontal-center ion-margin-top">
                <div className="pulse">
                  <IonIcon color="dark" size="large" icon={callSharp} />
                </div>
              </IonRow>
              <IonRow class="horizontal-center">
                {formatTime(timer)} {/* Display formatted timer */}
              </IonRow>
              <IonRow>
                <h1>Id is {peerId}</h1>
              </IonRow>
              <IonRow>
                <h3>Micro is active: {isCalling ? "yes" : "no"}</h3>
              </IonRow>
              <IonRow>
                <div>
                  <audio ref={remoteAudioRef} />
                </div>
                <div>
                  <audio ref={audioRef} src={callFx}/>
                  <audio ref={repondeurRef} src={busy}/>

                </div>
              </IonRow>
            </IonCardHeader>
            <IonCardContent class="horizontal-center ion-margin-top">
              <IonRow class="ion-padding" style={{ width: "100%" }}>
                <IonCol class="vertical-center">
                  <>
                    {peerInstance.current?.id === "receptionManager" ? (
                      <IonButton
                        ref={callButtonRef}
                        style={{ width: "100%" }}
                        color={"dark"}
                        disabled={!isCalling||isInCall}
                        onClick={acceptCall}
                      >
                        <IonIcon color={"success"} icon={callSharp} />
                      </IonButton>
                    ) : (
                      <IonButton
                        ref={callButtonRef}
                        style={{ width: "100%" }}
                        color={"dark"}
                        disabled={isCalling}
                        onClick={callReception}
                      >
                        <IonIcon color={"success"} icon={callSharp} />
                      </IonButton>
                    )}
                  </>
                </IonCol>
                <IonCol class="vertical-center">
                  <IonButton
                    style={{ width: "100%" }}
                    color={"dark"}
                    disabled={!isCalling && !isInCall}
                    onClick={endCall}
                  >
                    <IonIcon color={"danger"} icon={callSharp} />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
}
