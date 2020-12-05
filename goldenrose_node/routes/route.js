const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const bodyParser = require("body-parser");
const expressip = require("express-ip");
const useragent = require("express-useragent");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
var router = express.Router();

const uuid = require('uuid')

var cookieParser = require("cookie-parser");
var session = require("express-session");
var compression = require("compression");
const FileStore = require('session-file-store')(session);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 500, // limit each IP to 500 requests per windowMs
});

app.use(limiter);

app.use(compression());

app.use(cors());

app.use(helmet());

app.use(helmet.hidePoweredBy({ setTo: "PHP 4.2.0" }));

app.use(useragent.express());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(expressip().getIpInfoMiddleware);
app.use(hpp());
// To remove data, use:
app.use(mongoSanitize());
// Or, to replace prohibited characters with _, use:
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

app.use(expressip().getIpInfoMiddleware);

app.set("trust proxy", 1); // trust first proxy

app.use(cookieParser());


// app.use(session({
//   genid: (req) => {
//     console.log('Inside the session middleware')
//     console.log(req.sessionID)
//     return uuid.v4() // use UUIDs for session IDs
//   },
//   store: new FileStore(),
//   secret: 'WX3CV5FNuZE1vwCJ2tCIww',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false },
// }))

app.use(
  session({
    secret: "WX3CV5FNuZE1vwCJ2tCIww",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use('/api/v1', require('./api/v1/index'));
app.use('/api/v2', require('./api/v2/index'));



module.exports = app;