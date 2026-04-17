import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Calendar, CheckCircle, ArrowLeft, Send, ExternalLink, ShieldCheck, Star } from "lucide-react";
import { supabase } from "../lib/supabase";

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    bookingDate: "",
  });
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const { data, error } = await supabase
          .from("tours")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        setTour(data);
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const images = tour?.image_url ? tour.image_url.split(",").map(url => url.trim()) : [];

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("bookings").insert([{
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        booking_date: bookingData.bookingDate,
        type: "tour",
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

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Preparing Adventure...</p>
      </div>
    </div>
  );

  if (!tour) return <div className="text-center py-20">Tour not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header / Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Adventures
          </button>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
              tour.category === 'Premium' ? 'bg-amber-500 text-white' : 
              tour.category === 'Standard' ? 'bg-blue-600 text-white' : 
              'bg-gray-600 text-white'
            }`}>
              {tour.category || 'Standard'} Category
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Tour Details */}
        <div className="lg:col-span-7 space-y-8">
          <header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-2 text-sm uppercase tracking-widest">
                <MapPin className="h-4 w-4" /> {tour.location}
              </div>
              {tour.location_link && (
                <a 
                  href={tour.location_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest group"
                >
                  View Route <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
              {tour.name}
            </h1>
            <div className="flex gap-6 text-gray-500 font-bold text-sm">
              <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-600" /> {tour.duration}</span>
              <span className="flex items-center gap-2 uppercase tracking-widest">{tour.category} Experience</span>
            </div>
          </header>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Adventure Overview</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {tour.description}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-8">Detailed Itinerary</h2>
            <div className="space-y-6">
              {tour.plan && tour.plan.map((day, index) => (
                <div key={index} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    {index !== tour.plan.length - 1 && <div className="w-1 bg-gray-200 flex-grow my-2 rounded-full"></div>}
                  </div>
                  <div className="pb-8">
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Day {index + 1}</h4>
                    <p className="text-lg text-gray-700 font-bold leading-relaxed">{day}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Media & Booking */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Main Image Gallery */}
          <div className="bg-white p-3 rounded-[32px] shadow-xl border border-gray-100">
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-3">
              <img 
                src={images[activeImage] || tour.image_url} 
                className="w-full h-full object-cover transition-all duration-500" 
                alt={tour.name} 
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                      activeImage === idx ? 'ring-4 ring-blue-600 scale-95' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Preview Logic if applicable */}
          {tour.map_link && (
            <div className="bg-white p-3 rounded-[32px] shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 rounded-[24px] overflow-hidden h-64 relative group">
                <iframe
                  src={tour.map_link}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Tour Route"
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                ></iframe>
                {tour.location_link && (
                  <a 
                    href={tour.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <MapPin size={14} className="text-blue-600" />
                    <span className="text-xs font-black uppercase">Open Full Map</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Booking Card */}
          <div className="bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="mb-8">
              <p className="text-blue-600 text-sm font-black uppercase tracking-widest mb-1">
                {tour.category || 'Standard'} Package
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-gray-900">PKR {tour.price?.toLocaleString()}</span>
                <span className="text-gray-400 font-bold text-sm">/ person</span>
              </div>
            </div>

            {bookingStatus === "success" ? (
              <div className="bg-green-50 text-green-700 p-8 rounded-2xl text-center space-y-4 animate-in zoom-in-95">
                <ShieldCheck className="h-16 w-16 mx-auto text-green-500" />
                <h3 className="text-2xl font-black">Success!</h3>
                <p className="font-medium text-sm">Adventure awaits! Our team will contact you shortly to confirm your booking for {tour.name}.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <input 
                  required
                  type="text" 
                  placeholder="Full Name"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700"
                  value={bookingData.customerName}
                  onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                />
                <input 
                  required
                  type="email" 
                  placeholder="Email Address"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700"
                  value={bookingData.customerEmail}
                  onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                />
                <input 
                  required
                  type="date" 
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700 uppercase text-xs"
                  value={bookingData.bookingDate}
                  onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                />
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
                >
                  Book Adventure <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4 italic">No payment required now</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
