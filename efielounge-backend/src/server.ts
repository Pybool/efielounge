import express from "express";
import http from "http";
import "./setup/init.redis";
import "./setup/init.mongo";
import cors, { CorsOptions } from "cors";
import { Server as SocketIOServer } from "socket.io";
import { config as dotenvConfig } from "dotenv";
import logger from "./setup/logger";
import session from "express-session";
import passport from "passport";
import app from "./setup/_app";
import authRouter from "./routes/v1/authentication.route";
import adminRouter from "./routes/v1/admin.route";
import accountsRouter from "./routes/v1/accounts.route";
import menuRouter from "./routes/v1/menu.route";
import clientCartRouter from "./routes/v1/cart.route";
import orderRouter from "./routes/v1/orders.route";
import transactionRouter from "./routes/v1/transaction.route";
import Menu from "./models/menu/menu.model";
import { decode, decodeExt } from "./middlewares/jwt";
import Order from "./models/Orders/order.model";
import Accounts from "./models/Accounts/accounts.model";
import { CustomSocket, socketAuth } from "./middlewares/socketAuth";
import { setupSocketHandlers } from "./controllers/v1/sockets/socket.controller";
import { sessionMiddleware } from "./middlewares/session";
import { requestChatToken } from "./services/v1/chats/initchat.service";
import Xrequest from "./interfaces/extensions.interface";
import chatRouter from "./routes/v1/chats.route";

dotenvConfig();
dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

const SERVER_URL = "0.0.0.0";

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(sessionMiddleware);
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
console.log("PUBLIC FOLDER ", process.env.EFIELOUNGE_PUBLIC_FOLDER);
app.use(express.static(process.env.EFIELOUNGE_PUBLIC_FOLDER!));
app.use(express.static(process.env.EFIELOUNGE_PUBLIC_FOLDER2!));

app.get("/test", async (req: any, res: any) => {
  res.status(200).send("Hello from Efielounge Backend Server\n");
});

app.get(
  "/api/v1/paystack/get-public-key",
  decode,
  async (req: any, res: any) => {
    try {
      const key = `EFIELOUNGE_${process.env.NODE_ENV!.toUpperCase()}_PAYSTACK_PUBLIC_KEY`;
      return res.send({
        status: true,
        PUBLIC_KEY: process.env[key] || null,
      });
    } catch (error) {
      return res.send({
        status: false,
        PUBLIC_KEY: null,
      });
    }
  }
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/menu", menuRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/cart", clientCartRouter);
app.use("/api/v1/accounts", accountsRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/chats", chatRouter);
const generateTokenForUser = async (req: Xrequest, res: any) => {
  try {
    const { publisher, subscriber, chatId } = req.body;
    
    const data = await requestChatToken(
      publisher, subscriber, chatId
    );
    if (data) {
      return res.status(200).json({ status: true, data });
    }
    return res.status(400).json({ token: null });
  } catch (error) {
    console.log("Token Generation error =====> ", error)
    return res.status(500).json({ token: null });
  }
};
app.post("/api/v1/get-chat-token", decodeExt, generateTokenForUser);
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  res.status(500).json({ error: "Something went wrong 5xx" });
});

app.use(function (err: any, req: any, res: any, next: any) {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === "dev" ? err : {};
  res.status(err.status || 500);
  res.json({ message: "Something went wrong 5xx " + err });
});

if (!process.env.NODE_ENV) {
  process.exit(1);
}

app.use((req, res, next) => {
  const error: any = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use((err: any, req: any, res: any, next: any) => {
  if (err.status === 404) {
    res.status(404).json({ status: false, message: err.message });
  } else {
    next(err);
  }
});

app.set("view engine", "ejs");
app.set("views", "src/templates");

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
});
io.use(socketAuth);
const wrap =
  (middleware: any) => (socket: CustomSocket, next: (err?: any) => void) => {
    middleware(socket.request, {}, next);
  };
io.use(wrap(sessionMiddleware));
app.set("io", io);
setupSocketHandlers(io);
const PORT = process.env.EFIELOUNGE_MAIN_SERVER_PORT || 8000;

let environment = "Development";
if (process.env.NODE_ENV === "prod") {
  environment = "Production";
}

function generateAsciiArt(text: string) {
  const length = text.length;
  const line = Array(length + 8)
    .fill("-")
    .join("");
  const emptyLine = "|" + " ".repeat(length + 6) + "|";

  return `
 ${line}
|  ${text}  |
|  😊 ${environment} Server started successfully.  |
|  🎧 Listening on port ${PORT}...  |
 ${line}
`;
}

server.listen(PORT, () => {
  const serverMessage = generateAsciiArt(
    `Efielounge ${environment} Server is running on ${SERVER_URL}:${PORT}`.toUpperCase()
  );
  logger.info(serverMessage);
});
