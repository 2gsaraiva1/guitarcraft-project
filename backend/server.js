/*
Este ficheiro inicia o servidor Express e liga todas as rotas da API.
*/

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("./db");

const guitarRoutes = require("./guitars");
const authRoutes = require("./auth");
const prebuiltRoutes = require("./prebuilt");
const cartRoutes = require("./cart");
const savedBuildRoutes = require("./saved-builds");
const siteMediaRoutes = require("./site-media");
const ordersRoutes = require("./orders");

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, "../frontend");

app.use(cors());
app.use(express.json());

app.use("/api/guitars", guitarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/prebuilt", prebuiltRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/saved-builds", savedBuildRoutes);
app.use("/api/site-media", siteMediaRoutes);
app.use("/api/orders", ordersRoutes);

// Serve os ficheiros estáticos do frontend em produção/deploy.
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  const shopPath = path.join(frontendPath, "shop.html");
  const homepagePath = fs.existsSync(indexPath) ? indexPath : shopPath;
  res.sendFile(homepagePath);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
