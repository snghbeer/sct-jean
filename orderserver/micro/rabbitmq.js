var amqp = require("amqplib/callback_api");
require("dotenv").config();

/* const servers = [
  `amqp://${process.env.RABBITUSER}:${process.env.RABBITPASS}@217.182.187.51:${process.env.RABBITPORT}`,
  `amqp://${process.env.RABBITUSER}:${process.env.RABBITPASS}@141.95.40.32:${process.env.RABBITPORT}`,
  `amqp://${process.env.RABBITUSER}:${process.env.RABBITPASS}@178.32.226.75:${process.env.RABBITPORT}`,
]; */

const rabbitmqServer = `${process.env.RABBITHOST}:${process.env.RABBITPORT}`;
//const rabbitmqServer = `${process.env.RABBITHOST}`;
const routingKeys = ["*.order.*", "*.payment.*"];

class RabbitServer {
  socket;
  serverIndex = 0;

  constructor(socket) {
    this.socket = socket;
  }

  sendMsg(msg) {
    try {
      let exchange = process.env.RABBITMQ_EXCHANGE;
      var key = "order.order.add";

      if (this.channel && this.connection) {
        this.channel.assertExchange(exchange, "topic");
        const message = {
          msg: msg,
          time: Date.now(),
        };
        this.channel.publish(
          exchange,
          key,
          Buffer.from(JSON.stringify(message))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async #initRoutingKeys(channel) {
    const exchangeName = "amq.topic";
    try {
      for (let i = 0; i < routingKeys.length; i++) {
        try {
          const routingKey = routingKeys[i];
          await channel.bindQueue("order", exchangeName, routingKey);
        } catch (err) {
          console.log(`Routing key already exists`);
        }
      }
    } catch (error) {
      console.log(`Exchange ${exchangeName} already exists`);
    }
  }

  async #initQueue(channel) {
    try {
      channel.assertQueue("order", {
        durable: true,
      });
    } catch (error) {
      console.log(`Queue planning already exists!`);
    }
  }

  #handleMessages(aChannel) {
    aChannel.consume("order", async (data) => {
      try {
        console.log(" [x] Got from %s:", data.fields.routingKey);
        let parsedData = JSON.parse(data.content.toString());
        //each operation handler executes based on a mapping of {key: operation}
        //remember a routing is like: route.key.operation e.g. checkout.order.new
        const keys = data.fields.routingKey.split(".");
        const key = keys[1];
        const action = keys[2];

        switch (key) {
          case "order": {
            if (action === "new") {
              console.log(parsedData);
              this.socket.emit("new_order", {
                id: parsedData.uuid,
                message: "New order!",
              });
            }
            aChannel.ack(data);
            break;
          }

          default:
            aChannel.ack(data);
            break;
        }
      } catch (err) {
        aChannel.ack(data);
        console.log(err);
      }
    });
  }

  #initRabbit(callback) {
   // const server = servers[this.serverIndex]; // Use class level server index

    amqp.connect(rabbitmqServer,/* server, */ async (err, conn) => {
      if (err) {
        // Error handling and moving to next server if unable to connect
        console.error(
          `Failed to connect to RabbitMQ at ${rabbitmqServer}:`,
          err.message
        );

        // try the next server or start from the first server if all servers have been tried
        //this.serverIndex = this.serverIndex + 1 < servers.length ? this.serverIndex + 1 : 0;

        // delay the reconnection attempt by 5 seconds
        this.reconnectionTimeout = setTimeout(
          () => this.#initRabbit(callback),
          1000
        );

        return;
      }
      this.connection = conn;

      // handle connection error
      this.connection.on("error", (err) => {
        if (err.message !== "Connection closing") {
          console.error("RabbitMQ connection error:", err.message);
        }
      });

      // log reconnection
      if (this.reconnectionTimeout) {
        console.log("Reconnected to RabbitMQ!");
      }

      // clear reconnection timeout
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;

      // create channel
      this.connection.createChannel(async (err, aChannel) => {
        console.log("Connection with RabbitMQ has been made!");
        this.channel = aChannel;

        const IntervalHeartbeat = setInterval(() => {}, 5000);

        // trying to reconnect on a closed connection state using the same server index
        this.connection.on("close", () => {
          console.error("RabbitMQ connection closed");
          clearInterval(IntervalHeartbeat);
          this.connection = null;

          // delay the reconnection attempt by 5 seconds
          this.reconnectionTimeout = setTimeout(
            () => this.#initRabbit(callback),
            1000
          );

          console.log("Trying to reconnect to RabbitMQ...");
        });

        //TOPICS
        //Initalize the queues & routing keys dynamically
        this.#initQueue(aChannel);
        this.#initRoutingKeys(aChannel);

        //handles the incoming messages
        this.#handleMessages(aChannel);

        callback(aChannel);
      });
    });
  }

  //MAIN
  initServer(callback) {
    this.#initRabbit(callback);
  }
}

module.exports = {
  RabbitServer: RabbitServer,
};
