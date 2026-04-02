import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import TourDetails from "./pages/TourDetails";
import HotelDetails from "./pages/HotelDetails";
import AboutUs from "./pages/AboutUs";

// Helper component to handle scrolling to hash on page load/change
function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        // Delay slightly to allow content to render if needed
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <ScrollToHash />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/tour/:id" element={<TourDetails />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
