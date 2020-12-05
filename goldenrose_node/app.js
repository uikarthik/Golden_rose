require("dotenv").config();
require("./config/connection");
require("./config/settings");
const app = require("./routes/route");
const jwt = require("jsonwebtoken");
const http = require("http");
const { startSocket } = require("./core/socket/server");

const server = http.createServer(app);
startSocket(server);


const port = process.env.port ;

server.listen(port, () => {
  console.log("API started & Web Socket is running on http://localhost:%d", port);
});