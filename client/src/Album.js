 import HTMLFlipBook from "react-pageflip";
import { useEffect, useState, useRef } from "react";
import flipSound from "./assets/page-flip.mp3";
import './Album.css'

function Album() {
  const flipAudio = useRef(new Audio(flipSound));
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // ===== ZOOM STATES =====
  const [zoomImage, setZoomImage] = useState(null);
  const [zoomCaption, setZoomCaption] = useState("");

  useEffect(() => {
    const id = window.location.pathname.split("/")[2];
    fetch(`https://wedding-album-s31c.onrender.com/album/${id}`)
      .then(res => res.json())
      .then(data => setImages(data.images));
    flipAudio.current.volume = 1;
  }, []);

  // ===== ESCAPE KEY TO CLOSE ZOOM =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFlip = (e) => {
    setCurrentPage(e.data);
    flipAudio.current.currentTime = 0;
    flipAudio.current.play();
  };

  // ===== ZOOM FUNCTIONS - SIRF BAHAR SE ZOOM =====
  const openZoom = (img, index) => {
    setZoomImage(img);
    setZoomCaption(`Wedding Moment ${index + 1}`);
    document.body.style.overflow = 'hidden';
  };

  const closeZoom = () => {
    setZoomImage(null);
    setZoomCaption("");
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="album-container">
      <h2 className="album-title">Wedding Album 💍</h2>

      <audio controls autoPlay loop className="audio-player">
        <source src="/gehra.mp3" type="audio/mpeg" />
      </audio>

      {/* ===== LANDSCAPE FLIPBOOK ===== */}
      <HTMLFlipBook
        className="flipbook"
        width={400}
        height={300}
        size="stretch"
        minWidth={350}
        maxWidth={600}
        minHeight={250}
        maxHeight={450}
        onFlip={handleFlip}
        showCover={true}
        maxShadowOpacity={0.5}          
        mobileScrollSupport={true}
        useMouseEvents={true}
        startPage={0}
        drawShadow={true}
        flippingTime={800}
        startZIndex={0}
        autoSize={true}
        clickEventForward={false}
        usePortrait={false}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
      >
        {images.map((img, i) => (
          <div key={i} className="page">
            {/* Corner accents */}
            <div className="page-corner-accent top-left"></div>
            <div className="page-corner-accent top-right"></div>
            <div className="page-corner-accent bottom-left"></div>
            <div className="page-corner-accent bottom-right"></div>

            <img src={img} alt={`Wedding moment ${i + 1}`} />

            {/* Zoom icon - bahar se zoom ke liye */}
            <div 
              className="zoom-icon" 
              onClick={(e) => {
                e.stopPropagation();  // Page flip ko rokne ke liye
                openZoom(img, i);
              }}
              title="Click to Zoom"
            >
              🔍
            </div>

            {/* Page number */}
            <span className="page-number">{i + 1}</span>
          </div>
        ))}
      </HTMLFlipBook>

      {/* Page indicator */}
      <div className="page-indicator">
        Page {currentPage + 1} of {images.length}
      </div>

      {/* ===== ZOOM OVERLAY ===== */}
      {zoomImage && (
        <div className="zoom-overlay active" onClick={closeZoom}>
          <button className="zoom-close" onClick={closeZoom}>✕</button>
          <img src={zoomImage} alt="Zoomed view" onClick={(e) => e.stopPropagation()} />
          <div className="zoom-caption">{zoomCaption}</div>
        </div>
      )}
    </div>
  );
}

export default Album;