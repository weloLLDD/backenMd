import mongoose from "mongoose"; 


const depenseSchema = mongoose.Schema(
  {
     name:{
        type: String,
        required:[true, "please add a name"]
    },
   
    montant: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
  }
);

const Depense = mongoose.model("Depense", depenseSchema);

export default Depense;
