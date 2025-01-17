import http from "http";
import { SocketService } from "./services/socket";
import { startMessageConsumer } from "./services/kafka";

async function init() {
  startMessageConsumer();
  const socketService = new SocketService();
  const httpServer = http.createServer();

  const port = process.env.PORT ?? 8000;
  socketService.io.attach(httpServer);

  httpServer.listen(port, () => console.log(`HTTP server started at ${port}`));
  socketService.initListeners();
}

init();
