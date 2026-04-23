import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from "./Upload";
import Album from "./Album";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/album/:id" element={<Album />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;