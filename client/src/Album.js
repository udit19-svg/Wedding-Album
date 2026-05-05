import HTMLFlipBook from "react-pageflip";
import { useEffect, useState, useRef, useCallback } from "react";
import flipSound from "./assets/page-flip.mp3";
import './Album.css'

function Album() {
  const flipAudio = useRef(new Audio(flipSound));
  const flipBookRef = useRef(null);
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 550, height: 733 });

  // Mobile detect + dimensions
  const checkMobile = useCallback(() => {
    const screenWidth = window.innerWidth;
    const mobile = screenWidth <= 768;
    setIsMobile(mobile);

    if (screenWidth <= 360) {
      setDimensions({ width: 320, height: 480 });
    } else if (screenWidth <= 480) {
      setDimensions({ width: 360, height: 520 });
    } else if (screenWidth <= 768) {
      setDimensions({ width: 400, height: 580 });
    } else if (screenWidth <= 1024) {
      setDimensions({ width: 500, height: 700 });
    } else {
      setDimensions({ width: 550, height: 733 });
    }
  }, []);

  useEffect(() => {
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [checkMobile]);

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

  // Navigation
  const nextPage = () => {
    if (flipBookRef.current) flipBookRef.current.pageFlip().flipNext();
  };
  const prevPage = () => {
    if (flipBookRef.current) flipBookRef.current.pageFlip().flipPrev();
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
        minWidth={300}
        maxWidth={1200}
        minHeight={400}
        maxHeight={1000}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        swipeDistance={30}
        usePortrait={isMobile}
        flippingTime={1000}
        startPage={0}
        drawShadow={true}
        onFlip={handleFlip}
      >
        {/* FRONT COVER */}
        <div className="page page-cover" data-density="hard">
          <div className="cover-content">
            <h1>Our Wedding</h1>
            <p className="cover-icon">💍</p>
          </div>
        </div>

        {/* PHOTO PAGES */}
        {images.map((img, i) => (
          <div key={i} className="page">
            <div className="photo-frame">
              <img 
                src={img} 
                alt={`Wedding moment ${i + 1}`} 
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/fallback-image.jpg'; // fallback
                }}
              />
            </div>
            <span className="page-number">{i + 1}</span>
          </div>
        ))}

        {/* BACK COVER */}
        <div className="page page-cover" data-density="hard">
          <div className="cover-content">
            <h1>Forever & Always</h1>
            <p className="cover-icon">❤️</p>
          </div>
        </div>
      </HTMLFlipBook>

      {/* NAVIGATION */}
      <div className="flipbook-nav">
        <button onClick={prevPage} disabled={currentPage <= 0}>◀</button>
        <button onClick={nextPage} disabled={currentPage >= images.length + 1}>▶</button>
      </div>

      <div className="page-indicator">
        Page {currentPage + 1} of {images.length + 2}
      </div>
    </div>
  );
}

export default Album;