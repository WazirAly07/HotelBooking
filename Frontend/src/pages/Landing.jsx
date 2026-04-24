import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Clock, Star, ArrowRight, ShieldCheck, Mountain, Camera, Search, Lock, Plus, Trash2, Image as ImageIcon, Upload, Loader2, Plane, Car, X, CheckCircle, Phone } from "lucide-react";
import { supabase } from "../lib/supabase";
import logo from "../assets/Images/logo.png";
import { message } from "antd";

// Import cover images
import cover1 from "../assets/Images/covers.png";
import cover2 from "../assets/Images/cover2.png";
import cover3 from "../assets/Images/cover3.png";

const Landing = () => {
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [latestMemories, setLatestMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState(cover1);
  const [showPreloader, setShowPreloader] = useState(() => {
    return !sessionStorage.getItem("preloaderShown");
  });
  const [preloaderFade, setPreloaderFade] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  const [inquiryData, setInquiryData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [inquiryStatus, setInquiryStatus] = useState(null);
  
  const [tripPlan, setTripPlan] = useState({
    customer_name: "",
    customer_email: "",
    phone_number: "",
    destination: "",
    travel_date: "",
    duration: "",
    travelers_count: 1,
    budget_range: "",
    requirements: "",
    group_type: "Solo",
    travel_category: "By Road"
  });
  const [planStatus, setPlanStatus] = useState(null);

  const [memoryData, setMemoryData] = useState({
    customerName: "",
    comment: "",
    location: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [memoryStatus, setMemoryStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // RANDOMIZE COVER ON EVERY REFRESH
    const images = [cover1, cover2, cover3];
    const randomImg = images[Math.floor(Math.random() * images.length)];
    setHeroImage(randomImg);

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
      let tourQuery = supabase.from("tours").select("*").limit(4);
      let hotelQuery = supabase.from("hotels").select("*").limit(3);
      let feedbackQuery = supabase.from("feedback").select("*").order('created_at', { ascending: false }).limit(4);

      if (query) {
        tourQuery = supabase.from("tours").select("*").ilike("name", `%${query}%`).limit(4);
        hotelQuery = supabase.from("hotels").select("*").ilike("name", `%${query}%`).limit(3);
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
      setLatestMemories(feedbackData || []);
      
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
      setTimeout(() => {
        setShowPreloader(false);
        sessionStorage.setItem("preloaderShown", "true");
      }, 500);
    }, 1200); 
    return () => clearTimeout(timer);
  }, []);

  // Animation Trigger for scroll reveals
  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [loading, tours, hotels]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryData.phone) {
      message.error("Phone number is required!");
      return;
    }

    try {
      const { error } = await supabase.from("inquiries").insert([{
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        message: inquiryData.message
      }]);
      if (error) throw error;
      
      // Send Email Notification
      await fetch("https://formsubmit.co/ajax/baltistantourismclub00@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          Subject: "New Inquiry from " + inquiryData.name,
          Name: inquiryData.name,
          Phone: inquiryData.phone,
          Email: inquiryData.email || "Not provided",
          Message: inquiryData.message,
          "_template": "table"
        })
      });

      message.success("Inquiry sent successfully!");
      setInquiryStatus("success");
      setInquiryData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setInquiryStatus(null), 5000);
    } catch (error) {
      console.error("Inquiry failed:", error);
      message.error("Failed to send inquiry. Please try again.");
      setInquiryStatus("error");
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!tripPlan.phone_number) {
      message.error("Phone number is required!");
      return;
    }

    try {
      const { error } = await supabase.from("trip_plans").insert([tripPlan]);
      if (error) throw error;

      // Send Email Notification
      await fetch("https://formsubmit.co/ajax/baltistantourismclub00@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          Subject: "New Custom Trip Plan Request from " + tripPlan.customer_name,
          Customer: tripPlan.customer_name,
          Phone: tripPlan.phone_number,
          Email: tripPlan.customer_email || "Not provided",
          Destination: tripPlan.destination,
          Travelers: tripPlan.travelers_count,
          Date: tripPlan.travel_date,
          Duration: tripPlan.duration,
          Category: tripPlan.travel_category,
          Requirements: tripPlan.requirements,
          "_template": "table"
        })
      });

      message.success("Trip plan request submitted successfully!");
      setPlanStatus("success");
      setTripPlan({
        customer_name: "",
        customer_email: "",
        phone_number: "",
        destination: "",
        travel_date: "",
        duration: "",
        travelers_count: 1,
        budget_range: "",
        requirements: "",
        group_type: "Solo",
        travel_category: "By Road"
      });
      setTimeout(() => {
        setPlanStatus(null);
        setShowPlanModal(false);
      }, 3000);
    } catch (error) {
      console.error("Plan submission failed:", error);
      message.error("Failed to submit trip plan. Please try again.");
    }
  };

  if (showPreloader) {
    return (
      <div className={`fixed inset-0 z-[9999] bg-blue-900 flex flex-col items-center justify-center transition-opacity duration-700 ${preloaderFade ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black opacity-90"></div>
        
        <div className="relative z-10 overflow-hidden px-4">
          <div className="flex flex-col items-center gap-12 animate-[zoomIn_1s_ease-out_forwards]">
            {/* Logo made larger and rounder */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl group-hover:blur-[100px] transition-all duration-700 animate-pulse"></div>
              <img 
                src={logo} 
                alt="Logo" 
                loading="eager"
                className="relative h-48 w-48 md:h-72 md:w-72 rounded-full object-cover border-8 border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-pulse" 
              />
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="w-48 md:w-80 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[loading_1s_ease-in-out_forwards]"></div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-none">
                  Baltistan
                </span>
                <span className="text-2xl md:text-5xl font-bold text-blue-400 tracking-[0.2em] uppercase mt-[-5px]">
                  Tourism
                </span>
              </div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
        ` }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomOutHero { 0% { transform: scale(1.1); } 50% { transform: scale(1); } 100% { transform: scale(1.1); } }
        .animate-fadeInDown { animation: fadeInDown 1s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 1s ease-out forwards; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal.animate-in { opacity: 1; transform: translateY(0); }
      ` }} />

      {/* Hero Section */}
      <section className="relative min-h-[75vh] md:h-[85vh] flex items-center justify-center bg-gray-900 overflow-hidden py-20 md:py-0">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} loading="eager" className="w-full h-full object-cover opacity-50 scale-105 animate-[zoomOutHero_25s_infinite]" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-gray-900/60 to-gray-900"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight italic uppercase animate-fadeInDown">
            Explore <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Skardu</span> <br className="hidden sm:block" /> With Baltistan Tourism Club
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-medium animate-fadeInUp delay-200">
            The pioneers of tourism in Baltistan. Experience the majesty of the Karakoram like never before.
          </p>
          
          <div className="animate-fadeInUp delay-300">
            <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="max-w-2xl mx-auto mb-10 relative px-2 group">
              <input 
                type="text" 
                placeholder="Search destinations..." 
                className="w-full py-5 md:py-6 px-8 md:px-10 rounded-full bg-white text-gray-900 md:text-lg shadow-2xl focus:ring-4 focus:ring-blue-500/50 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-4 md:right-3 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-10 rounded-full font-bold transition-all active:scale-95 shadow-lg">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center px-4 md:px-0 animate-fadeInUp delay-500">
            <button onClick={() => document.getElementById('tours').scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest transition-all shadow-xl hover:bg-blue-700 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">Book a Tour <ArrowRight className="h-5 w-5" /></button>
            <button onClick={() => setShowPlanModal(true)} className="px-10 py-5 bg-white text-gray-900 rounded-full font-black uppercase tracking-widest transition-all shadow-xl hover:bg-gray-100 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">Plan A Trip <Plus className="text-blue-600 h-5 w-5" /></button>
          </div>
        </div>
      </section>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPlanModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-8 md:p-12 shadow-2xl animate-zoomIn">
            <div className="flex justify-between items-center mb-8 border-b pb-6">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Plan Your <span className="text-blue-600">Dream Trip</span></h2>
              <button onClick={() => setShowPlanModal(false)} className="p-3 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white transition-all"><X /></button>
            </div>
            {planStatus === "success" ? (
              <div className="py-20 text-center animate-bounce"><CheckCircle className="h-20 w-20 text-green-600 mx-auto" /><h3 className="text-3xl font-black">Request Sent!</h3></div>
            ) : (
              <form onSubmit={handlePlanSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required placeholder="Full Name *" className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={tripPlan.customer_name} onChange={(e) => setTripPlan({ ...tripPlan, customer_name: e.target.value })} />
                  <input required placeholder="Phone Number *" className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={tripPlan.phone_number} onChange={(e) => setTripPlan({ ...tripPlan, phone_number: e.target.value })} />
                  <input placeholder="Email (Optional)" className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={tripPlan.customer_email} onChange={(e) => setTripPlan({ ...tripPlan, customer_email: e.target.value })} />
                  <input placeholder="Destination" className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={tripPlan.destination} onChange={(e) => setTripPlan({ ...tripPlan, destination: e.target.value })} />
                  
                  <select required className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={tripPlan.group_type || "Solo"} onChange={(e) => setTripPlan({ ...tripPlan, group_type: e.target.value })}>
                    <option value="Solo">Solo</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family</option>
                    <option value="Team / Friends">Team / Friends</option>
                  </select>

                  <input required placeholder="Duration (e.g. 5 Days) *" className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={tripPlan.duration} onChange={(e) => setTripPlan({ ...tripPlan, duration: e.target.value })} />

                  <select required className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={tripPlan.travel_category || "By Road"} onChange={(e) => setTripPlan({ ...tripPlan, travel_category: e.target.value })}>
                    <option value="By Road">By Road</option>
                    <option value="By Air">By Air</option>
                  </select>

                  <input 
                    required 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase text-xs" 
                    value={tripPlan.travel_date} 
                    onChange={(e) => setTripPlan({ ...tripPlan, travel_date: e.target.value })} 
                  />
                </div>
                <textarea placeholder="Additional Requirements & Itinerary Details (Optional)" className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none font-medium" value={tripPlan.requirements} onChange={(e) => setTripPlan({ ...tripPlan, requirements: e.target.value })}></textarea>
                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase hover:bg-blue-700 shadow-xl transition-all">Submit Trip Request</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Featured Tours */}
      <section id="tours" className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="reveal flex flex-col md:flex-row justify-between items-center mb-10 md:mb-12 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4 italic uppercase">Adventure Awaits</h2>
              <p className="text-base md:text-lg text-gray-600 font-medium">Hand-picked tour packages in the Karakoram & Himalayas.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {tours.map((tour, idx) => (
                <div key={tour.id} onClick={() => navigate(`/tour/${tour.id}`)} className={`reveal delay-${(idx % 4) * 100} group bg-gray-50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col cursor-pointer`}>
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img src={tour.image_url?.split(',')[0]} loading="lazy" alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <div className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm uppercase tracking-wider">{tour.duration}</div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        tour.category === 'By Air' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {tour.category === 'By Air' ? <Plane size={12} /> : <Car size={12} />}
                        {tour.category || 'By Road'}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow group-hover:bg-blue-50/20 transition-colors">
                    <div className="flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2"><MapPin className="h-3 w-3" /> {tour.location}</div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">{tour.name}</h3>
                    <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
                      <div><span className="text-xl font-black text-gray-900">PKR {tour.price?.toLocaleString()}</span></div>
                      <button className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-md"><ArrowRight className="h-5 w-5" /></button>
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
          <div className="reveal text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 italic uppercase tracking-tighter">Luxury <span className="text-blue-600">Stays</span></h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">Cozy valley stays to grand mountain resorts.</p>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {hotels.map((hotel, idx) => (
                <div key={hotel.id} onClick={() => navigate(`/hotel/${hotel.id}`)} className={`reveal delay-${(idx % 3) * 100} bg-white rounded-[3rem] overflow-hidden shadow-xl group hover:-translate-y-2 transition-transform duration-500 cursor-pointer`}>
                  <div className="relative h-64 md:h-72">
                    <img src={hotel.image_url?.split(',')[0]} loading="lazy" alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 md:p-8">
                      <div>
                        <div className="flex items-center gap-1 text-white/90 text-xs mb-1"><MapPin className="h-4 w-4" /> {hotel.location}</div>
                        <h3 className="text-2xl font-black text-white leading-tight italic uppercase">{hotel.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {hotel.amenities && hotel.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{amenity}</span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div><span className="text-2xl font-black text-blue-600">PKR {hotel.price_per_night?.toLocaleString()}</span><span className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1"> / night</span></div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hotel/${hotel.id}`);
                          setTimeout(() => {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                          }, 500);
                        }}
                        className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-colors"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guest Memories Section */}
      <section id="memories" className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="reveal flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic text-blue-600">Latest Memories</h2>
              <p className="text-lg text-gray-600 font-medium">Shared by our community of travelers.</p>
            </div>
            <Link to="/memories" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              View All Memories <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {latestMemories.map((memory, idx) => (
                <div key={idx} className="reveal group relative aspect-square rounded-3xl overflow-hidden shadow-lg border-2 border-gray-50 hover:shadow-2xl transition-all duration-700">
                  <img src={memory.image_url} loading="lazy" alt="Guest Memory" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    <p className="text-white font-bold text-sm mb-1">{memory.customer_name}</p>
                    <p className="text-gray-300 text-xs italic line-clamp-2">"{memory.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Inquiry Section */}
      <section id="contact" className="py-20 md:py-32 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none"><Mountain className="w-full h-full text-white" /></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="reveal bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-2xl flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight uppercase italic tracking-tighter">Need a custom <br /><span className="text-blue-600 underline decoration-4 underline-offset-8">Itinerary?</span></h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-medium">Our local experts can craft the perfect journey for your family or group.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/about#experts" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center uppercase tracking-widest">Talk to an Expert</Link>
                <button className="bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all uppercase tracking-widest">Download Guide</button>
              </div>
            </div>
            <div className="w-full lg:w-1/3 bg-gray-50 p-6 md:p-10 rounded-[2rem] border border-gray-100 shadow-inner">
               <h3 className="text-2xl font-black mb-6 uppercase italic tracking-tight">Quick <span className="text-blue-600">Inquiry</span></h3>
               {inquiryStatus === "success" ? (
                 <div className="bg-green-100 text-green-700 p-6 rounded-2xl text-center font-bold">Message Sent Successfully!</div>
               ) : (
                 <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <input required placeholder="Your Name" className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm transition-all" value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} />
                    <input required type="tel" placeholder="Phone Number *" className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm transition-all" value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} />
                    <input type="email" placeholder="Email Address (Optional)" className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm transition-all" value={inquiryData.email} onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})} />
                    <textarea required placeholder="Requirements..." className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none font-medium shadow-sm transition-all" value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}></textarea>
                    <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-xl font-black uppercase hover:bg-black transition-all active:scale-[0.98]">Send Message</button>
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
