import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Camera, ArrowLeft, Loader2, Image as ImageIcon, Heart } from "lucide-react";
import { supabase } from "../lib/supabase";

const Memories = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImages, setActiveImages] = useState({});
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

      const grouped = (feedbackData || []).reduce((acc, current) => {
        if (!current.image_url || !current.image_url.includes("supabase.co/storage")) return acc;

        const loc = current.location || "General";
        if (!acc[loc]) acc[loc] = { location: loc, images: [] };
        
        const urls = current.image_url.split(",").map(url => url.trim()).filter(url => url !== "");
        acc[loc].images.push(...urls);

        return acc;
      }, {});

      setAlbums(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            <Camera className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Developing Film...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Dynamic Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 w-full">
        <div className="max-w-[1600px] mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-all">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline uppercase tracking-widest text-xs">Explore</span>
          </button>
          
          <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3 italic">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-xl not-italic shadow-lg shadow-blue-200">GUEST</span> 
            ALBUMS
          </h1>

          <Link to="/" className="bg-gray-900 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg">
            Upload
          </Link>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-12 space-y-24 md:space-y-32">
        {albums.length === 0 ? (
          <div className="text-center py-32 border-4 border-dashed border-gray-50 rounded-[40px]">
            <ImageIcon className="h-20 w-20 text-gray-200 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">No memories captured yet</h2>
            <p className="text-gray-400 font-bold mt-2">Start your journey and be the first to post!</p>
          </div>
        ) : (
          albums.map((album, idx) => {
            const activeIdx = activeImages[album.location];

            return (
              <section key={idx} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl group-hover:rotate-12 transition-transform">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-5xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                      {album.location}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{album.images.length} Captures</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-5 grid-flow-dense w-full max-w-full">
                  {album.images.map((img, imgIdx) => {
                    const isActive = activeIdx === imgIdx;
                    return (
                      <div 
                        key={imgIdx}
                        onClick={() => setActiveImages({ ...activeImages, [album.location]: isActive ? null : imgIdx })}
                        className={`relative cursor-pointer rounded-xl md:rounded-[2rem] overflow-hidden transition-all duration-700 group border-2 md:border-4 ${
                          isActive 
                          ? 'col-span-2 row-span-2 sm:col-span-3 sm:row-span-3 border-blue-600 shadow-2xl scale-[1.01] z-10' 
                          : 'aspect-square border-transparent hover:border-gray-200 active:scale-95'
                        }`}
                      >
                        <img 
                          src={img} 
                          className={`w-full h-full object-cover transition-transform duration-1000 ${isActive ? 'scale-100' : 'group-hover:scale-110'}`} 
                          alt={album.location} 
                        />
                        
                        {/* Interactive Overlays */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-black/10 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <div className="bg-white/90 p-2 md:p-3 rounded-xl md:rounded-2xl transform translate-y-2 md:translate-y-4 md:group-hover:translate-y-0 transition-transform">
                                <ImageIcon className="text-blue-600 h-4 w-4 md:h-5 md:w-5" />
                             </div>
                          </div>
                        )}

                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none p-4 md:p-10 flex items-end">
                            <div className="text-white animate-in slide-in-from-left-4">
                              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1 md:mb-2">Featured Capture</p>
                              <p className="text-lg md:text-3xl font-black italic tracking-tighter uppercase leading-none">{album.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Memories;
