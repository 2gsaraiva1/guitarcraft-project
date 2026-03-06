/*
Este ficheiro inicia o servidor Express e liga todas as rotas da API.
*/

const express = require("express");
const cors = require("cors");
require("./db");

const guitarRoutes = require("./guitars");
const authRoutes = require("./auth");
const prebuiltRoutes = require("./prebuilt");
const cartRoutes = require("./cart");
const savedBuildRoutes = require("./saved-builds");
const siteMediaRoutes = require("./site-media");
const ordersRoutes = require("./orders");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/guitars", guitarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/prebuilt", prebuiltRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/saved-builds", savedBuildRoutes);
app.use("/api/site-media", siteMediaRoutes);
app.use("/api/orders", ordersRoutes);

app.get("/", (req, res) => {
  res.send("GuitarCraft backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
