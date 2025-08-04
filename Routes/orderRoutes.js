import express from "express";
import asyncHandler from "express-async-handler"; 
import { admin, protect } from "../middleware/AuthMiddleware.js"; 
import Order from "../models/orderModels.js";

const orderRouter = express.Router();

// ✅ USER LOGIN ORDERS
orderRouter.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.find({}).sort({ _id: -1 });
    res.json(order);
  })
);

// ✅ ADMIN GET ALL ORDERS
orderRouter.get(
  "/all",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name email");
    res.json(orders);
  })
);


// ✅ GET ORDERS FOR LOGGED IN USER (son propre panier, sauf admin = toutes commandes)
orderRouter.get(
  "/myorders",
  protect,
  asyncHandler(async (req, res) => {
    console.log("Token OK. Utilisateur connecté :", req.user._id);
    const user = req.user;

    if (user.isAdmin) {
      const orders = await Order.find({})
        .sort({ _id: -1 })
        .populate("user", "name email");
      res.json(orders);
    } else {
      const orders = await Order.find({ user: user._id }).sort({ _id: -1 });
      res.json(orders);
    }
  })
);

  orderRouter.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAdress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error("No order Items");
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAdress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createOrder = await order.save();
    res.status(201).json(createOrder);
  })
);


// ✅ GET ORDER BY ID
orderRouter.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
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

// ✅ PAY ORDER
orderRouter.put(
  "/:id/pay",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status_time: req.body.status,
        update_time: req.body.status,
        email_adress: req.body.email_adress,
      };
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not Found");
    }
  })
);







export default orderRouter;
