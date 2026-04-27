 import HTMLFlipBook from "react-pageflip";
import { useEffect, useState, useRef, useCallback } from "react";
import flipSound from "./assets/page-flip.mp3";
import './Album.css'

function Album() {
  const flipAudio = useRef(new Audio(flipSound));
  const flipBookRef = useRef(null);
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 550, height: 733 });
  const [isMobile, setIsMobile] = useState(false);

  // ==========================================
  // RESPONSIVE DIMENSIONS CALCULATION
  // 12x36 inches album = portrait book
  // Each page = 12x18 inches (half of spread)
  // Aspect ratio: width/height = 12/18 = 0.667 (2:3 portrait)
  // ==========================================
  const calculateDimensions = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const mobile = screenWidth <= 768;
    setIsMobile(mobile);

    let pageWidth, pageHeight;

    // 12x36 album: each page is 12x18 inches
    // Aspect ratio: pageWidth / pageHeight = 12/18 = 0.667
    const aspectRatio = 12 / 18; // 0.667

    if (screenWidth <= 360) {
      // Small phones - single page view (portrait mode)
      pageWidth = screenWidth * 0.92;
      pageHeight = pageWidth / aspectRatio; // maintain 12:18 ratio
    } else if (screenWidth <= 480) {
      // Large phones - single page view
      pageWidth = screenWidth * 0.90;
      pageHeight = pageWidth / aspectRatio;
    } else if (screenWidth <= 768) {
      // Tablets - single page view
      pageWidth = screenWidth * 0.88;
      pageHeight = pageWidth / aspectRatio;
    } else if (screenWidth <= 1024) {
      // Tablets landscape / small laptops - show spread
      // Total spread width = pageWidth * 2, should fit in screen
      pageWidth = (screenWidth * 0.85) / 2;
      pageHeight = pageWidth / aspectRatio;
    } else {
      // Desktop - show full spread
      // 12x36 album: each page 12x18
      // Max page width 550px, height 733px (maintains 12:18 ratio)
      pageWidth = Math.min((screenWidth * 0.75) / 2, 550);
      pageHeight = pageWidth / aspectRatio;
    }

    // Ensure minimum sizes
    pageWidth = Math.max(Math.round(pageWidth), 280);
    pageHeight = Math.max(Math.round(pageHeight), 420);

    setDimensions({ width: pageWidth, height: pageHeight });
  }, []);

  // Handle resize
  useEffect(() => {
    calculateDimensions();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateDimensions, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', calculateDimensions);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', calculateDimensions);
      clearTimeout(resizeTimer);
    };
  }, [calculateDimensions]);

  // Fetch images
  useEffect(() => {
    const id = window.location.pathname.split("/")[2];
    fetch(`https://wedding-album-s31c.onrender.com/album/${id}`)
      .then(res => res.json())
      .then(data => setImages(data.images));
    flipAudio.current.volume = 1;
  }, []);

  const handleFlip = (e) => {
    setCurrentPage(e.data);
    flipAudio.current.currentTime = 0;
    flipAudio.current.play();
  };

  // Navigation handlers
  const nextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  return (
    <div className="album-container">
      <h2 className="album-title">Wedding Album 💍</h2>

      <audio controls autoPlay loop className="audio-player">
        <source src="/gehra.mp3" type="audio/mpeg" />
      </audio>

      <HTMLFlipBook
        ref={flipBookRef}
        className="flipbook"
        width={dimensions.width}
        height={dimensions.height}
        size="stretch"
        minWidth={280}
        maxWidth={1000}
        minHeight={420}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        swipeDistance={30}
        usePortrait={isMobile} // KEY: Single page on mobile, spread on desktop
        flippingTime={1000}
        startPage={0}
        drawShadow={true}
        onFlip={handleFlip}
      >
        {/* Front Cover */}
        <div className="page page-cover" data-density="hard">
          <div className="cover-content">
            <h1>Our Wedding</h1>
            <p className="cover-icon">💍</p>
          </div>
          <div className="page-corner-accent top-left"></div>
          <div className="page-corner-accent top-right"></div>
          <div className="page-corner-accent bottom-left"></div>
          <div className="page-corner-accent bottom-right"></div>
        </div>

        {/* Photo Pages */}
        {images.map((img, i) => (
          <div key={i} className="page">
            <div className="page-corner-accent top-left"></div>
            <div className="page-corner-accent top-right"></div>
            <div className="page-corner-accent bottom-left"></div>
            <div className="page-corner-accent bottom-right"></div>

            <div className="photo-frame">
              <img src={img} alt={`Wedding moment ${i + 1}`} loading="lazy" />
            </div>

            <span className="page-number">{i + 1}</span>
          </div>
        ))}

        {/* Back Cover */}
        <div className="page page-cover" data-density="hard">
          <div className="cover-content">
            <h1>Forever & Always</h1>
            <p className="cover-icon">❤️</p>
          </div>
          <div className="page-corner-accent top-left"></div>
          <div className="page-corner-accent top-right"></div>
          <div className="page-corner-accent bottom-left"></div>
          <div className="page-corner-accent bottom-right"></div>
        </div>
      </HTMLFlipBook>

      {/* Navigation Buttons */}
      <div className="flipbook-nav">
        <button 
          onClick={prevPage} 
          disabled={currentPage <= 0}
          aria-label="Previous page"
        >
          ◀
        </button>
        <button 
          onClick={nextPage} 
          disabled={currentPage >= images.length + 1}
          aria-label="Next page"
        >
          ▶
        </button>
      </div>

      {/* Page indicator */}
      <div className="page-indicator">
        Page {currentPage + 1} of {images.length + 2}
      </div>
    </div>
  );
}

export default Album;