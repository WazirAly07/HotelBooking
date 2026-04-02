import { Mountain, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-800 pb-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">GB Tours & Stays</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for exploring the roof of the world. Experience Gilgit Baltistan with local experts who know the mountains best.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Popular Destinations</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Hunza Valley</li>
              <li>Skardu & Shigar</li>
              <li>Gilgit City</li>
              <li>Ghizer District</li>
              <li>Diamer & Nanga Parbat</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Our Services</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Customized Tour Packages</li>
              <li>Hotel Reservations</li>
              <li>Jeep & Transport Rentals</li>
              <li>Trekking & Camping</li>
              <li>Visa Assistance</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" /> Gilgit-Skardu Rd, Gilgit
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" /> +92 345 6789123
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" /> info@gbtours.com
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs gap-4">
          <p>© 2026 Baltistan Tourism Club. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
