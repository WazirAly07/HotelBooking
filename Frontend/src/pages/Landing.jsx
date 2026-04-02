import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Star, ArrowRight, ShieldCheck, Mountain, Plane, Search } from "lucide-react";

const Landing = () => {
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true); 
  const [searchQuery, setSearchQuery] = useState("");
  const [inquiryData, setInquiryData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [inquiryStatus, setInquiryStatus] = useState(null);
  const navigate = useNavigate();

  const fetchData = async (query = "") => {
    setLoading(true);
    try {
      const [toursRes, hotelsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/tours?search=${query}`),
        axios.get(`http://localhost:5000/api/hotels?search=${query}`)
      ]);
      setTours(toursRes.data);
      setHotels(hotelsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchQuery);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/inquiries", inquiryData);
      setInquiryStatus("success");
      setInquiryData({ name: "", email: "", message: "" });
      setTimeout(() => setInquiryStatus(null), 5000);
    } catch (error) {
      console.error("Inquiry failed:", error);
      setInquiryStatus("error");
    }
  };

  const memories = [
    { url: "https://images.unsplash.com/photo-1594144349187-54848035f56b?q=80&w=800", title: "K2 Base Camp Guest" },
    { url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800", title: "Deosai Family Trip" },
    { url: "https://images.unsplash.com/photo-1533587144136-a092c44423e5?q=80&w=800", title: "Khaplu Palace Tour" },
    { url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800", title: "Shangrila Memories" },
    { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800", title: "Skardu Group Adventure" },
    { url: "https://images.unsplash.com/photo-1589307305367-73d839353982?q=80&w=800", title: "Fairy Meadows Memories" }
  ];

  if (showPreloader) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover opacity-60">
          <source src="/src/assets/preload/preloader.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-snowy-mountain-peak-42845-large.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4 animate-pulse">
            <Mountain className="h-12 w-12 text-blue-500" />
            <span className="text-3xl font-black text-white tracking-widest uppercase">Baltistan Tourism Club</span>
          </div>
          <div className="w-48 h-1 bg-white/20 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-[loading_1.5s_ease-in-out]"></div>
          </div>
        </div>
        <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-blue-900 via-indigo-900 to-teal-900"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Explore <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Skardu</span> <br /> With Baltistan Tourism Club
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            The pioneers of tourism in Baltistan. From the cold deserts of Skardu to the architectural marvels of Khaplu.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 relative px-4">
            <input 
              type="text" 
              placeholder="Search destinations..." 
              className="w-full py-4 md:py-5 px-6 md:px-8 pr-32 rounded-full bg-white text-gray-900 md:text-lg shadow-2xl focus:ring-4 focus:ring-blue-500/50 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-6 md:right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-8 rounded-full font-bold transition-all">
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => document.getElementById('tours').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2">Book a Tour <ArrowRight className="h-5 w-5" /></button>
            <button onClick={() => document.getElementById('hotels').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-full font-bold transition-all flex items-center justify-center gap-2">View Hotels <Mountain className="h-5 w-5" /></button>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section id="tours" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Adventure Awaits</h2>
              <p className="text-lg text-gray-600">Our hand-picked tour packages in the Karakoram & Himalayas.</p>
            </div>
            <button className="text-blue-600 font-bold hover:underline transition-all">View All Tours →</button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {tours.map((tour) => (
                <div key={tour._id} onClick={() => navigate(`/tour/${tour._id}`)} className="group bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer">
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img src={tour.imageUrl} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm uppercase tracking-wider">{tour.duration}</div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 text-gray-500 text-xs font-medium uppercase tracking-wider mb-2"><MapPin className="h-3 w-3" /> {tour.location}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{tour.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{tour.description}</p>
                    <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
                      <div><span className="text-2xl font-black text-gray-900">PKR {tour.price.toLocaleString()}</span><span className="text-xs text-gray-500 ml-1">/ person</span></div>
                      <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"><ArrowRight className="h-5 w-5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Hotels */}
      <section id="hotels" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Luxury Stays</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">From mountain resorts to cozy valley stays, we've partnered with the finest hotels in Baltistan.</p>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {hotels.map((hotel) => (
                <div key={hotel._id} onClick={() => navigate(`/hotel/${hotel._id}`)} className="bg-white rounded-3xl overflow-hidden shadow-lg group hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                  <div className="relative h-64 md:h-72">
                    <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 md:p-8">
                      <div>
                        <div className="flex items-center gap-1 text-white/90 text-sm mb-1"><MapPin className="h-4 w-4" /> {hotel.location}</div>
                        <h3 className="text-2xl font-bold text-white leading-tight">{hotel.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {hotel.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-semibold">{amenity}</span>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-8 leading-relaxed italic">"{hotel.description}"</p>
                    <div className="flex justify-between items-center">
                      <div><span className="text-2xl md:text-3xl font-bold text-blue-600">PKR {hotel.pricePerNight.toLocaleString()}</span><span className="text-gray-500 text-sm"> / night</span></div>
                      <button className="bg-gray-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-black transition-colors">Book</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Memories (Gallery) Section */}
      <section id="memories" className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tighter uppercase">Guest Memories</h2>
            <p className="text-lg text-gray-600">Capturing moments that last a lifetime in the heart of Baltistan.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {memories.map((img, idx) => (
              <div key={idx} className="h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm group">
                <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Inquiry Section */}
      <section id="contact" className="py-20 md:py-32 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none"><Mountain className="w-full h-full text-white" /></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-2xl flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">Need a custom <br className="hidden md:block" /> Skardu Itinerary?</h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">Our local experts can craft the perfect journey for your family or group.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all">Talk to an Expert</button>
                <button className="bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all">Download Brochure</button>
              </div>
            </div>
            <div className="w-full lg:w-1/3 bg-gray-50 p-6 md:p-10 rounded-[2rem] border border-gray-100">
               <h3 className="text-2xl font-bold mb-6">Quick Inquiry</h3>
               {inquiryStatus === "success" ? (
                 <div className="bg-green-100 text-green-700 p-6 rounded-2xl text-center font-bold">Message Sent Successfully!</div>
               ) : (
                 <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <input required type="text" placeholder="Your Name" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} />
                    <input required type="email" placeholder="Your Email" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" value={inquiryData.email} onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})} />
                    <textarea required placeholder="Your message..." className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none" value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}></textarea>
                    <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all">Send Message</button>
                 </form>
               )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
