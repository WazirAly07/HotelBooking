import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mountain, Map, Hotel, Phone, Camera, Info, Menu, X, LogOut, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import logo from "../assets/Images/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { name: "About Us", path: "/about", icon: <Info className="h-4 w-4" /> },
    { name: "Tours", path: "/#tours", icon: <Map className="h-4 w-4" /> },
    { name: "Hotels", path: "/#hotels", icon: <Hotel className="h-4 w-4" /> },
    { name: "Memories", path: "/memories", icon: <Camera className="h-4 w-4" /> },
    { name: "Contact", path: "/#contact", icon: <Phone className="h-4 w-4" /> },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="BTC Logo" className="h-10 w-auto object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                Baltistan Tourism Club
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
              >
                {link.icon} {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-100">
                <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm bg-gray-50 px-3 py-1.5 rounded-full">
                  <div className="bg-blue-100 p-1 rounded-full"><User className="h-3 w-3 text-blue-600" /></div>
                  <span className="max-w-[100px] truncate">{user.user_metadata?.full_name || user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition-colors p-2"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pt-2 pb-6 space-y-1 bg-white border-t border-gray-100 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600">
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
          <div className="pt-4 px-4 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-gray-700 truncate">{user.user_metadata?.full_name || user.email}</span>
                </div>
                <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold border border-red-100"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
