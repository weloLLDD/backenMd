import mongoose from "mongoose"; 

const reviewSchema = mongoose.Schema({
    name:{
        type: String,
        required:[true, "please add a name"]
    },
    image :{
        type:String,
        required:true
      
    },

    comment : {
        type:String,
        required:true
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User",
    }

})




const productSchema = mongoose.Schema({

    name:{
        type: String,
        required:[true, "please add a name"]
    },
    image :{
        type:String,
        required:true
      
    }
    ,
    description :{
        type: String,
        required:[true, "please add a password"]
       // maxLength:[23,"Password must not 6 more than 23 characters "],
    },
    price : {
        
        type: Number,  
        require:true,
        default:0
     
    }
    ,
    countInStock : {
        
        type: Number, 
        require:true,
        default:0
     
    }
    ,
    rating : {
        
        type: Number, 
        require:true,
        default:0
     
    }
    ,
    numReviews: {
        
        type: Number, 
        require:true,
        default:0
     
    }
    ,
    idclient: {
        
        type: String, 
        require:true
     
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:false,
        ref:"User",
    }
}, {
    timestamps: true,
})

const Product = mongoose.model("Product",productSchema)

export default Product
