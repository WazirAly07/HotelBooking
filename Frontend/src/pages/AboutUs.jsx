import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, ShieldCheck, Award, Heart, ChevronLeft, ChevronRight, Quote, User } from "lucide-react";
import { supabase } from "../lib/supabase";

const AboutUs = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState({
    customerName: "",
    comment: "",
    rating: 5,
    location: "",
    imageUrl: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg" // Default
  });
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  const maleAvatar = "https://xsgames.co/randomusers/assets/avatars/male/1.jpg";
  const femaleAvatar = "https://xsgames.co/randomusers/assets/avatars/female/1.jpg";

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // FILTER: Only show reviews that use the generic avatars 
      // (This hides the photo memories from the Guest Wall)
      const textReviews = (data || []).filter(item => 
        !item.image_url || !item.image_url.includes("supabase.co/storage")
      );
      
      setFeedbacks(textReviews);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackData.customerName) {
      alert("Please provide your name!");
      return;
    }
    try {
      const { error } = await supabase.from("feedback").insert([{
        customer_name: feedbackData.customerName,
        comment: feedbackData.comment,
        rating: feedbackData.rating,
        location: feedbackData.location,
        image_url: feedbackData.imageUrl
      }]);
      
      if (error) throw error;
      
      setFeedbackStatus("success");
      setFeedbackData({ 
        customerName: "", 
        comment: "", 
        rating: 5, 
        location: "", 
        imageUrl: maleAvatar 
      });
      fetchFeedbacks();
      setTimeout(() => setFeedbackStatus(null), 5000);
    } catch (error) {
      console.error("Feedback failed:", error);
      setFeedbackStatus("error");
    }
  };

  const nextFeedback = () => {
    setCurrentFeedbackIndex((prev) => (prev + 2 >= feedbacks.length ? 0 : prev + 2));
  };

  const prevFeedback = () => {
    setCurrentFeedbackIndex((prev) => (prev - 2 < 0 ? Math.max(0, feedbacks.length - 2) : prev - 2));
  };

  const displayFeedbacks = feedbacks.slice(currentFeedbackIndex, currentFeedbackIndex + 2);

  return (
    <div className="bg-white min-h-screen">
      {/* About Hero */}
      <section className="relative py-16 md:py-24 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1589928335017-6644f8494f6c?q=80&w=2000')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-7xl font-black text-white mb-4 md:mb-6 uppercase italic tracking-tighter leading-tight">
            Our <span className="text-blue-500">Journey</span>
          </h1>
          <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            The pioneers of sustainable travel in Baltistan. Sharing the majesty of the Karakoram with the world since 2015.
          </p>
        </div>
      </section>

      {/* Side-by-Side Feedback Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
            
            {/* Left Side: Feedback Form */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl p-6 md:p-12 border border-blue-50">
              <div className="mb-8 md:mb-10 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Tell Your Story</h2>
                <p className="text-gray-500 text-xs md:text-sm italic">"Your story inspires others to explore the north"</p>
              </div>

              {feedbackStatus === "success" ? (
                <div className="bg-green-50 text-green-700 p-6 md:p-8 rounded-2xl text-center font-bold animate-pulse text-sm md:text-base">
                  Thank you! Your review is now live on our wall.
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-5 md:space-y-6">
                  {/* Avatar Selection */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Your Avatar</p>
                    <div className="flex gap-4 md:gap-6 justify-center lg:justify-start">
                      <button 
                        type="button"
                        onClick={() => setFeedbackData({...feedbackData, imageUrl: maleAvatar})}
                        className={`flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl transition-all ${feedbackData.imageUrl === maleAvatar ? 'bg-blue-100 ring-2 ring-blue-600 scale-105' : 'bg-gray-50 opacity-40 hover:opacity-100'}`}
                      >
                        <img src={maleAvatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-md" alt="Male" />
                        <span className="text-[10px] font-black uppercase text-blue-600">Male</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFeedbackData({...feedbackData, imageUrl: femaleAvatar})}
                        className={`flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl transition-all ${feedbackData.imageUrl === femaleAvatar ? 'bg-pink-100 ring-2 ring-pink-600 scale-105' : 'bg-gray-50 opacity-40 hover:opacity-100'}`}
                      >
                        <img src={femaleAvatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-md" alt="Female" />
                        <span className="text-[10px] font-black uppercase text-pink-600">Female</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. John Doe" 
                        className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        value={feedbackData.customerName}
                        onChange={(e) => setFeedbackData({...feedbackData, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Location</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Karachi, PK" 
                        className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        value={feedbackData.location}
                        onChange={(e) => setFeedbackData({...feedbackData, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Experience Rating</label>
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setFeedbackData({...feedbackData, rating: star})} className={`${feedbackData.rating >= star ? 'text-yellow-400' : 'text-gray-200'} transition-colors`}>
                            <Star className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                      </div>
                      <span className="text-blue-600 font-black text-xs md:text-sm">{feedbackData.rating}.0 / 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Your Story</label>
                    <textarea 
                      required
                      placeholder="What was the best part of your trip?" 
                      className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 h-28 md:h-32 resize-none text-sm md:text-base"
                      value={feedbackData.comment}
                      onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full p-4 md:p-5 rounded-xl bg-blue-600 text-white font-black text-base md:text-lg hover:bg-blue-700 shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                  >
                    Post to Guest Wall
                  </button>
                </form>
              )}
            </div>

            {/* Right Side: Feedback Slider */}
            <div className="relative pt-4 px-2 md:px-0">
              <div className="mb-10 flex justify-between items-end">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic leading-none">Guest <span className="text-blue-600 underline decoration-4 underline-offset-8">Wall</span></h2>
                  <p className="text-gray-500 text-sm">Real stories from real travelers</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={prevFeedback} className="p-2 md:p-3 rounded-full bg-white shadow-md hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                    <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                  <button onClick={nextFeedback} className="p-2 md:p-3 rounded-full bg-white shadow-md hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                    <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 min-h-[350px]">
                {feedbacks.length > 0 ? (
                  displayFeedbacks.map((fb, idx) => (
                    <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl border-l-8 border-blue-600 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                      <Quote className="absolute top-4 right-4 h-10 w-10 md:h-12 md:w-12 text-blue-50 opacity-20 group-hover:text-blue-100 transition-colors" />
                      <div className="flex items-center gap-4 mb-4 md:mb-6">
                        <img src={fb.image_url || maleAvatar} alt="" className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-blue-50" />
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm md:text-base">{fb.customer_name}</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">{fb.location}</p>
                            <span className="text-gray-200">|</span>
                            <div className="flex text-yellow-400 items-center"><Star className="h-3 w-3 fill-current" /> <span className="text-[10px] ml-1 font-black">{fb.rating}.0</span></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 italic leading-relaxed text-sm md:text-base">"{fb.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-400 italic bg-white rounded-3xl border border-dashed border-gray-200 px-6">No reviews yet. Be the first to share!</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex gap-4 md:gap-6 items-start p-6 rounded-2xl md:rounded-3xl hover:bg-blue-50 transition-colors group">
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm flex-shrink-0"><ShieldCheck className="h-6 w-6 md:h-8 md:w-8" /></div>
              <div><h3 className="font-black text-lg md:text-xl mb-1 md:mb-2 uppercase tracking-tight">Safety Guaranteed</h3><p className="text-gray-500 text-xs md:text-sm leading-relaxed">We use top-tier equipment and expert local guides for every expedition.</p></div>
            </div>
            <div className="flex gap-4 md:gap-6 items-start p-6 rounded-2xl md:rounded-3xl hover:bg-indigo-50 transition-colors group">
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm flex-shrink-0"><Award className="h-6 w-6 md:h-8 md:w-8" /></div>
              <div><h3 className="font-black text-lg md:text-xl mb-1 md:mb-2 uppercase tracking-tight">Award Winning</h3><p className="text-gray-500 text-xs md:text-sm leading-relaxed">Recognized as the leading sustainable tour operator in Gilgit-Baltistan.</p></div>
            </div>
            <div className="flex gap-4 md:gap-6 items-start p-6 rounded-2xl md:rounded-3xl hover:bg-teal-50 transition-colors group">
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm flex-shrink-0"><Heart className="h-6 w-6 md:h-8 md:w-8" /></div>
              <div><h3 className="font-black text-lg md:text-xl mb-1 md:mb-2 uppercase tracking-tight">Authentic Travels</h3><p className="text-gray-500 text-xs md:text-sm leading-relaxed">Deep cultural immersion that respects local traditions and nature.</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
