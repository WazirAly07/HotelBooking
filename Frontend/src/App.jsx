import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-white flex flex-col font-sans">
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
    </div>
  );
}

export default App;
