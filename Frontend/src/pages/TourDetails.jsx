import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Calendar, CheckCircle, ArrowLeft, Send, ExternalLink, ShieldCheck, Star, Plane, Car } from "lucide-react";
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
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors text-sm"
          >
            <ArrowLeft className="h-5 w-5" /> <span className="hidden sm:inline">Back to Adventures</span>
          </button>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
              tour.category === 'By Air' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              {tour.category === 'By Air' ? <Plane size={14} /> : <Car size={14} />}
              {tour.category || 'By Road'}
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
                src={images[activeImage] || tour.image_url} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt={tour.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-8">
                 <p className="text-white font-black text-lg md:text-2xl uppercase tracking-tighter">{tour.name} - {tour.location}</p>
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
        
        {/* LEFT COLUMN: Tour Details */}
        <div className="lg:col-span-7 space-y-8 md:space-y-10">
          <header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-2 text-xs md:text-sm uppercase tracking-widest">
                <MapPin className="h-4 w-4" /> {tour.location}
              </div>
              {tour.location_link && (
                <a 
                  href={tour.location_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] md:text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest group"
                >
                  View Route <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
              {tour.name}
            </h1>
            <div className="flex gap-4 md:gap-6 text-gray-500 font-bold text-[10px] md:text-sm">
              <span className="flex items-center gap-1.5 md:gap-2"><Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" /> {tour.duration}</span>
              <span className="flex items-center gap-1.5 md:gap-2 uppercase tracking-widest italic flex items-center">
                {tour.category === 'By Air' ? <Plane size={14} className="text-amber-500" /> : <Car size={14} className="text-blue-600" />}
                {tour.category || 'By Road'} Travel
              </span>
            </div>
          </header>

          <section className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Adventure Overview</h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              {tour.description}
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 md:mb-8">Detailed Itinerary</h2>
            <div className="space-y-6 md:space-y-8">
              {tour.plan && tour.plan.map((day, index) => (
                <div key={index} className="flex gap-4 md:gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    {index !== tour.plan.length - 1 && <div className="w-1 bg-gray-200 flex-grow my-2 rounded-full"></div>}
                  </div>
                  <div className="pb-6 md:pb-8">
                    <h4 className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Day {index + 1}</h4>
                    <p className="text-base md:text-lg text-gray-700 font-bold leading-relaxed">{day}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Media & Booking */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="space-y-6 md:space-y-8">
            {/* Map Preview Logic if applicable */}
            {tour.map_link && (
              <div className="bg-white p-3 rounded-2xl md:rounded-[32px] shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 rounded-xl md:rounded-[24px] overflow-hidden h-64 relative group">
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
                      className="absolute top-4 left-4 bg-white px-3 md:px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <MapPin size={14} className="text-blue-600" />
                      <span className="text-[10px] md:text-xs font-black uppercase">Open Full Map</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Booking Card */}
            <div id="booking-form" className="bg-white rounded-2xl md:rounded-[32px] shadow-2xl p-6 md:p-8 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-600/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>
              
              <div className="mb-6 md:mb-8">
                <p className="text-blue-600 text-xs md:text-sm font-black uppercase tracking-widest mb-1">
                  {tour.category || 'By Road'} Package
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black text-gray-900">PKR {tour.price?.toLocaleString()}</span>
                  <span className="text-gray-400 font-bold text-xs md:sm">/ person</span>
                </div>
              </div>

              {bookingStatus === "success" ? (
                <div className="bg-green-50 text-green-700 p-6 md:p-8 rounded-xl md:rounded-2xl text-center space-y-3 md:space-y-4 animate-in zoom-in-95">
                  <ShieldCheck className="h-12 w-12 md:h-16 md:w-16 mx-auto text-green-500" />
                  <h3 className="text-xl md:text-2xl font-black">Success!</h3>
                  <p className="font-medium text-xs md:sm">Adventure awaits! Our team will contact you shortly to confirm your booking for {tour.name}.</p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <input 
                    required
                    type="text" 
                    placeholder="Full Name"
                    className="w-full p-4 rounded-xl md:rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700 text-sm md:text-base"
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                  />
                  <input 
                    required
                    type="email" 
                    placeholder="Email Address"
                    className="w-full p-4 rounded-xl md:rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700 text-sm md:text-base"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                  />
                  <input 
                    required
                    type="date" 
                    className="w-full p-4 rounded-xl md:rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700 uppercase text-xs md:text-sm"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                  />
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
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
      
      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40">
        <button 
          onClick={() => document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' })}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-600/20"
        >
          Book This Tour - PKR {tour.price?.toLocaleString()}
        </button>
      </div>
    </div>
  );
};

export default TourDetails;
