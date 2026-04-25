 import { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { QRCodeCanvas } from "qrcode.react";
import './Upload.css' 

function Upload() {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [title, setTitle] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [progress, setProgress] = useState(0);

  // 🔥 Upload with Compression + Sequential
  const uploadImages = async () => {
    try {
      let uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 🔥 Compress image (High Quality 5MB)
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          initialQuality: 1,
          useWebWorker: true
        });

        console.log(
          `Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`
        );
        console.log(
          `Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
        );

        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("upload_preset", "wedding_album");

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dvoygipns/image/upload",
          formData
        );

        uploadedUrls.push(res.data.secure_url);

        // 🔥 Stable progress (overall)
        const percent = Math.round(((i + 1) / files.length) * 100);
        setProgress(percent);
      }

      setUrls(uploadedUrls);
      alert("All images uploaded 🚀");

    } catch (err) {
      console.log("Upload Error:", err);
      alert("Upload failed ❌");
    }
  };

  // 🔹 Create Album
  const createAlbum = async () => {
    try {
      const res = await axios.post(
 "https://wedding-album-s31c.onrender.com/api/create-album",
  {
    title,
    images: urls
  }
);

      setAlbumId(res.data.album._id);
      alert("Album ban gaya 🎉");
  
    } catch (err) {
      console.log("Album Error:", err);
    }
  };

  return (
    <div   className="wedding-album-container">
      <h2 className="wedding-title">Create Wedding Album 💍</h2>

      <input
       className="wedding-input"
        type="text"
        placeholder="Album Title"
        onChange={(e) => setTitle(e.target.value)}
      />

       <div className="wedding-divider"></div>

      <input
       className="wedding-file-input"
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />

      <br /><br />

      <button className="wedding-btn wedding-btn-upload" onClick={uploadImages}>
        Upload Images
      </button>

      <br /><br />

      {/* 🔥 Progress Bar */}
      {progress > 0 && (
        <div className="wedding-progress-container">
          <h3 className="wedding-progress-label">Uploading: {progress}%</h3>
          <div className="wedding-progress-track">
            <div
            className="wedding-progress-fill"
              style={{
                width: `${progress}%`}}>
                 <span className="wedding-progress-text">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="wedding-divider"></div>

      <button
      className="wedding-btn wedding-btn-create"
        onClick={createAlbum}
        disabled={urls.length === 0}
      >
        Create Album
      </button>

      <br /><br />

      {/* 🔥 QR Code */}
      {albumId && (
        <div className="wedding-qr-section wedding-success">
          <h3 className="wedding-qr-title">Scan QR to view album 📱</h3>
        <div className="wedding-qr-wrapper">
          <QRCodeCanvas value={`https://wedding-album.singerudit19.workers.dev/album/${albumId}`}
           size={200}
            level="H"
            includeMargin={true} />  </div>
            <p style={{color: '#a0808a', marginTop: '15px', fontSize: '0.9rem'}}>
          Share this QR code with your guests!
        </p>
        </div>
      )}
    </div>
  );
}

export default Upload;