import express from "express";
import asynHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { admin, protect } from "../middleware/AuthMiddleware.js";

const productRoute = express.Router();
//products
productRoute.get(
  "/",
  asynHandler(async (req, res) => {
    const pageSize = 15;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  })
);

//admin get all product without search and pegination
productRoute.get(
  "/all",
  protect,
  admin,
  asynHandler(async (req, res) => {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json(products);
  })
);
 

//details products
productRoute.get(
  "/:id",
  asynHandler(async (req, res) => {
    const products = await Product.findById(req.params.id);
    if (products) {
      res.json(products);
    } else {
      res.status(400);
      throw new error("Product not found");
    }
  })
);

//delete product
productRoute.delete(
  "/:id",protect,admin,
  asynHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) { 
      res.json({message:"Product deleted"});
    } else {
      res.status(400);
      throw new error("Product not found");
    }
  })
);

//create product
productRoute.post(
  "/",protect,admin,
  asynHandler(async (req, res) => {
    const {name,image, description,price,countInStock}= req.body
    const productExist = await Product.findOne({name}) 
    if (productExist) { 
      res.status(400);
      throw new error("Product name already exist"); 
    } else {

      const product = await Product({
        name,
        image,
         description,
         price,
         countInStock,
        user:req.user._id
      })
      if(product){
        const createproduct = await product.save()
        res.status(201).json(createproduct);
      }
      else{
        res.status(400)
        throw new error("Product name already exist"); 

      }
      
    }
  })
);

//update product
productRoute.put(
  "/:id",protect,
  asynHandler(async (req, res) => {
    const {name,image, description,price,countInStock}= req.body
    const product = await Product.findById(req.params.id) 
    if (product) { 
      product.name = name || product.name,
      product.image=image || product.image ,
      product.description=description || product.description,
      product.price=price ||  product.price,
      product.countInStock=countInStock || product.countInStock

      const editproduct = await product.save()
      res.json(editproduct);
    } else {
        res.status(404)
        throw new error("invalid product data"); 
    }
  })
);


export default productRoute;
