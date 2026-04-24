import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, ShieldCheck, Link ,Award, Heart, ChevronLeft, ChevronRight, Quote, User, ArrowRight, Mail, Phone, Globe, ExternalLink, MessageSquare } from "lucide-react";
import { supabase } from "../lib/supabase";

const AboutUs = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [experts, setExperts] = useState([]);
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

  const fetchExperts = async () => {
    try {
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setExperts(data || []);
    } catch (error) {
      console.error("Error fetching experts:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
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
    fetchExperts();
    
    // Simple intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, experts]);

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

      // Send Email Notification
      await fetch("https://formsubmit.co/ajax/baltistantourismclub00@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          Subject: "New Guest Feedback from " + feedbackData.customerName,
          Customer: feedbackData.customerName,
          Location: feedbackData.location,
          Rating: feedbackData.rating + " Stars",
          Comment: feedbackData.comment,
          "_template": "table"
        })
      });
      
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
    <div className="bg-white min-h-screen overflow-x-hidden">
      <style>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal.animate-in { opacity: 1; transform: translateY(0); }
        .delay-100 { transition-delay: 0.1s; }
        .delay-200 { transition-delay: 0.2s; }
        .delay-300 { transition-delay: 0.3s; }
      `}</style>

      {/* About Hero */}
      <section className="relative py-16 md:py-32 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1589928335017-6644f8494f6c?q=80&w=2000')] bg-cover bg-center scale-105 animate-[zoomOut_20s_infinite]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-8xl font-black text-white mb-4 md:mb-6 uppercase italic tracking-tighter leading-tight animate-fadeInDown">
            Our <span className="text-blue-500">Journey</span>
          </h1>
          <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4 animate-fadeInUp delay-200">
            The pioneers of sustainable travel in Baltistan. Sharing the majesty of the Karakoram with the world since 2015.
          </p>
        </div>
      </section>

      {/* Side-by-Side Feedback Section */}
      <section className="py-12 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
            
            {/* Left Side: Feedback Form */}
            <div className="reveal bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl p-6 md:p-12 border border-blue-50 hover:shadow-blue-100 transition-all duration-500">
              <div className="mb-8 md:mb-10 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Tell Your Story</h2>
                <p className="text-gray-500 text-xs md:text-sm italic">"Your story inspires others to explore the north"</p>
              </div>

              {feedbackStatus === "success" ? (
                <div className="bg-green-50 text-green-700 p-6 md:p-8 rounded-2xl text-center font-bold animate-bounce text-sm md:text-base">
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
                        className={`flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl transition-all ${feedbackData.imageUrl === maleAvatar ? 'bg-blue-100 ring-2 ring-blue-600 scale-105 shadow-lg' : 'bg-gray-50 opacity-40 hover:opacity-100 hover:scale-105'}`}
                      >
                        <img src={maleAvatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-md" alt="Male" />
                        <span className="text-[10px] font-black uppercase text-blue-600">Male</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFeedbackData({...feedbackData, imageUrl: femaleAvatar})}
                        className={`flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl transition-all ${feedbackData.imageUrl === femaleAvatar ? 'bg-pink-100 ring-2 ring-pink-600 scale-105 shadow-lg' : 'bg-gray-50 opacity-40 hover:opacity-100 hover:scale-105'}`}
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
                        className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base transition-all"
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
                        className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base transition-all"
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
                          <button key={star} type="button" onClick={() => setFeedbackData({...feedbackData, rating: star})} className={`${feedbackData.rating >= star ? 'text-yellow-400' : 'text-gray-200'} transition-all hover:scale-125 active:scale-90`}>
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
                      className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 h-28 md:h-32 resize-none text-sm md:text-base transition-all"
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
            <div className="relative pt-4 px-2 md:px-0 reveal delay-200">
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
                    <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl border-l-8 border-blue-600 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 animate-fadeInRight">
                      <Quote className="absolute top-4 right-4 h-10 w-10 md:h-12 md:w-12 text-blue-50 opacity-20 group-hover:text-blue-100 transition-colors" />
                      <div className="flex items-center gap-4 mb-4 md:mb-6">
                        <img src={fb.image_url || maleAvatar} alt="" className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-blue-50 group-hover:ring-blue-500 transition-all" />
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

      {/* Detailed Experts Section */}
      <section id="experts" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="reveal text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 uppercase italic tracking-tighter">
              Meet Our <span className="text-blue-600">Local Experts</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              The heartbeat of our operations. Meet the dedicated professionals who make your Karakoram adventures safe and extraordinary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {experts.length > 0 ? (
              experts.map((expert, idx) => (
                <div key={expert.id} className={`reveal delay-${(idx % 3) * 100} bg-white rounded-[3rem] shadow-2xl overflow-hidden group hover:-translate-y-4 transition-all duration-700 border border-gray-100 flex flex-col`}>
                  {/* Image Container */}
                  <div className="h-[450px] overflow-hidden relative">
                    <img 
                      src={expert.image_url || "https://placehold.co/400x600?text=Expert"} 
                      alt={expert.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                      onError={(e) => { e.target.src = "https://placehold.co/400x600?text=Expert" }}
                    />
                    {/* Badge */}
                    <div className="absolute top-6 left-6 bg-blue-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg group-hover:bg-gray-900 transition-colors">
                      {expert.role}
                    </div>
                    {/* Hover Info - SHOW CONTACT DETAILS */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10 translate-y-8 group-hover:translate-y-0">
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-white/90 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-100">
                           <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md"><Mail size={18} /></div>
                           <span className="font-bold text-sm">{expert.contact || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-200">
                           <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md"><User size={18} /></div>
                           <span className="font-bold text-sm tracking-widest uppercase">Verified Expert</span>
                        </div>
                      </div>
                      <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-300">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-blue-500 hover:scale-110 transition-all cursor-pointer"><Globe size={20} /></div>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-blue-500 hover:scale-110 transition-all cursor-pointer"><ExternalLink size={20} /></div>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-blue-500 hover:scale-110 transition-all cursor-pointer"><MessageSquare size={20} /></div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-10 flex flex-col flex-grow bg-white group-hover:bg-blue-50/30 transition-colors duration-500">
                    <div className="mb-8">
                      <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic group-hover:text-blue-600 transition-colors">{expert.name}</h3>
                      <p className="text-blue-600 font-bold uppercase tracking-[0.3em] text-[10px]">Senior {expert.role} Specialist</p>
                    </div>
                    
                    <div className="space-y-4 pt-8 border-t border-gray-100 mt-auto">
                      {expert.contact && (
                        <a href={`mailto:${expert.contact}`} className="flex items-center gap-4 text-gray-600 hover:text-blue-600 transition-colors group/link">
                          <div className="p-3 bg-gray-50 rounded-2xl group-hover/link:bg-blue-100 transition-all group-hover/link:scale-110">
                            <Mail size={20} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-bold tracking-tight">{expert.contact}</span>
                        </a>
                      )}
                    </div>

                    <button className="w-full mt-10 bg-gray-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-blue-200 transition-all shadow-xl shadow-gray-200 active:scale-95">
                      Consult Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-400 italic bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 animate-pulse">
                Our team is currently on an expedition. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="reveal flex gap-4 md:gap-6 items-start p-8 rounded-[2rem] bg-white hover:bg-blue-50 transition-all duration-500 group shadow-lg hover:shadow-blue-100">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm flex-shrink-0 group-hover:rotate-12"><ShieldCheck className="h-8 md:h-10 md:w-10" /></div>
              <div><h3 className="font-black text-lg md:text-xl mb-2 uppercase tracking-tight">Safety Guaranteed</h3><p className="text-gray-500 text-xs md:text-sm leading-relaxed">We use top-tier equipment and expert local guides for every expedition.</p></div>
            </div>
            <div className="reveal delay-100 flex gap-4 md:gap-6 items-start p-8 rounded-[2rem] bg-white hover:bg-indigo-50 transition-all duration-500 group shadow-lg hover:shadow-indigo-100">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm flex-shrink-0 group-hover:rotate-12"><Award className="h-8 md:h-10 md:w-10" /></div>
              <div><h3 className="font-black text-lg md:text-xl mb-2 uppercase tracking-tight">Award Winning</h3><p className="text-gray-500 text-xs md:text-sm leading-relaxed">Recognized as the leading sustainable tour operator in Gilgit-Baltistan.</p></div>
            </div>
            <div className="reveal delay-200 flex gap-4 md:gap-6 items-start p-8 rounded-[2rem] bg-white hover:bg-teal-50 transition-all duration-500 group shadow-lg hover:shadow-teal-100">
              <div className="p-4 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm flex-shrink-0 group-hover:rotate-12"><Heart className="h-8 md:h-10 md:w-10" /></div>
              <div><h3 className="font-black text-lg md:text-xl mb-2 uppercase tracking-tight">Authentic Travels</h3><p className="text-gray-500 text-xs md:text-sm leading-relaxed">Deep cultural immersion that respects local traditions and nature.</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
