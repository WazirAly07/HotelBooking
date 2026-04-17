import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Camera, ArrowLeft, Loader2, ChevronRight, Image as ImageIcon, Calendar } from "lucide-react";
import { supabase } from "../lib/supabase";

const Memories = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLocations, setExpandedLocations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const { data: feedbackData, error } = await supabase
        .from("feedback")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by location
      const grouped = (feedbackData || []).reduce((acc, current) => {
        // FILTER: Only show photo memories shared via the memory form (requires registration/admin)
        // This excludes general feedback that uses external avatars (like xsgames.co)
        if (!current.image_url || !current.image_url.includes("supabase.co/storage")) return acc;

        const loc = current.location || "General";
        if (!acc[loc]) acc[loc] = { location: loc, images: [], people: {} };
        
        const urls = current.image_url.split(",").map(url => url.trim()).filter(url => url !== "");
        acc[loc].images.push(...urls);

        const personName = current.customer_name || "Anonymous";
        if (!acc[loc].people[personName]) {
          acc[loc].people[personName] = {
            name: personName,
            stories: []
          };
        }

        acc[loc].people[personName].stories.push({ 
          comment: current.comment,
          date: current.created_at,
          plan: current.plan,
          images: urls
        });

        return acc;
      }, {});

      setAlbums(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLocation = (loc) => {
    setExpandedLocations(prev => ({
      ...prev,
      [loc]: !prev[loc]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest">Loading Gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Camera className="h-6 w-6 text-blue-600" /> GUEST MEMORIES
          </h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {albums.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">No memories shared yet</h2>
            <p className="text-gray-500 mt-2">Be the first to share your journey from Baltistan!</p>
            <Link to="/" className="inline-block mt-6 bg-blue-600 text-white px-8 py-3 rounded-full font-bold">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-24">
            {albums.map((album, idx) => {
              return (
                <section key={idx} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                        {album.location}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-16">
                    {Object.values(album.people).map((person, pIdx) => (
                      <div key={pIdx} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Person Header */}
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-4">
                          <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-200">
                            {person.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900">{person.name}'s Journey</h3>
                            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">Contributor</p>
                          </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                          {person.stories.map((story, sIdx) => (
                            <div key={sIdx} className="grid grid-cols-1 md:grid-cols-2">
                              {/* Image Section */}
                              <div className="h-80 md:h-auto relative group overflow-hidden">
                                <img 
                                  src={story.images[0]} 
                                  alt={album.location} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                {story.images.length > 1 && (
                                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Camera size={12} /> +{story.images.length - 1} More Photos
                                  </div>
                                )}
                              </div>

                              {/* Content Section */}
                              <div className="p-8 md:p-12 flex flex-col justify-center">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                                  {new Date(story.date).toLocaleDateString()}
                                </p>
                                <p className="text-gray-600 text-lg italic leading-relaxed mb-8 relative">
                                  <span className="text-5xl text-blue-100 absolute -top-4 -left-6 font-serif">"</span>
                                  {story.comment}
                                </p>

                                {story.plan && story.plan.length > 0 && (
                                  <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <h4 className="flex items-center gap-2 text-sm font-black text-blue-600 uppercase tracking-widest">
                                      <Calendar className="h-4 w-4" /> Trip Timeline
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                      {story.plan.map((day, dIdx) => (
                                        <div key={dIdx} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl">
                                          <span className="text-blue-600 font-black text-sm whitespace-nowrap">Day {dIdx + 1}</span>
                                          <p className="text-sm text-gray-700 font-medium">{day}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Photo Grid for additional photos in this story */}
                                {story.images.length > 1 && (
                                  <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <Camera size={14} /> Gallery from this post
                                    </h4>
                                    <div className="grid grid-cols-4 gap-2">
                                      {story.images.map((img, iIdx) => (
                                        <div key={iIdx} className="aspect-square rounded-lg overflow-hidden">
                                          <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" alt="gallery" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <section className="bg-blue-900 py-16 mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-black mb-4">WANT TO SEE YOUR PHOTOS HERE?</h2>
          <p className="text-blue-200 mb-8 font-medium">Log in to your account and upload your favorite memories from your recent trip with us.</p>
          <Link to="/" className="bg-white text-blue-900 px-10 py-4 rounded-full font-black hover:scale-105 transition-transform inline-block">
            GO TO HOME & UPLOAD
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Memories;
