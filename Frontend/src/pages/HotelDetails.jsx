import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, ArrowLeft, Send, Wifi, Coffee, Utensils, Mountain, ShieldCheck, Star, Info, ExternalLink, Globe, Layout } from "lucide-react";
import { supabase } from "../lib/supabase";

// Google Maps API Loader Helper
const loadGoogleMapsAPI = (callback) => {
  const existingScript = document.getElementById("googleMaps");
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Google Maps API Key missing");
    return;
  }

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initHotelMapCallback`;
    script.id = "googleMaps";
    script.async = true;
    script.defer = true;
    
    window.initHotelMapCallback = () => {
      if (callback) callback();
    };

    document.body.appendChild(script);
  } else if (callback) {
    if (window.google) callback();
    else {
      const prevCallback = window.initHotelMapCallback;
      window.initHotelMapCallback = () => {
        if (prevCallback) prevCallback();
        callback();
      };
    }
  }
};

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    bookingDate: "",
  });
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const { data, error } = await supabase
          .from("hotels")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        setHotel(data);
      } catch (error) {
        console.error("Error fetching hotel:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();

    loadGoogleMapsAPI(() => {
      setMapsLoaded(true);
    });
  }, [id]);

  useEffect(() => {
    if (mapsLoaded && hotel && mapRef.current && hotel.latitude && hotel.longitude) {
      const pos = { lat: parseFloat(hotel.latitude), lng: parseFloat(hotel.longitude) };
      const map = new window.google.maps.Map(mapRef.current, {
        center: pos,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
      });
      new window.google.maps.Marker({
        position: pos,
        map: map,
        title: hotel.name,
      });
    }
  }, [mapsLoaded, hotel]);

  const images = hotel?.image_url ? hotel.image_url.split(",").map(url => url.trim()) : [];

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("bookings").insert([{
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        booking_date: bookingData.bookingDate,
        type: "hotel",
        target_id: id,
      }]);
      
      if (error) throw error;
      
      setBookingStatus("success");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus("error");
    }
  };

  const getAmenityIcon = (name) => {
    if (name.toLowerCase().includes("wifi")) return <Wifi className="h-5 w-5" />;
    if (name.toLowerCase().includes("breakfast")) return <Coffee className="h-5 w-5" />;
    if (name.toLowerCase().includes("restaurant") || name.toLowerCase().includes("dining")) return <Utensils className="h-5 w-5" />;
    if (name.toLowerCase().includes("view")) return <Mountain className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Property...</p>
      </div>
    </div>
  );

  if (!hotel) return <div className="text-center py-20">Hotel not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header / Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors text-sm"
          >
            <ArrowLeft className="h-5 w-5" /> <span className="hidden sm:inline">Back to Search</span>
          </button>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
              hotel.category === 'Premium' ? 'bg-amber-500 text-white' : 
              hotel.category === 'Standard' ? 'bg-blue-600 text-white' : 
              'bg-gray-600 text-white'
            }`}>
              {hotel.category || 'Standard'} Category
            </span>
          </div>
        </div>
      </div>

      {/* NEW HERO GALLERY SECTION */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[600px]">
            {/* Active Image (Large) */}
            <div className="flex-[3] aspect-video md:aspect-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative group">
              <img 
                src={images[activeImage] || hotel.image_url} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt={hotel.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-8">
                 <p className="text-white font-black text-lg md:text-2xl uppercase tracking-tighter">{hotel.name} - View {activeImage + 1}</p>
              </div>
            </div>

            {/* Other Images (Narrower but same height) */}
            {images.length > 1 && (
              <div className="flex-1 flex md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-auto md:flex-1 md:h-auto rounded-xl overflow-hidden transition-all duration-500 ${
                      activeImage === idx ? 'ring-4 ring-blue-600 opacity-100 scale-[0.98]' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                    {activeImage === idx && (
                      <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                        <div className="bg-white/90 p-1.5 rounded-full"><CheckCircle className="text-blue-600 h-3 w-3 sm:h-4 sm:w-4" /></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* LEFT COLUMN: Hotel Details */}
        <div className="lg:col-span-7 space-y-8 md:space-y-10">
          <header>
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-2 md:mb-3 text-xs md:sm uppercase tracking-widest">
              <MapPin className="h-4 w-4" /> {hotel.location}
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-gray-900 leading-tight mb-4 md:mb-6">
              {hotel.name}
            </h1>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-current" />)}
              </div>
              <div className="h-4 w-[1px] bg-gray-300"></div>
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">Official Property</span>
            </div>
          </header>

          <section className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 opacity-50"></div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
              <Info className="text-blue-600 h-5 w-5 md:h-6 md:w-6" /> Description
            </h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-xl whitespace-pre-line font-medium">
              {hotel.description}
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
              <Layout className="text-blue-600 h-5 w-5 md:h-6 md:w-6" /> Amenities & Comforts
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
              {hotel.amenities && hotel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-xl md:rounded-3xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group">
                  <div className="text-blue-600 bg-blue-50 p-2 md:p-3 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="font-bold text-gray-800 text-[10px] sm:text-xs md:text-sm uppercase tracking-tight">{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Mobile Only: CTA */}
          <div className="lg:hidden bg-blue-900 rounded-2xl md:rounded-[40px] p-6 md:p-10 text-white text-center">
             <p className="text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 md:mb-2">Starting from</p>
             <div className="text-3xl md:text-5xl font-black mb-6 md:mb-8">PKR {hotel.price_per_night?.toLocaleString()}</div>
             <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="w-full bg-white text-blue-900 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl shadow-xl">Reserve Now</button>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Media */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          
          {/* Main Visual Gallery (Desktop thumbnails hide, we used hero gallery above) */}
          <div className="hidden lg:block bg-white p-4 rounded-[48px] shadow-2xl border border-gray-100">
            <div className="relative aspect-square rounded-[36px] overflow-hidden mb-4 group">
              <img 
                src={images[activeImage] || hotel.image_url} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt={hotel.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-2">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-3xl overflow-hidden transition-all duration-500 ${
                      activeImage === idx ? 'ring-4 ring-blue-600 scale-90' : 'opacity-40 hover:opacity-100 hover:scale-95'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Google Map Preview */}
          <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-[48px] shadow-xl border border-gray-100 overflow-hidden group">
            <div className="bg-gray-100 rounded-xl md:rounded-[36px] overflow-hidden h-64 md:h-80 relative">
              {hotel.latitude && hotel.longitude ? (
                <div ref={mapRef} className="w-full h-full grayscale hover:grayscale-0 transition-all duration-1000" />
              ) : hotel.map_link ? (
                <iframe
                  src={hotel.map_link}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hotel Location"
                  className="grayscale hover:grayscale-0 transition-all duration-1000"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3 md:gap-4">
                  <Globe size={40} className="animate-pulse" />
                  <span className="font-black text-[10px] md:text-xs uppercase tracking-widest">Map Preview Unavailable</span>
                </div>
              )}
              
              {hotel.location_link && (
                <a 
                  href={hotel.location_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white py-3 md:py-4 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center gap-2 md:gap-3 hover:bg-blue-600 hover:text-white transition-all transform translate-y-1 md:translate-y-2 group-hover:translate-y-0"
                >
                  <MapPin size={16} className="text-blue-600 group-hover:text-white transition-colors" />
                  <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">Open in Google Maps</span>
                  <ExternalLink size={12} className="opacity-50" />
                </a>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="bg-blue-900 rounded-2xl md:rounded-[48px] shadow-2xl p-6 md:p-10 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-full blur-xl md:blur-2xl"></div>
            
            <div className="mb-6 md:mb-8">
              <p className="text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2 md:mb-3">Booking Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-5xl font-black">PKR {hotel.price_per_night?.toLocaleString()}</span>
                <span className="text-blue-300 font-bold text-xs md:sm">/ night</span>
              </div>
            </div>

            {bookingStatus === "success" ? (
              <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl md:rounded-3xl text-center space-y-3 md:space-y-4 animate-in fade-in zoom-in-95">
                <ShieldCheck className="h-12 w-12 md:h-16 md:w-16 mx-auto text-green-400" />
                <h3 className="text-xl md:text-2xl font-black">Request Sent!</h3>
                <p className="text-blue-100 font-medium text-xs md:text-sm leading-relaxed">Our concierge team will call you within 30 minutes to finalize your stay.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4 md:space-y-5">
                <div className="space-y-3 md:space-y-4">
                  <input 
                    required
                    type="text" 
                    placeholder="Guest Full Name"
                    className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/10 border border-white/10 focus:bg-white focus:text-gray-900 placeholder:text-blue-200 outline-none transition-all font-bold text-sm md:text-base"
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                  />
                  <input 
                    required
                    type="email" 
                    placeholder="Email Address"
                    className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/10 border border-white/10 focus:bg-white focus:text-gray-900 placeholder:text-blue-200 outline-none transition-all font-bold text-sm md:text-base"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                  />
                  <input 
                    required
                    type="date" 
                    className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/10 border border-white/10 focus:bg-white focus:text-gray-900 text-blue-200 outline-none transition-all font-bold text-sm md:text-base"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-white text-blue-900 py-4 md:py-6 rounded-xl md:rounded-3xl font-black text-lg md:text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 md:gap-4 group"
                >
                  Reserve Now <Send className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform" />
                </button>
                <p className="text-center text-[10px] text-blue-300 font-bold uppercase tracking-[0.3em] mt-4 md:mt-6">Secure Concierge Booking</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
