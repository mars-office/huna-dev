import inquirer from "inquirer";
import { createBus } from "./services/masstransit.service.mjs";
import { MessageType } from "masstransit-rabbitmq/dist/messageType.js";

(async () => {
  const rabbitMqSettings = await inquirer.prompt([
    {
      type: "input",
      name: "hostname",
      default: "localhost",
      message: "RabbitMQ host?",
    },
    {
      type: "number",
      name: "port",
      default: 5672,
      message: "RabbitMQ port?",
    },
    {
      type: "input",
      name: "username",
      default: "admin",
      message: "RabbitMQ user?",
    },
    {
      type: "password",
      name: "password",
      message: "RabbitMQ password?",
    },
    {
      type: "input",
      name: "vhost",
      default: "/",
      message: "RabbitMQ vhost?",
    },
  ]);

  console.log("Creating bus and connecting...");
  createBus(
    rabbitMqSettings.hostname + ":" + rabbitMqSettings.port,
    rabbitMqSettings.username,
    rabbitMqSettings.password,
    rabbitMqSettings.vhost,
    async (bus) => {
      while (!bus.stopped) {
        const messageSettings = await inquirer.prompt([
          {
            type: "input",
            message: "Message type?",
            name: "messageType",
            askAnswered: true,
            default: 'NotificationRequest'
          },
          {
            type: "input",
            message: "Message namespace?",
            name: "namespace",
            askAnswered: true,
            default: 'Huna.Notifications.Contracts'
          },
          {
            type: "editor",
            name: "payload",
            message: "Payload as JSON?",
            askAnswered: true,
          },
        ]);
        try {
          console.log("Will send ", messageSettings);
          const mt = new MessageType(
            messageSettings.messageType,
            messageSettings.namespace
          );
          const se = bus.sendEndpoint({
            durable: true,
            exchange: mt.toExchange(),
            exchangeType: "fanout",
            messageType: mt,
          });
          await se.send(JSON.parse(messageSettings.payload));
          console.log('Sent!');
        } catch (err) {
          console.error("Error while sending.", err);
        }
      }
    },
    (e) => {
      console.error(e);
    }
  );
})();
