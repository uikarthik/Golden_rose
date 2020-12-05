const express = require("express");
const app = express();
const SampleController = require("./controllers/sampleController");
app.use("/sample", SampleController);
module.exports = app;
