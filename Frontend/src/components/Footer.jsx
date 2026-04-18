import { Mail, Phone, MapPin } from "lucide-react";
import logo from "../assets/Images/logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://facebook.com/baltistantourismclub",
      icon: (
        <svg size={18} fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      )
    },
    {
      name: "Instagram",
      url: "https://instagram.com/baltistantourismclub",
      icon: (
        <svg size={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@baltistantourismclub",
      icon: (
        <svg size={18} fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.08-.26-.17-.38-.26v5.48c.01 3.82-2.06 7.46-5.73 8.35-3.93 1.07-8.14-1.21-9.47-5.01-1.36-3.76.56-8.14 4.33-9.46 1.11-.41 2.3-.44 3.48-.31v3.97c-.81-.15-1.64-.15-2.42.14-1.49.45-2.32 2.1-1.96 3.59.31 1.48 1.82 2.39 3.31 2.12 1.49-.19 2.52-1.49 2.52-2.99V.02z" />
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10 mt-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 border-b border-gray-800 pb-16 mb-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="BTC Logo" className="h-12 w-auto rounded-3xl object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-white tracking-tighter italic uppercase">
                  Baltistan <span className="text-blue-500">Tourism</span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase ml-0.5">Club</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              The pioneers of tourism in Baltistan. We provide premium travel experiences, cozy stays, and local expertise to help you explore the majestic Karakoram.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2.5 rounded-xl hover:bg-blue-600 transition-all text-gray-400 hover:text-white" 
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-blue-500">Follow Us</h3>
            <ul className="space-y-4 text-gray-400 text-sm font-bold">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-500">{social.icon}</span> {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-blue-500">Popular Regions</h3>
            <ul className="space-y-4 text-gray-400 text-sm font-bold">
              <li className="hover:text-white transition-colors cursor-pointer">Skardu Valley</li>
              <li className="hover:text-white transition-colors cursor-pointer">Shigar & Khaplu</li>
              <li className="hover:text-white transition-colors cursor-pointer">Hunza & Nagar</li>
              <li className="hover:text-white transition-colors cursor-pointer">Deosai Plains</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-blue-500">Get in Touch</h3>
            <ul className="space-y-5 text-gray-400 text-sm font-bold">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>Skardu, Gilgit-Baltistan, <br />Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>+92 346 6444471</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>info@baltistantourismclub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-600 gap-6">
          <p>© 2026 Baltistan Tourism Club. Developed with Passion.</p>
          <p className="hover:text-white" >Developed by khass and co ltd</p>
          <div className="flex gap-8">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-white transition-colors cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
