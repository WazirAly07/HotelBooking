import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Clock, Star, ArrowRight, ShieldCheck, Mountain, Camera, Search, Lock, Plus, Trash2, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const Landing = () => {
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderFade, setPreloaderFade] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [inquiryData, setInquiryData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [inquiryStatus, setInquiryStatus] = useState(null);
  
  const [memoryData, setMemoryData] = useState({
    customerName: "",
    comment: "",
    location: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [memoryStatus, setMemoryStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setMemoryData(prev => ({
          ...prev,
          customerName: session.user.user_metadata?.full_name || ""
        }));
      }
    };
    getSession();
  }, []);

  const fetchData = async (query = "") => {
    setLoading(true);
    try {
      let tourQuery = supabase.from("tours").select("*");
      let hotelQuery = supabase.from("hotels").select("*");
      let feedbackQuery = supabase.from("feedback").select("*").order('created_at', { ascending: false });

      if (query) {
        tourQuery = tourQuery.ilike("name", `%${query}%`);
        hotelQuery = hotelQuery.ilike("name", `%${query}%`);
      }

      const [
        { data: toursData, error: toursError }, 
        { data: hotelsData, error: hotelsError },
        { data: feedbackData, error: feedbackError }
      ] = await Promise.all([
        tourQuery,
        hotelQuery,
        feedbackQuery
      ]);

      if (toursError) throw toursError;
      if (hotelsError) throw hotelsError;
      if (feedbackError) throw feedbackError;

      setTours(toursData || []);
      setHotels(hotelsData || []);
      
      // FILTER: Only include records that have an image URL from Supabase Storage
      const photoMemories = (feedbackData || []).filter(item => 
        item.image_url && item.image_url.includes("supabase.co/storage")
      );

      const grouped = photoMemories.reduce((acc, current) => {
        const loc = current.location || "General";
        if (!acc[loc]) acc[loc] = { location: loc, images: [], stories: [] };
        const urls = current.image_urls || (current.image_url ? [current.image_url] : []);
        acc[loc].images.push(...urls);
        acc[loc].stories.push({ name: current.customer_name, comment: current.comment });
        return acc;
      }, {});
      
      setAlbums(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => {
      setPreloaderFade(true);
      setTimeout(() => setShowPreloader(false), 700);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("inquiries").insert([inquiryData]);
      if (error) throw error;
      setInquiryStatus("success");
      setInquiryData({ name: "", email: "", message: "" });
      setTimeout(() => setInquiryStatus(null), 5000);
    } catch (error) {
      console.error("Inquiry failed:", error);
      setInquiryStatus("error");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleMemorySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (selectedFiles.length === 0) {
      alert("Please select at least one image!");
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = [];

      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('memories')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('memories')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }

      const { error } = await supabase.from("feedback").insert([{ 
        customer_name: memoryData.customerName,
        comment: memoryData.comment,
        location: memoryData.location,
        image_url: uploadedUrls[0],
        rating: 5 
      }]);
      
      if (error) throw error;
      setMemoryStatus("success");
      setMemoryData({
        customerName: user.user_metadata?.full_name || "",
        comment: "",
        location: "",
      });
      setSelectedFiles([]);
      fetchData();
      setTimeout(() => setMemoryStatus(null), 5000);
    } catch (error) {
      console.error("Memory submission failed:", error);
      alert("Error: " + error.message);
      setMemoryStatus("error");
    } finally {
      setUploading(false);
    }
  };

  if (showPreloader) {
    return (
      <div className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ${preloaderFade ? 'opacity-0' : 'opacity-100'}`}>
        <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover opacity-50 scale-105">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-snowy-mountain-peak-42845-large.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 overflow-hidden px-4">
          <div className="flex flex-col md:flex-row items-center gap-4 animate-[slideUp_1.2s_ease-out_forwards]">
            <Mountain className="h-16 w-16 md:h-24 md:w-24 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <div className="flex flex-col items-center md:items-start">
              <span className="text-4xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">
                Baltistan
              </span>
              <span className="text-2xl md:text-5xl font-bold text-blue-400 tracking-[0.2em] uppercase mt-[-5px]">
                Tourism
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_forwards]"></div>
        </div>

        <style>{`
          @keyframes slideUp {
            0% { transform: translateY(100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
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
          
          <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="max-w-2xl mx-auto mb-10 relative px-4">
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
                <div key={tour.id} onClick={() => navigate(`/tour/${tour.id}`)} className="group bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer">
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img src={tour.image_url} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm uppercase tracking-wider">{tour.duration}</div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 text-gray-500 text-xs font-medium uppercase tracking-wider mb-2"><MapPin className="h-3 w-3" /> {tour.location}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{tour.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{tour.description}</p>
                    <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
                      <div><span className="text-2xl font-black text-gray-900">PKR {tour.price ? tour.price.toLocaleString() : 0}</span><span className="text-xs text-gray-500 ml-1">/ person</span></div>
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
                <div key={hotel.id} onClick={() => navigate(`/hotel/${hotel.id}`)} className="bg-white rounded-3xl overflow-hidden shadow-lg group hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                  <div className="relative h-64 md:h-72">
                    <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 md:p-8">
                      <div>
                        <div className="flex items-center gap-1 text-white/90 text-sm mb-1"><MapPin className="h-4 w-4" /> {hotel.location}</div>
                        <h3 className="text-2xl font-bold text-white leading-tight">{hotel.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {hotel.amenities && hotel.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-semibold">{amenity}</span>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-8 leading-relaxed italic">"{hotel.description}"</p>
                    <div className="flex justify-between items-center">
                      <div><span className="text-2xl md:text-3xl font-bold text-blue-600">PKR {hotel.price_per_night ? hotel.price_per_night.toLocaleString() : 0}</span><span className="text-gray-500 text-sm"> / night</span></div>
                      <button className="bg-gray-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-black transition-colors">Book</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Memories (Album) Section */}
      <section id="memories" className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tighter uppercase">Guest Memories</h2>
              <p className="text-lg text-gray-600">Explore Baltistan through the eyes of our guests.</p>
            </div>
            <Link to="/memories" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              View All Memories <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          <div className="space-y-20 mb-24">
            {albums.slice(0, 2).map((album, idx) => (
              <div key={idx} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-100"></div>
                  <h3 className="text-2xl md:text-4xl font-black text-blue-900 flex items-center gap-3 italic uppercase tracking-tighter">
                    <MapPin className="h-6 w-6 text-blue-600" /> {album.location}
                  </h3>
                  <div className="h-px flex-1 bg-gray-100"></div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {album.images.slice(0, 4).map((img, imgIdx) => (
                    <div key={imgIdx} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group relative border-2 border-gray-50">
                      <img src={img} alt={album.location} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Memory Form - Only for Logged In Users */}
          <div className="max-w-3xl mx-auto bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
            {!user && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-blue-600 p-4 rounded-full mb-4 shadow-xl shadow-blue-200">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Share Your Story</h3>
                <p className="text-gray-600 font-medium max-w-sm mb-6">You need to be logged in to post your beautiful memories from Baltistan.</p>
                <div className="flex gap-4">
                  <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">Sign In</Link>
                  <Link to="/signup" className="bg-white text-blue-600 border border-blue-100 px-8 py-3 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95">Register</Link>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Add Your Memory</h3>
              <p className="text-gray-600">Upload your favorite photos from your trip</p>
            </div>

            {memoryStatus === "success" ? (
              <div className="bg-green-100 text-green-700 p-6 rounded-2xl text-center font-bold border border-green-200">
                Memory Shared Successfully! Your photos are being added to the album.
              </div>
            ) : (
              <form onSubmit={handleMemorySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Display Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. John Doe" 
                      className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium" 
                      value={memoryData.customerName} 
                      onChange={(e) => setMemoryData({...memoryData, customerName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Visited Location (Album Name)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Shangrila Lake" 
                      className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium" 
                      value={memoryData.location} 
                      onChange={(e) => setMemoryData({...memoryData, location: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Photos
                  </label>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="memory-files"
                    />
                    <label 
                      htmlFor="memory-files"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:bg-gray-50 cursor-pointer transition-all hover:border-blue-400 group"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
                        <p className="mb-2 text-sm text-gray-500 font-bold">Click to upload photos</p>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-black">PNG, JPG or WEBP</p>
                      </div>
                    </label>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-wrap gap-2">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 shadow-sm flex items-center gap-2 border border-blue-200">
                          <ImageIcon className="h-3 w-3" /> {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Your Experience</label>
                  <textarea 
                    required 
                    placeholder="Describe your favorite moment..." 
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none bg-white font-medium" 
                    value={memoryData.comment} 
                    onChange={(e) => setMemoryData({...memoryData, comment: e.target.value})}
                  ></textarea>
                </div>
                
                <div className="w-full pt-6">
                  <button 
                    disabled={uploading || selectedFiles.length === 0}
                    type="submit" 
                    className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Uploading Memories...
                      </>
                    ) : (
                      <>
                        Post to Album <Camera className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
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
