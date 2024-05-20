import { Server } from "socket.io";
import Redis from "ioredis";
import { produceMessage } from "./kafka";

const pub = new Redis({
  host: process.env.REDIS_HOST!,
  port: +process.env.REDIS_PORT!,
  username: process.env.REDIS_USERNAME!,
  password: process.env.REDIS_PASSWORD!,
});
const sub = new Redis({
  host: process.env.REDIS_HOST!,
  port: +process.env.REDIS_PORT!,
  username: process.env.REDIS_USERNAME!,
  password: process.env.REDIS_PASSWORD!,
});

export class SocketService {
  private _io: Server;
  private MESSAGES_CHANNEL = "MESSAGES";
  constructor() {
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe(this.MESSAGES_CHANNEL);
  }

  get io() {
    return this._io;
  }

  public initListeners() {
    const io = this._io;
    io.on("connect", (socket) => {
      console.log(`New Socket connected`, socket.id);
      socket.on("event:message", async ({ message }: { message: string }) => {
        //  Publish this message to redis
        await pub.publish(this.MESSAGES_CHANNEL, JSON.stringify(message));
      });
      sub.on("message", async (channel, message) => {
        if (channel === this.MESSAGES_CHANNEL) {
          io.emit("message", JSON.stringify({ message }));
          await produceMessage(message);
        }
      });
    });
  }
}
