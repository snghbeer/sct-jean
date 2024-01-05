require('dotenv').config();
const express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require("mongoose");
const {RouterHandler} = require('./routes/router');
const { RabbitServer } = require("./micro/rabbitmq");

const app = express();
const cors = require('cors');
const http = require('http');
const fs = require( 'fs' );
const https = require('https');
const { loadConfig, getConfig } = require('./micro/initConfig');


const { Server } = require('socket.io');
const PORT = process.env.PORT ;
const dbURI = process.env.dbURI || "mongodb://nivonj:Student1@127.0.0.1:27017";
const dbName = process.env.dbName;
let config;

mongoose.set('strictQuery', true);
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(session({
    name: process.env.cookieName,
    secret: process.env.TOKEN_SECRET,
    resave:false,
    saveUninitialized: true,
    cookie: {
        maxAge: 86400000, //24h
        secure: true //http, true for https
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
}); 

const server = http.createServer(app); //dev
//const server = https.createServer(app); //production
const io = new Server(server, {
    cors: {
        //origin: "http://192.168.1.61:8100", //url of frontend
        methods: ['GET', 'POST', 'PUT', 'DELETE'] //methods we are accepting
    }
})

const routerHandler = new RouterHandler(io)
const rabbitmq = new RabbitServer(io)


//Cors middleware
app.use(cors({
    credentials: true,
    origin: true
}));

app.use('/api', routerHandler.homeRouter); //uses router

//alpha phase: this is used to use 1 sessionId per user
io.use((socket, next) => {
    const sessionId = socket.handshake.query.sessionId;
    socket.sessionData = sessionId;
    next();
})

server.listen(PORT, "0.0.0.0" ,  async() => {
    try{
        console.log(`App listening on port ${PORT}`)
        mongoose.connect(`${dbURI}/${dbName}`)

        mongoose.connection.once("open", () => {
            console.log("Connection with database has been made!");
            //init rabbitmq consumer
            rabbitmq.initServer(() => {
                console.log("Rabbitmq is online")


                config = loadConfig();
                if (!config) {
                    const intervalId = setInterval(() => {
                        config = loadConfig();
                        // If configuration is not empty, stop trying to update it
                        if (config) {
                            clearInterval(intervalId);
                            console.log("Config loaded!")
                            console.log(config);
                        }
                    }, 5000);
                }
                else{
                    console.log("Config loaded!")
                    console.log(config);
                }
            })

        })

        io.on('connection', (socket) => {
            console.log(`User ${socket.id} connected`)
            console.log('Session data:', socket.sessionData);

            socket.on('new_order', () => {
                console.log("New order arrived!")
                socket.emit("notif", {
                    message: "New order!"
                })
            })

            socket.on('lockOrder', () => {
                socket.emit("refresh", {
                   orderId: "orderId",
                   waiter: "Stephano"
                })
            })
        })
    }
    catch(err){
        console.log(err)
        //console.log("Closing database connection")
        //mongoose.connection.close()
    }
})

//In case server shuts down, we need to close mongoose connection
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log("Database connection closed!")
        process.exit(0);
})});

