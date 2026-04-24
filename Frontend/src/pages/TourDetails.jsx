import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Calendar, CheckCircle, ArrowLeft, Send, ExternalLink, ShieldCheck, Star, Plane, Car, Phone } from "lucide-react";
import { supabase } from "../lib/supabase";
import { message } from "antd";

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    phoneNumber: "",
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
    if (!bookingData.phoneNumber) {
      message.error("Phone number is required!");
      return;
    }

    try {
      const { error } = await supabase.from("bookings").insert([{
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        phone_number: bookingData.phoneNumber,
        booking_date: bookingData.bookingDate,
        type: "tour",
        target_id: id,
        package_name: tour.name,
        status: "pending"
      }]);
      
      if (error) throw error;

      // Send Email Notification
      await fetch("https://formsubmit.co/ajax/baltistantourismclub00@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          Subject: "New Tour Booking for " + tour.name,
          Tour: tour.name,
          Customer: bookingData.customerName,
          Phone: bookingData.phoneNumber,
          Email: bookingData.customerEmail || "Not provided",
          Date: bookingData.bookingDate,
          Price: "PKR " + tour.price.toLocaleString(),
          "_template": "table"
        })
      });
      
      message.success("Booking request sent successfully!");
      setBookingStatus("success");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Booking failed:", error);
      message.error("Failed to submit booking. Please try again.");
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
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-0">
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

      {/* EXPANDING BANNER GALLERY */}
      {images.length > 0 && (
        <section className="bg-white overflow-hidden">
          <div className="flex h-[300px] md:h-[500px] w-full gap-1 p-2">
            {images.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative h-full cursor-pointer transition-all duration-700 ease-in-out rounded-2xl overflow-hidden ${
                  activeImage === idx ? 'flex-[5]' : 'flex-1 brightness-50 hover:brightness-100'
                }`}
              >
                <img 
                  src={img} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt={`View ${idx + 1}`} 
                />
                {activeImage === idx && (
                   <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-6 pt-20">
                      <p className="text-white font-black text-xs md:text-xl uppercase tracking-tighter drop-shadow-lg">{tour.name} - View {idx + 1}</p>
                   </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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
            <div className="flex flex-wrap gap-4 md:gap-6 text-gray-500 font-bold text-[10px] md:text-sm">
              <span className="flex items-center gap-1.5 md:gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                <Clock className="h-4 w-4 text-blue-600" /> {tour.duration}
              </span>
              <span className="flex items-center gap-1.5 md:gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                {tour.category === 'By Air' ? <Plane size={14} className="text-amber-500" /> : <Car size={14} className="text-blue-600" />}
                {tour.category || 'By Road'} Travel
              </span>
            </div>
          </header>

          <section className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 text-blue-600">Adventure Overview</h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              {tour.description}
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 md:mb-8 text-blue-600">Detailed Itinerary</h2>
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
                    type="tel" 
                    placeholder="Phone Number (e.g. +92...)"
                    className="w-full p-4 rounded-xl md:rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm md:text-base"
                    value={bookingData.phoneNumber}
                    onChange={(e) => setBookingData({...bookingData, phoneNumber: e.target.value})}
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address (Optional)"
                    className="w-full p-4 rounded-xl md:rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm md:text-base"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                  />
                  <input 
                    required
                    id="booking-date-picker"
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

            {/* Contact Section */}
            <div className="bg-white rounded-2xl md:rounded-[40px] p-6 md:p-10 shadow-lg border border-gray-100">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Need <span className="text-blue-600">Help?</span></h3>
              <div className="space-y-4">
                <a href="tel:+923466444471" className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group">
                  <div className="bg-blue-600 text-white p-3 rounded-xl group-hover:scale-110 transition-transform"><Phone size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Call Us Directly</p>
                    <p className="font-bold text-gray-900">+92 346 6444471</p>
                  </div>
                </a>
                <a href="https://wa.me/923466444471" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors group">
                  <div className="bg-green-600 text-white p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <svg size={20} fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.303-.883-.787-1.48-1.76-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.072 1.758-.717 2.008-1.41.25-.694.25-1.287.175-1.41-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .015 5.398.015 12.03c0 2.12.553 4.189 1.605 6.04L0 24l3.788-1.002a11.85 11.85 0 005.626 1.436h.005c6.632 0 12.03-5.39 12.03-12.03a11.82 11.82 0 00-3.418-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp Support</p>
                    <p className="font-bold text-gray-900">Chat with Experts</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* COMPACT Floating Mobile CTA */}
      <div className="lg:hidden fixed bottom-6 right-6 left-6 z-40">
        <button 
          onClick={() => document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' })}
          className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-2xl shadow-blue-600/40 border-2 border-white flex items-center justify-center gap-2"
        >
          Book Adventure <ArrowLeft className="rotate-180 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TourDetails;
