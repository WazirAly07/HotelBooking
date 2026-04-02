import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, ShieldCheck, Award, Heart, ChevronLeft, ChevronRight, Quote, User } from "lucide-react";

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
      const res = await axios.get("http://localhost:5000/api/feedback");
      setFeedbacks(res.data);
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
      await axios.post("http://localhost:5000/api/feedback", feedbackData);
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
      <section className="relative py-24 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1589928335017-6644f8494f6c?q=80&w=2000')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter">
            Our <span className="text-blue-500">Journey</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The pioneers of sustainable travel in Baltistan. Sharing the majesty of the Karakoram with the world since 2015.
          </p>
        </div>
      </section>

      {/* Side-by-Side Feedback Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Side: Feedback Form */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-blue-50">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Tell Your Story</h2>
                <p className="text-gray-500 text-sm italic">"Your story inspires others to explore the north"</p>
              </div>

              {feedbackStatus === "success" ? (
                <div className="bg-green-50 text-green-700 p-8 rounded-2xl text-center font-bold animate-pulse">
                  Thank you! Your review is now live on our wall.
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  {/* Avatar Selection */}
                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Select Your Avatar</p>
                    <div className="flex gap-6">
                      <button 
                        type="button"
                        onClick={() => setFeedbackData({...feedbackData, imageUrl: maleAvatar})}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${feedbackData.imageUrl === maleAvatar ? 'bg-blue-100 ring-2 ring-blue-600 scale-105' : 'bg-gray-50 opacity-40 hover:opacity-100'}`}
                      >
                        <img src={maleAvatar} className="w-16 h-16 rounded-full shadow-md" alt="Male" />
                        <span className="text-[10px] font-black uppercase text-blue-600">Male</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFeedbackData({...feedbackData, imageUrl: femaleAvatar})}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${feedbackData.imageUrl === femaleAvatar ? 'bg-pink-100 ring-2 ring-pink-600 scale-105' : 'bg-gray-50 opacity-40 hover:opacity-100'}`}
                      >
                        <img src={femaleAvatar} className="w-16 h-16 rounded-full shadow-md" alt="Female" />
                        <span className="text-[10px] font-black uppercase text-pink-600">Female</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. John Doe" 
                        className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500"
                        value={feedbackData.customerName}
                        onChange={(e) => setFeedbackData({...feedbackData, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Location</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Karachi, PK" 
                        className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500"
                        value={feedbackData.location}
                        onChange={(e) => setFeedbackData({...feedbackData, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Experience Rating</label>
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setFeedbackData({...feedbackData, rating: star})} className={`${feedbackData.rating >= star ? 'text-yellow-400' : 'text-gray-200'} transition-colors`}>
                            <Star className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                      </div>
                      <span className="text-blue-600 font-black text-sm">{feedbackData.rating}.0 / 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Your Story</label>
                    <textarea 
                      required
                      placeholder="What was the best part of your trip?" 
                      className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                      value={feedbackData.comment}
                      onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full p-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    Post to Guest Wall
                  </button>
                </form>
              )}
            </div>

            {/* Right Side: Feedback Slider */}
            <div className="relative pt-4">
              <div className="mb-12 flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Guest <span className="text-blue-600 underline decoration-4 underline-offset-8">Wall</span></h2>
                  <p className="text-gray-500">Real stories from real travelers</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={prevFeedback} className="p-3 rounded-full bg-white shadow-md hover:bg-blue-600 hover:text-white transition-all">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={nextFeedback} className="p-3 rounded-full bg-white shadow-md hover:bg-blue-600 hover:text-white transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 min-h-[400px]">
                {feedbacks.length > 0 ? (
                  displayFeedbacks.map((fb, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-l-8 border-blue-600 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                      <Quote className="absolute top-4 right-4 h-12 w-12 text-blue-50 opacity-20 group-hover:text-blue-100 transition-colors" />
                      <div className="flex items-center gap-4 mb-6">
                        <img src={fb.imageUrl || maleAvatar} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-50" />
                        <div>
                          <h4 className="font-bold text-gray-900">{fb.customerName}</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-blue-600 font-bold uppercase">{fb.location}</p>
                            <span className="text-gray-200">|</span>
                            <div className="flex text-yellow-400"><Star className="h-3 w-3 fill-current" /> <span className="text-xs ml-1 font-bold">{fb.rating}.0</span></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 italic leading-relaxed">"{fb.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-400 italic bg-white rounded-3xl border border-dashed border-gray-200">No reviews yet. Be the first to share!</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-blue-50 transition-colors group">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><ShieldCheck className="h-8 w-8" /></div>
              <div><h3 className="font-bold text-xl mb-2">Safety Guaranteed</h3><p className="text-gray-500 text-sm">We use top-tier equipment and expert local guides for every expedition.</p></div>
            </div>
            <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-indigo-50 transition-colors group">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><Award className="h-8 w-8" /></div>
              <div><h3 className="font-bold text-xl mb-2">Award Winning</h3><p className="text-gray-500 text-sm">Recognized as the leading sustainable tour operator in Gilgit-Baltistan.</p></div>
            </div>
            <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-teal-50 transition-colors group">
              <div className="p-4 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm"><Heart className="h-8 w-8" /></div>
              <div><h3 className="font-bold text-xl mb-2">Authentic Experiences</h3><p className="text-gray-500 text-sm">Deep cultural immersion that respects local traditions and nature.</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
