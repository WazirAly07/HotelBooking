import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Star, CheckCircle, ArrowLeft, Send, Wifi, Coffee, Utensils, Mountain } from "lucide-react";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    bookingDate: "",
  });
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/hotels/${id}`);
        setHotel(res.data);
      } catch (error) {
        console.error("Error fetching hotel:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/bookings", {
        ...bookingData,
        type: "hotel",
        targetId: id,
      });
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
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!hotel) return <div className="text-center py-20">Hotel not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Banner */}
      <div className="relative h-[60vh] overflow-hidden">
        <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-1 text-blue-400 font-bold mb-2 uppercase tracking-widest text-sm">
                  <MapPin className="h-4 w-4" /> {hotel.location}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white">{hotel.name}</h1>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <p className="text-white/80 text-sm mb-1">Starting from</p>
                <p className="text-3xl font-black text-white">PKR {hotel.pricePerNight.toLocaleString()} <span className="text-sm font-normal">/ night</span></p>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition-all"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Property</h2>
            <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-blue-600 pl-6">
              {hotel.description}
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Amenities & Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {hotel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-blue-600">{getAmenityIcon(amenity)}</div>
                  <span className="font-semibold text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-24 border border-gray-100 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-10 -mt-10"></div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Reserve Your Stay</h3>

            {bookingStatus === "success" ? (
              <div className="bg-green-50 text-green-700 p-8 rounded-2xl text-center space-y-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
                <p>We've received your request for {hotel.name}. Our team will call you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Guest Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    required
                    type="email" 
                    className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="john@example.com"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Check-in Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gray-900 text-white py-5 rounded-xl font-black text-lg hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  Book Now <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
