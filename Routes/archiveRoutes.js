import express from "express";
import multer from "multer";
import cloudinary from "../cloudinary_temp.js"
import Archive from "../models/Archive.js"

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const archives = await Archive.find().sort({ createdAt: -1 });
    res.json(archives); // ✅ renvoie un tableau directement
  } catch (error) {
    console.error('Erreur lors de la récupération des archives :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Multer config : stockage temporaire
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ajouter un fichier PDF
router.post("/add", upload.single("file"), async (req, res) => {
  try {
    const { title, category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const now = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "archives_pdf" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(file.buffer);
      });
    };

    const result = await streamUpload();

    const newArchive = new Archive({
      title,
      category,
      pdfUrl: result.secure_url,
      date: now,
    });

    await newArchive.save();
    res.status(201).json({ message: "Archive enregistrée", archive: newArchive });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});



export default router;
