import express from "express";  
import dotenv from "dotenv";
import ImportData from "./DataImport.js";
import connectDatabase from "./configure/mongoConf.js";
import productRoute from "./Routes/productRoutes.js";
import userRouter from "./Routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";   
import orderRouter from "./Routes/orderRoutes.js";
import orderRouterV from "./Routes/orderRoutesV.js";
import orderRouters from "./Routes/orderRoutess.js";
import cors from "cors";
import depenseRoute from "./Routes/depenseRoutes.js"; 
import archiveRoutes from "./Routes/archiveRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/import", ImportData);
app.use("/api/products", productRoute); 
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/ordersV", orderRouterV);
app.use("/api/orderss", orderRouters);
app.use("/api/depense", depenseRoute);
app.use("/api/archives", archiveRoutes);

app.get("/api/config/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "");
});

app.get("/", (req, res) => {
  res.send("API is running ✅");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  connectDatabase()
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));
});
