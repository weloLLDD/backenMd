import express from "express";
import asynHandler from "express-async-handler";
import { admin, protect } from "../middleware/AuthMiddleware.js";
import Order from "../models/orderModels.js";

const orderRouterV = express.Router();


orderRouterV.get(
  "/all",
  protect,
  admin,
  asynHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name email");
    res.json(orders);
  })
);


// ALL USERS
orderRouterV.get(
  "/",
  protect,
  admin,
  asynHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name email");
    res.json(orders);
  })
);

//GET ORDER BY ID

orderRouterV.get(
  "/:id",
  protect,
  admin,
  asynHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order not Found");
    }
  })
);








export default orderRouterV;
