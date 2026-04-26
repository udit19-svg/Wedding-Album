import HTMLFlipBook from "react-pageflip";
import { useEffect, useState, useRef } from "react";
import flipSound from "./assets/page-flip.mp3";
import './Album.css'

function Album() {
  const flipAudio = useRef(new Audio(flipSound));
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

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

  return (
    <div className="album-container">
      <h2 className="album-title">Wedding Album 💍</h2>
      
      <audio controls autoPlay loop className="audio-player">
        <source src="/gehra.mp3" type="audio/mpeg" />
      </audio>

      <HTMLFlipBook
        className="flipbook"
         width={1100}
        height={400}
        onFlip={handleFlip}
        showCover={true}
        maxShadowOpacity={0.5}
      >
        {images.map((img, i) => (
          <div key={i} className="page">
            {/* Corner accents */}
            <div className="page-corner-accent top-left"></div>
            <div className="page-corner-accent top-right"></div>
            <div className="page-corner-accent bottom-left"></div>
            <div className="page-corner-accent bottom-right"></div>
            
            <img src={img} alt={`Wedding moment ${i + 1}`} />
            
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