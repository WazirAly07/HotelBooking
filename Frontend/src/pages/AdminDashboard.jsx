import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Upload, X, Loader2, Image as ImageIcon, Tag, Info, DollarSign, Layout, MapPin, Search, Plus, Clock, Calendar, CheckCircle, Menu } from "lucide-react";

// Google Maps API Loader Helper
const loadGoogleMapsAPI = (callback) => {
  const existingScript = document.getElementById("googleMaps");
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Google Maps API Key missing");
    return;
  }

  window.__googleMapsCallback__ = () => {
    if (callback) callback();
  };

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=__googleMapsCallback__`;
    script.id = "googleMaps";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  } else if (window.google && window.google.maps) {
    if (callback) callback();
  }
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [items, setItems] = useState([]); 
  const [editingItem, setEditingItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const [
        { count: toursCount },
        { count: hotelsCount },
        { count: bookingsCount },
        { count: inquiriesCount },
        { count: memoriesCount }
      ] = await Promise.all([
        supabase.from("tours").select("*", { count: "exact", head: true }),
        supabase.from("hotels").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("inquiries").select("*", { count: "exact", head: true }),
        supabase.from("feedback").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalTours: toursCount || 0,
        totalHotels: hotelsCount || 0,
        totalBookings: bookingsCount || 0,
        totalInquiries: inquiriesCount || 0,
        totalMemories: memoriesCount || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (!error) setBookings(data || []);
  };

  const fetchInquiries = async () => {
    const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (!error) setInquiries(data || []);
  };

  const fetchItems = async (table) => {
    try {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      if (error) {
        alert(`Error fetching ${table}: ` + error.message);
        return;
      }
      setItems(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/admin");
          return;
        }

        // Verify if the user is an admin
        const { data: adminRecord, error: adminError } = await supabase
          .from("admins")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!adminRecord || adminError) {
          await supabase.auth.signOut();
          navigate("/admin");
          return;
        }

        // Only after verifying admin status, fetch data
        await Promise.all([
          fetchStats(),
          fetchBookings(),
          fetchInquiries()
        ]);
      } catch (err) {
        console.error("Auth error:", err);
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (activeTab === "manageTours") fetchItems("tours");
      if (activeTab === "manageHotels") fetchItems("hotels");
      if (activeTab === "manageFeedback") fetchItems("feedback");
    }
  }, [activeTab, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-bold animate-pulse text-sm">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (table, id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) {
      alert("Deleted successfully");
      fetchItems(table);
      fetchStats();
    } else {
      alert("Error deleting item: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const startEdit = (item, type) => {
    setEditingItem({ ...item, formType: type });
    setActiveTab("editForm");
    setIsSidebarOpen(false);
  };

  const SidebarButton = ({ active, onClick, label }) => (
    <button 
      onClick={() => { onClick(); setIsSidebarOpen(false); }} 
      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${active ? "bg-blue-700 font-bold shadow-lg" : "hover:bg-blue-800 text-blue-100"}`}
    >
      {label}
    </button>
  );

  const StatCard = ({ title, value, color }) => (
    <div className={`${color} p-5 md:p-6 rounded-2xl text-white shadow-lg`}>
      <h3 className="text-sm md:text-lg font-medium opacity-80">{title}</h3>
      <p className="text-2xl md:text-3xl font-black">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h2 className="text-xl font-black text-blue-300 tracking-tighter italic">ADMIN PANEL</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-blue-800 rounded-lg">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-72 bg-blue-900 text-white p-6 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} overflow-y-auto`}>
        <h2 className="text-2xl font-black mb-8 text-blue-300 hidden md:block tracking-tighter italic">ADMIN PANEL</h2>
        <nav className="space-y-1 text-sm">
          <SidebarButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
          <SidebarButton active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")} label="Bookings" />
          <SidebarButton active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")} label="Inquiries" />
          
          <div className="pt-6 pb-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] ml-4">Post Content</div>
          <SidebarButton active={activeTab === "addTour"} onClick={() => setActiveTab("addTour")} label="Add Tour" />
          <SidebarButton active={activeTab === "addHotel"} onClick={() => setActiveTab("addHotel")} label="Add Hotel" />
          <SidebarButton active={activeTab === "addMemory"} onClick={() => setActiveTab("addMemory")} label="Add Memory" />
          
          <div className="pt-6 pb-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] ml-4">Management</div>
          <SidebarButton active={activeTab === "manageTours"} onClick={() => setActiveTab("manageTours")} label="Manage Tours" />
          <SidebarButton active={activeTab === "manageHotels"} onClick={() => setActiveTab("manageHotels")} label="Manage Hotels" />
          <SidebarButton active={activeTab === "manageFeedback"} onClick={() => setActiveTab("manageFeedback")} label="Manage Memories" />
          
          <hr className="my-8 border-blue-800" />
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-300 hover:bg-red-900/30 transition-colors font-bold flex items-center gap-2">
            <X size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 capitalize tracking-tighter italic">
            {activeTab.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
        </div>

        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            <StatCard title="Tours" value={stats.totalTours} color="bg-blue-600" />
            <StatCard title="Hotels" value={stats.totalHotels} color="bg-emerald-600" />
            <StatCard title="Bookings" value={stats.totalBookings} color="bg-violet-600" />
            <StatCard title="Inquiries" value={stats.totalInquiries} color="bg-amber-600" />
            <StatCard title="Memories" value={stats.totalMemories} color="bg-rose-600" />
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b, idx) => (
                    <tr key={b.id || idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-800">{b.customer_name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{b.customer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded uppercase tracking-tighter">{b.type}</span>
                        <div className="text-[10px] text-gray-400 mt-1">{b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {b.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(activeTab === "manageTours" || activeTab === "manageHotels" || activeTab === "manageFeedback") && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {activeTab === "manageFeedback" ? "Photo" : "Content"}
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.length === 0 ? (
                    <tr><td colSpan="2" className="px-6 py-12 text-center text-gray-500 italic font-bold">No records found.</td></tr>
                  ) : items.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                            <img 
                              src={item.image_url?.split(',')[0]} 
                              className="w-full h-full object-cover" 
                              alt="Thumbnail" 
                              onError={(e) => { e.target.src = "https://placehold.co/100x100?text=No+Img" }}
                            />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-sm font-black text-gray-800 truncate">{item.name || item.customer_name}</div>
                            <div className="text-[10px] uppercase text-blue-600 tracking-widest truncate">{item.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => startEdit(item, activeTab === "manageTours" ? "addTour" : activeTab === "manageHotels" ? "addHotel" : "addMemory")} 
                            className="bg-blue-50 text-blue-700 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit"
                          ><Plus size={16} className="rotate-45" /></button>
                          <button 
                            onClick={() => handleDelete(activeTab === "manageTours" ? "tours" : activeTab === "manageHotels" ? "hotels" : "feedback", item.id)} 
                            className="bg-red-50 text-red-700 p-2 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          ><X size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(activeTab === "addTour" || activeTab === "addHotel" || activeTab === "addMemory" || activeTab === "editForm") && (
          <div className="max-w-3xl bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter italic uppercase">
                {activeTab === "editForm" ? "Update Item" : `New ${activeTab.replace('add', '')}`}
              </h2>
              {activeTab === "editForm" && (
                <button onClick={() => { setEditingItem(null); setActiveTab("overview"); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              )}
            </div>
            <AdminForm 
              type={activeTab === "editForm" ? editingItem.formType : activeTab} 
              editData={editingItem}
              onSuccess={() => {
                setEditingItem(null);
                setActiveTab("overview");
                fetchStats();
              }} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

const AdminForm = ({ type, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    ...editData,
    plan: Array.isArray(editData?.plan) ? editData.plan : [],
    amenities: Array.isArray(editData?.amenities) ? editData.amenities : [],
    category: editData?.category || (type === "addTour" ? "By Road" : "Standard"),
    map_link: editData?.map_link || "",
    location_link: editData?.location_link || "",
    latitude: editData?.latitude || null,
    longitude: editData?.longitude || null,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  useEffect(() => {
    loadGoogleMapsAPI(() => {
      setMapsLoaded(true);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapsLoaded && mapRef.current && searchInputRef.current && type === "addHotel") {
        initMap();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [mapsLoaded, type, editData]);

  const initMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current || !searchInputRef.current || type !== "addHotel") return;

    try {
      const defaultPos = { 
        lat: parseFloat(formData.latitude) || 35.3012, 
        lng: parseFloat(formData.longitude) || 75.6331 
      };

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultPos,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      markerInstance.current = new window.google.maps.Marker({
        position: defaultPos,
        map: mapInstance.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      markerInstance.current.addListener("dragend", () => {
        const pos = markerInstance.current.getPosition();
        setFormData(prev => ({
          ...prev,
          latitude: pos.lat(),
          longitude: pos.lng(),
          location_link: `https://www.google.com/maps/search/?api=1&query=${pos.lat()},${pos.lng()}`
        }));
      });

      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
      autocomplete.bindTo("bounds", mapInstance.current);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        mapInstance.current.setCenter(place.geometry.location);
        mapInstance.current.setZoom(17);
        markerInstance.current.setPosition(place.geometry.location);

        setFormData(prev => ({
          ...prev,
          location: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          location_link: place.url || `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}`
        }));
      });
    } catch (err) {
      console.error("Map error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const uploadedUrls = [];
    const bucket = type === "addMemory" ? "memories" : "photos";
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${type}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }
      const existingUrls = formData.image_url ? formData.image_url.split(",").filter(i => i !== "") : [];
      setFormData({ ...formData, image_url: [...existingUrls, ...uploadedUrls].join(",") });
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImageUrl = (urlToRemove) => {
    const urls = formData.image_url.split(",").filter(url => url !== urlToRemove);
    setFormData({ ...formData, image_url: urls.join(",") });
  };

  const handlePlanChange = (index, value) => {
    const newPlan = [...(formData.plan || [])];
    newPlan[index] = value;
    setFormData({ ...formData, plan: newPlan });
  };

  const addDay = () => setFormData({ ...formData, plan: [...(formData.plan || []), ""] });
  const removeDay = (index) => setFormData({ ...formData, plan: formData.plan.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let table = type === "addTour" ? "tours" : type === "addHotel" ? "hotels" : "feedback";
    const submissionData = { ...formData };
    delete submissionData.formType;
    if (!editData?.id) delete submissionData.id;

    let finalData = {};
    if (type === "addTour") {
      const { name, description, price, location, image_url, duration, plan, category, map_link, location_link, latitude, longitude } = submissionData;
      finalData = { name, description, price, location, image_url, duration, plan, category, map_link, location_link, latitude, longitude };
    } else if (type === "addHotel") {
      const { name, description, price_per_night, location, image_url, amenities, category, map_link, location_link, latitude, longitude } = submissionData;
      let formattedAmenities = typeof amenities === "string" ? amenities.split(",").map(i => i.trim()).filter(i => i !== "") : amenities;
      finalData = { name, description, price_per_night, location, image_url, amenities: formattedAmenities, category, map_link, location_link, latitude, longitude };
    } else if (type === "addMemory") {
      const { customer_name, comment, location, image_url } = submissionData;
      finalData = { customer_name, comment, location, image_url, rating: 5 };
    }
    
    try {
      let error;
      if (editData?.id) ({ error } = await supabase.from(table).update(finalData).eq("id", editData.id));
      else ({ error } = await supabase.from(table).insert([finalData]));
      if (!error) {
        alert("Success!");
        onSuccess();
      } else alert(error.message);
    } catch (err) {
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  if (type === "addMemory") {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4 border border-gray-100">
          <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Tag size={16} className="text-blue-600" /> Name</label><input name="customer_name" value={formData.customer_name || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl text-sm" /></div>
          <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Info size={16} className="text-blue-600" /> Comment</label><textarea name="comment" value={formData.comment || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl h-24 text-sm" /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-2">Location</label><input name="location" value={formData.location || ""} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl text-sm" /></div>
        </div>
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100">
          <label className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><ImageIcon size={16} className="text-blue-600" /> Photos</label>
          <div className="border-2 border-dashed border-blue-200 p-6 md:p-8 text-center rounded-2xl"><input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="memory-up" /><label htmlFor="memory-up" className="cursor-pointer font-bold text-blue-600">Upload Images</label></div>
          {formData.image_url && <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">{formData.image_url.split(",").map((url, idx) => (<div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-lg"><img src={url} className="w-full h-full object-cover" /><button type="button" onClick={() => removeImageUrl(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10} /></button></div>))}</div>}
        </div>
        <button disabled={loading || uploading} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-transform">{loading ? "Saving..." : "Publish"}</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4 border border-gray-100">
        <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Tag size={16} className="text-blue-600" /> Name</label><input name="name" value={formData.name || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl text-sm" /></div>
        <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Info size={16} className="text-blue-600" /> Description</label><textarea name="description" value={formData.description || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl h-32 text-sm" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-bold text-gray-700 mb-2">Price</label><input type="number" name={type === "addTour" ? "price" : "price_per_night"} value={formData[type === "addTour" ? "price" : "price_per_night"] || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl text-sm" /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-2">Travel Mode</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl text-sm"><option value="By Road">By Road</option><option value="By Air">By Air</option></select></div>
        </div>
        {type === "addHotel" ? (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-blue-600" /> Hotel Location (Map Search)</label>
            <div className="relative mb-3"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input ref={searchInputRef} type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-sm" defaultValue={formData.location || ""} /></div>
            <div ref={mapRef} className="w-full h-48 md:h-72 rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden" />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] text-gray-400 uppercase">Lat</label><input readOnly value={formData.latitude || ""} className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg text-xs" /></div>
              <div><label className="text-[10px] text-gray-400 uppercase">Lng</label><input readOnly value={formData.longitude || ""} className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg text-xs" /></div>
            </div>
          </div>
        ) : (
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-blue-600" /> Tour Location</label>
            <input name="location" value={formData.location || ""} onChange={handleChange} required placeholder="e.g. Hunza Valley" className="w-full p-4 border border-gray-200 rounded-xl text-sm" />
          </div>
        )}
      </div>

      {type === "addTour" && (
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4 border border-gray-100">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Clock size={16} className="text-blue-600" /> Tour Duration
            </label>
            <input 
              name="duration" 
              value={formData.duration || ""} 
              onChange={handleChange} 
              required 
              placeholder="e.g. 5 Days / 4 Nights" 
              className="w-full p-4 border border-gray-200 rounded-xl text-sm" 
            />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="text-blue-600" /> Tour Itinerary
            </label>
            <div className="space-y-4">
              {formData.plan && formData.plan.map((day, idx) => (
                <div key={idx} className="flex gap-2 md:gap-3 items-start">
                  <div className="bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded-lg text-[10px] md:text-xs mt-2 whitespace-nowrap">
                    D{idx + 1}
                  </div>
                  <div className="flex-grow relative">
                    <textarea
                      value={day}
                      onChange={(e) => handlePlanChange(idx, e.target.value)}
                      placeholder={`Describe Day ${idx + 1}...`}
                      className="w-full p-4 border border-gray-200 rounded-xl h-24 text-sm"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => removeDay(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDay}
              className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-xs uppercase tracking-widest"
            >
              <Plus size={16} /> Add Day { (formData.plan?.length || 0) + 1 }
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100">
        <label className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><ImageIcon size={16} className="text-blue-600" /> Photos</label>
        <div className="border-2 border-dashed border-blue-200 p-6 md:p-8 text-center rounded-2xl hover:bg-blue-50 transition-colors"><input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="item-up" /><label htmlFor="item-up" className="cursor-pointer font-bold text-blue-600">Select Photos</label></div>
        {formData.image_url && <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-6">{formData.image_url.split(",").map((url, idx) => (<div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-lg"><img src={url} className="w-full h-full object-cover" /><button type="button" onClick={() => removeImageUrl(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10} /></button></div>))}</div>}
      </div>
      <button disabled={loading || uploading} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg md:text-xl shadow-2xl shadow-blue-600/20 active:scale-[0.98] transition-transform">{loading ? "Saving..." : "Save Package"}</button>
    </form>
  );
};

export default AdminDashboard;
