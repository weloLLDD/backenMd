import express from "express";
import asyncHandler from "express-async-handler"; 
import { admin, protect } from "../middleware/AuthMiddleware.js"; 
import Order from "../models/orderModels.js";
import PDFDocument from "pdfkit";
import moment from "moment";

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



// ✅ ADMIN EXPORT PDF PAR MOIS
orderRouter.get(
  "/report/:month", // ex: 2025-07
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { month } = req.params;

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(`${month}-31`);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .populate("user", "name email")
      .sort({ createdAt: 1 })
      .lean();

    // Génération PDF
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rapport_ventes_${month}.pdf`
    );
    doc.pipe(res);

    // --- HEADER ---
    doc.fontSize(18).text("Mudilux Boutique", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Rapport des ventes pour ${month}`, { align: "center" });
    doc.moveDown(2);

    // --- LISTE DES COMMANDES ---
    orders.forEach((order, i) => {
      const date = moment(order.createdAt).format("DD/MM/YYYY HH:mm");
      doc.fontSize(10).text(`${i + 1}. Date: ${date}`);
      doc.text(`   Client: ${order.user?.name || "N/A"} (${order.user?.email || ""})`);
      doc.text(`   Adresse: ${order.shippingAdress?.adress || "N/A"}`);

      order.orderItems?.forEach(item => {
        doc.text(`      - ${item.name} (${item.qty}) : $${item.price}`);
      });

      doc.text(`   Total: $${order.totalPrice}`);
      doc.moveDown(0.5);
    });

    // --- TOTAL GLOBAL ---
    const totalGeneral = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    doc.moveDown();
    doc.fontSize(12).text(`TOTAL DES VENTES : $${totalGeneral.toLocaleString()}`, { align: "right" });

    doc.end();
  })
);
 
router.get(
  "/reportGroup",
  asyncHandler(async (req, res) => {
    const { month, category, userId } = req.query;

    if (!month) {
      res.status(400);
      throw new Error("Le mois est requis");
    }

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    // Construire le filtre dynamique
    const matchFilter = {
      createdAt: { $gte: start, $lt: end },
    };
    if (category) matchFilter.category = category;
    if (userId) matchFilter.userId = mongoose.Types.ObjectId(userId);

    // Agrégation
    const report = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$product",
          totalQty: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          _id: 0,
          name: "$_id",
          totalQty: 1,
          totalRevenue: 1,
          totalOrders: 1,
        },
      },
    ]);

    const totalRevenue = report.reduce((sum, item) => sum + item.totalRevenue, 0);

    res.json({ products: report, totalRevenue });
  })
);
 
export default orderRouter;
