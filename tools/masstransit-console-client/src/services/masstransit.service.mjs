import masstransit from "masstransit-rabbitmq";

export const createBus = (
  rabbitMqHost,
  rabbitMqUser,
  password = undefined,
  vhost = "/",
  onConnected = undefined,
  onError = undefined,
  onDisconnected = undefined
) => {
  if (password) {
    password = ":" + password;
  }
  const bus = masstransit.default({
    host: `${rabbitMqUser}${password}@${rabbitMqHost}`,
    virtualHost: vhost,
  });

  bus.on("error", (err) => {
    console.error("RabbitMQ error");
    console.error(err);
    if (onError) {
      onError(err);
    }
  });

  bus.on("disconnect", () => {
    console.log("RabbitMQ connectivity lost");
    if (onDisconnected) {
      onDisconnected();
    }
  });

  bus.on("connect", () => {
    console.log("RabbitMQ connectivity achieved");
    if (onConnected) {
      setTimeout(() => {
        onConnected(bus);
      }, 2000);
    }
  });

  return bus;
};
