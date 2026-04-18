import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { supabase } from "./lib/supabase";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Memories from "./pages/Memories";
import TourDetails from "./pages/TourDetails";
import HotelDetails from "./pages/HotelDetails";
import AboutUs from "./pages/AboutUs";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Helper component to handle scrolling to hash on page load/change
function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
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
  const location = useLocation();
  const navigate = useNavigate();
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If the user clicked a 'Reset Password' link, Supabase triggers the 'PASSWORD_RECOVERY' event
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
        navigate("/reset-password");
      }
      
      // If they signed out (which happens after successful reset), exit recovery mode
      if (event === "SIGNED_OUT") {
        setIsRecoveryMode(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // If in recovery mode, block everything except the reset password page
  if (isRecoveryMode && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      <ScrollToHash />
      {!isAdminPage && !isRecoveryMode && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/tour/:id" element={<TourDetails />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminPage && !isRecoveryMode && <Footer />}

      {/* Floating Action Buttons */}
      {!isAdminPage && (
        <>
          {/* Call Button - Bottom Left */}
          <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 group">
            <div className="absolute bottom-full left-0 mb-4 bg-white px-4 py-2 rounded-xl shadow-2xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap">
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Call Us Now</p>
              <p className="text-sm font-bold text-gray-900">+92 346 6444471</p>
            </div>
            <a 
              href="tel:+923466444471" 
              className="bg-blue-600 text-white p-3 md:p-4 rounded-2xl shadow-2xl hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center border-4 border-white"
            >
              <Phone size={24} fill="currentColor" className="text-white" />
            </a>
          </div>

          {/* WhatsApp Button - Bottom Right */}
          <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group">
             <div className="absolute bottom-full right-0 mb-4 bg-white px-4 py-2 rounded-xl shadow-2xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap text-right">
              <p className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-1">Chat on WhatsApp</p>
              <p className="text-sm font-bold text-gray-900">Online Support</p>
            </div>
            <a 
              href="https://wa.me/923466444471" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-3 md:p-4 rounded-2xl shadow-2xl hover:bg-green-600 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center border-4 border-white"
            >
              <MessageCircle size={24} fill="currentColor" className="text-white" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
