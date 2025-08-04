import express from "express";
import asynHandler from "express-async-handler"; 
import { admin, protect } from "../middleware/AuthMiddleware.js";
import Depense from "../models/depenseModel.js";

const depenseRoute = express.Router();
//products
depenseRoute.get(
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

    const count = await Depense.countDocuments({ ...keyword });
    const depenses = await Depense.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json({ depenses, page, pages: Math.ceil(count / pageSize) });
  })
);

//details products
depenseRoute.get(
  "/:id",
  asynHandler(async (req, res) => {
    const depennses = await Depense.findById(req.params.id);
    if (depennses) {
      res.json(depennses);
    } else {
      res.status(400);
      throw new error("depennses not found");
    }
  })
);

//delete depense
depenseRoute.delete(
  "/:id",protect,admin,
  asynHandler(async (req, res) => {
    const depense = await Depense.findByIdAndDelete(req.params.id);
    if (depense) { 
      res.json({message:"depense deleted"});
    } else {
      res.status(400);
      throw new error("depense not found");
    }
  })
);

//create depense
depenseRoute.post(
  "/",protect,admin,
  asynHandler(async (req, res) => {
    const {name,montant,description,date}= req.body
    const DepenseExist = await Depense.findOne({name,description}) 
    if (DepenseExist) { 
      res.status(400);
      throw new error("depense  name already exist"); 
    } else {

      const depense = await Depense({
        name,
        montant,
        description,
        date,
        user:req.user._id
      })
      if(depense){
        const createdepense = await depense.save()
        res.status(201).json(createdepense);
      }
      else{
        res.status(400)
        throw new error(" name already exist"); 

      }
      
    }
  })
);


//update product
depenseRoute.put(
  "/:id",protect,
  asynHandler(async (req, res) => {
    const { name,montant,description}= req.body
    const depense = await Depense.findById(req.params.id) 
    if (depense) { 
      depense.montant = montant || depense.name, 
      depense.description=description || depense.description
      depense.name = depense.name || depense.name

      const editdepense = await depense.save()
      res.json(editdepense);
    } else {
        res.status(404)
        throw new error("invalid depense data"); 
    }
  })
);

export default depenseRoute;
