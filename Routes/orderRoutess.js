import express from "express";
import asynHandler from "express-async-handler"; 
import { admin, protect } from "../middleware/AuthMiddleware.js";
import Order from "../models/orderModels.js";

const orderRouters = express.Router();

//USER LOGIN ORDERS

orderRouters.get(
    "/",
    protect,
    asynHandler(async (req, res) => {
      const order = await Order.find({}).sort({ _id: -1 });
      res.json(order);
    })
  );
  
  
  //ADMIN GET ALL ORDERS
  
  orderRouters.get(
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
  

//Create order
orderRouters.post(
  "/",
  protect,
  asynHandler(async (req, res) => {
    const {
      orderItems,
      shippingAdress,
      paymentMethod,
      itemsPrice,
      taxtPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order Items");
      return;
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAdress,
        paymentMethod,
        itemsPrice,
        taxtPrice,
        shippingPrice,
        totalPrice,
      });

      const createOrder = await order.save();
      res.status(201).json(createOrder);
    }
  })
);

//GET ORDER BY ID

orderRouters.get(
  "/:id",
  protect,
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


//pay order

orderRouters.put(
  "/:id/pay",
  protect,
  asynHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (order) {
      order.isPaid =true;
      order.paidAt=Date.now();
      order.paymentResult ={
        id:req.body.id,
        status_time:req.body.status,
        update_time:req.body.status,
        email_adress:req.body.email_adress,
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not Found");
    }
  })
);

// ✅ GET ORDERS FOR LOGGED IN USER (Only his own)
orderRouters.get(
  "/myorders",
  protect,
  asynHandler(async (req, res) => {
    const user = req.user;
    if (user.isAdmin) {
      // Si admin, retourne toutes les commandes
      const orders = await Order.find({})
        .sort({ _id: -1 })
        .populate("user", "name email");
      res.json(orders);
    } else {
      // Sinon, seulement les commandes de l'utilisateur connecté
      const orders = await Order.find({ user: user._id }).sort({ _id: -1 });
      res.json(orders);
    }
  })
);









export default orderRouters;
