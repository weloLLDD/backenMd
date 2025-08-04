// models/Archive.js
import mongoose from "mongoose";

const archiveSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  pdfUrl: { type: String, required: true },
  date: { type: String },
  userId: { type: String }, // optionnel si gestion utilisateur
});

const Archive = mongoose.model("Archive", archiveSchema);

export default Archive;
