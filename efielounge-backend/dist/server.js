"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
require("./setup/init.redis");
require("./setup/init.mongo");
const cors_1 = __importDefault(require("./setup/cors"));
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("./setup/logger"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const _app_1 = __importDefault(require("./setup/_app"));
const authentication_route_1 = __importDefault(require("./routes/v1/authentication.route"));
const admin_route_1 = __importDefault(require("./routes/v1/admin.route"));
const accounts_route_1 = __importDefault(require("./routes/v1/accounts.route"));
const menu_route_1 = __importDefault(require("./routes/v1/menu.route"));
const cart_route_1 = __importDefault(require("./routes/v1/cart.route"));
(0, dotenv_1.config)();
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV}` });
const SERVER_URL = "0.0.0.0";
// Store WebSocket connections in a map
_app_1.default.use(cors_1.default);
_app_1.default.use(express_1.default.json());
_app_1.default.use((0, express_session_1.default)({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
}));
// app.use(express.json({ limit: "100mb" }));
_app_1.default.use(passport_1.default.initialize());
_app_1.default.use(passport_1.default.session());
_app_1.default.use(express_1.default.urlencoded({ extended: true }));
_app_1.default.use(express_1.default.static("public"));
_app_1.default.use(express_1.default.static(process.env.EFIELOUNGE_PUBLIC_FOLDER));
_app_1.default.get('/test', (req, res) => {
    res.status(200).send('Hello from Efielounge Backend Server\n');
});
_app_1.default.use("/api/v1/auth", authentication_route_1.default);
_app_1.default.use("/api/v1/admin", admin_route_1.default);
_app_1.default.use("/api/v1/menu", menu_route_1.default);
_app_1.default.use("/api/v1/cart", cart_route_1.default);
_app_1.default.use("/api/v1/accounts", accounts_route_1.default);
_app_1.default.use((err, req, res, next) => {
    console.error(err.stack);
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof SyntaxError) {
        return res.status(400).json({ error: "Invalid JSON" });
    }
    res.status(500).json({ error: "Something went wrong 5xx" });
});
_app_1.default.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV === "dev" ? err : {};
    res.status(err.status || 500);
    res.json({ message: "Something went wrong 5xx " + err });
});
if (!process.env.NODE_ENV) {
    process.exit(1);
}
_app_1.default.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});
_app_1.default.use((err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).json({ status: false, message: err.message });
    }
    else {
        next(err);
    }
});
_app_1.default.set("view engine", "ejs");
_app_1.default.set("views", "src/views/templates");
const server = http_1.default.createServer(_app_1.default);
const PORT = process.env.EFIELOUNGE_MAIN_SERVER_PORT || 8000;
let environment = "Development";
if (process.env.NODE_ENV === "prod") {
    environment = "Production";
}
function generateAsciiArt(text) {
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
    const serverMessage = generateAsciiArt(`Efielounge ${environment} Server is running on ${SERVER_URL}:${PORT}`.toUpperCase());
    logger_1.default.info(serverMessage);
});
