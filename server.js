const express = require("express");
const path = require("path");
const router = require("./router");
const ip = require("ip");
const { ExpressPeerServer } = require("peer");
const cors = require("cors");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use("/", router);

// const server = app.listen(80, "0.0.0.0", function (server) {
//   console.log(ip.address("public"));
// });
const server = app.listen(4001, function () {
  console.log('server running on port 4001 ');
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
