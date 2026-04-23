 const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.log(err));

// ✅ Schema + Model
const albumSchema = new mongoose.Schema({
  title: String,
  images: [String]
});

const Album = mongoose.model("Album", albumSchema);

// ✅ Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wedding-album",
    allowed_formats: ["jpg", "png", "jpeg"],
    resource_type: "image"
  }
});

// ✅ Multer (with limit)
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 5MB
});

// ✅ Upload API
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded ❌" });
    }

    res.status(200).json({
      message: "Upload success ✅",
      url: req.file.path
    });

  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    res.status(500).json({
      message: "Server error ❌",
      error: error.message
    });
  }
});

// ✅ Create Album API
app.post("/create-album", async (req, res) => {
  try {
    const { title, images } = req.body;

    console.log("DATA RECEIVED:", req.body);

    if (!title || !images || images.length === 0) {
      return res.status(400).json({ message: "Missing data ❌" });
    }

    const album = await Album.create({ title, images });

    res.json({
      message: "Album created ✅",
      album
    });

  } catch (error) {
    console.log("ALBUM ERROR:", error);
    res.status(500).json({ message: "Error creating album" });
  }
});

// ✅ Get Album
app.get("/album/:id", async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    res.json(album);
  } catch (err) {
    res.status(500).json({ message: "Error fetching album" });
  }
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});