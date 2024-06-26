import express from "express";
import http from "http";
import "./setup/init.redis";
import "./setup/init.mongo";
import cors, { CorsOptions } from "cors";

// import cors from "./setup/cors";
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
dotenvConfig();
dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

const SERVER_URL = "0.0.0.0";
// Store WebSocket connections in a map
// app.use(cors);
app.use(cors({
  origin: '*', // Allows all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
  allowedHeaders: 'Content-Type,Authorization', // Allowed headers
  optionsSuccessStatus: 204 // For legacy browser support
}));

app.use(express.json());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);
// app.use(express.json({ limit: "100mb" }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static(process.env.EFIELOUNGE_PUBLIC_FOLDER!));

app.get('/test', (req:any, res:any) => {
  res.status(200).send('Hello from Efielounge Backend Server\n');
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/menu", menuRouter);
app.use("/api/v1/cart", clientCartRouter);
app.use("/api/v1/accounts", accountsRouter);

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
app.set("views", "src/views/templates");

const server = http.createServer(app);
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
