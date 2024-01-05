import { Peer } from "peerjs";

export class VoiceChatService{
    peer: Peer|undefined;

    constructor(id: string){
        this.peer = new Peer(id, {
            host: '192.168.1.61',
            port: 5003,
            pingInterval: 5000
        });
        console.log(this.peer.id);
    }

    callReception(){
        const conn = this.peer!.connect("reception_manager");
        conn.on("open", () => {
            conn.send("hi!");
        });

        
    }

    listenCall(){
        this.peer!.on("connection", (conn) => {
            conn.on("data", (data) => {
                console.log(data);
            });
            conn.on("open", () => {
                conn.send("hello!");
            });
        });
    }


}