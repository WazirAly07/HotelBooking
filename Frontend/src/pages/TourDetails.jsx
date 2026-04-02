import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Clock, Calendar, CheckCircle, ArrowLeft, Send } from "lucide-react";

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    bookingDate: "",
  });
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tours/${id}`);
        setTour(res.data);
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/bookings", {
        ...bookingData,
        type: "tour",
        targetId: id,
      });
      setBookingStatus("success");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus("error");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!tour) return <div className="text-center py-20">Tour not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Banner */}
      <div className="relative h-[50vh] overflow-hidden">
        <img src={tour.imageUrl} alt={tour.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{tour.name}</h1>
            <div className="flex justify-center gap-6 text-white/90">
              <span className="flex items-center gap-2"><Clock className="h-5 w-5" /> {tour.duration}</span>
              <span className="flex items-center gap-2"><MapPin className="h-5 w-5" /> {tour.location}</span>
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Tour Overview</h2>
            <p className="text-lg text-gray-600 leading-relaxed">{tour.description}</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Itinerary</h2>
            <div className="space-y-6">
              {tour.plan.map((day, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    {index !== tour.plan.length - 1 && <div className="w-1 bg-gray-200 flex-grow my-2"></div>}
                  </div>
                  <div className="pb-8">
                    <p className="text-lg text-gray-700 font-medium">{day}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24 border border-gray-100">
            <div className="mb-8">
              <span className="text-gray-500 text-sm">Tour Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-blue-600">PKR {tour.price.toLocaleString()}</span>
                <span className="text-gray-500">/ person</span>
              </div>
            </div>

            {bookingStatus === "success" ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl text-center space-y-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h3 className="text-xl font-bold">Booking Successful!</h3>
                <p>We'll contact you soon with more details.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter your name"
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    required
                    type="email" 
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter your email"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Reserve Spot <Send className="h-5 w-5" />
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 italic">No payment required at this stage</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
