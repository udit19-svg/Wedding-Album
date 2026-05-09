 import HTMLFlipBook from "react-pageflip";
import { useEffect, useState, useRef, useCallback } from "react";
import flipSound from "./assets/page-flip.mp3";
import './Album.css'

function Album() {
  const flipAudio = useRef(new Audio(flipSound));
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Pinch zoom state for each image
  const [zoomStates, setZoomStates] = useState({});

  useEffect(() => {
    const id = window.location.pathname.split("/")[2];
    fetch(`https://wedding-album-s31c.onrender.com/album/${id}`)
      .then(res => res.json())
      .then(data => {
        setImages(data.images);
        // Initialize zoom states
        const initialZoom = {};
        data.images.forEach((_, idx) => {
          initialZoom[idx] = { scale: 1, translateX: 0, translateY: 0 };
        });
        setZoomStates(initialZoom);
      });
    flipAudio.current.volume = 1;
  }, []);

  const handleFlip = (e) => {
    setCurrentPage(e.data);
    flipAudio.current.currentTime = 0;
    flipAudio.current.play();

    // Reset zoom on page flip
    setZoomStates(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = { scale: 1, translateX: 0, translateY: 0 };
      });
      return newState;
    });
  };

  // ===== PINCH ZOOM LOGIC - CENTER ZOOM =====
  const handleTouchStart = useCallback((e, index) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      e.currentTarget.dataset.initialDistance = distance;
      e.currentTarget.dataset.initialScale = zoomStates[index]?.scale || 1;
    }
  }, [zoomStates]);

  const handleTouchMove = useCallback((e, index) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const initialDistance = parseFloat(e.currentTarget.dataset.initialDistance) || currentDistance;
      const initialScale = parseFloat(e.currentTarget.dataset.initialScale) || 1;

      const scaleChange = currentDistance / initialDistance;
      let newScale = initialScale * scaleChange;

      // Limit zoom levels
      newScale = Math.min(Math.max(newScale, 1), 4);

      setZoomStates(prev => ({
        ...prev,
        [index]: {
          scale: newScale,
          translateX: 0,  // Center zoom - no pan
          translateY: 0   // Center zoom - no pan
        }
      }));
    }
  }, []);

  const handleTouchEnd = useCallback((e, index) => {
    const currentScale = zoomStates[index]?.scale || 1;
    if (currentScale < 1.1) {
      setZoomStates(prev => ({
        ...prev,
        [index]: { scale: 1, translateX: 0, translateY: 0 }
      }));
    }
  }, [zoomStates]);

  // Double tap to zoom - CENTER
  const lastTapRef = useRef({});
  const handleDoubleTap = useCallback((e, index) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[index] || 0;

    if (now - lastTap < 300) {
      e.preventDefault();
      const currentScale = zoomStates[index]?.scale || 1;
      const newScale = currentScale > 1.5 ? 1 : 2.5;

      setZoomStates(prev => ({
        ...prev,
        [index]: {
          scale: newScale,
          translateX: 0,  // Center zoom
          translateY: 0   // Center zoom
        }
      }));
    }

    lastTapRef.current[index] = now;
  }, [zoomStates]);

  return (
    <div className="album-container">
      <h2 className="album-title">Wedding Album 💍</h2>

      <audio controls autoPlay loop className="audio-player">
        <source src="/gehra.mp3" type="audio/mpeg" />
      </audio>

      {/* ===== SINGLE PAGE FLIPBOOK ===== */}
      <HTMLFlipBook
        className="flipbook"
        width={350}
        height={500}
        size="stretch"
        minWidth={300}
        maxWidth={500}
        minHeight={400}
        maxHeight={600}
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
        usePortrait={true}
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

            {/* Single image with pinch zoom - FULL COVER */}
            <div 
              className="image-wrapper"
              onTouchStart={(e) => handleTouchStart(e, i)}
              onTouchMove={(e) => handleTouchMove(e, i)}
              onTouchEnd={(e) => handleTouchEnd(e, i)}
              onClick={(e) => handleDoubleTap(e, i)}
            >
              <img 
                src={img} 
                alt={`Wedding moment ${i + 1}`} 
                className="pinch-zoom-img"
                style={{
                  transform: `scale(${zoomStates[i]?.scale || 1})`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
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
    </div>
  );
}

export default Album;