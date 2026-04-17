import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Upload, X, Loader2, Image as ImageIcon, Tag, Info, DollarSign, Layout, MapPin, Search, Plus, Clock, Calendar } from "lucide-react";

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
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [items, setItems] = useState([]); 
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
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
        // If not an admin, sign them out and redirect
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }

      fetchStats();
      fetchBookings();
      fetchInquiries();
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === "manageTours") fetchItems("tours");
    if (activeTab === "manageHotels") fetchItems("hotels");
    if (activeTab === "manageFeedback") fetchItems("feedback");
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [
        { count: toursCount },
        { count: hotelsCount },
        { count: bookingsCount },
        { count: inquiriesCount }
      ] = await Promise.all([
        supabase.from("tours").select("*", { count: "exact", head: true }),
        supabase.from("hotels").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("inquiries").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalTours: toursCount || 0,
        totalHotels: hotelsCount || 0,
        totalBookings: bookingsCount || 0,
        totalInquiries: inquiriesCount || 0
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
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (!error) setItems(data || []);
  };

  const handleDelete = async (table, id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) {
      alert("Deleted successfully");
      fetchItems(table);
      fetchStats();
    } else {
      alert("Error deleting item");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const startEdit = (item, type) => {
    setEditingItem({ ...item, formType: type });
    setActiveTab("editForm");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-blue-900 text-white p-6 hidden md:block overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8 text-blue-300">Admin Panel</h2>
        <nav className="space-y-2 text-sm">
          <SidebarButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
          <SidebarButton active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")} label="Bookings" />
          <SidebarButton active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")} label="Inquiries" />
          <div className="pt-4 pb-2 text-xs font-bold uppercase text-blue-400">Post New</div>
          <SidebarButton active={activeTab === "addTour"} onClick={() => setActiveTab("addTour")} label="Add Tour" />
          <SidebarButton active={activeTab === "addHotel"} onClick={() => setActiveTab("addHotel")} label="Add Hotel" />
          <SidebarButton active={activeTab === "addMemory"} onClick={() => setActiveTab("addMemory")} label="Add Memory" />
          <div className="pt-4 pb-2 text-xs font-bold uppercase text-blue-400">Management</div>
          <SidebarButton active={activeTab === "manageTours"} onClick={() => setActiveTab("manageTours")} label="Manage Tours" />
          <SidebarButton active={activeTab === "manageHotels"} onClick={() => setActiveTab("manageHotels")} label="Manage Hotels" />
          <SidebarButton active={activeTab === "manageFeedback"} onClick={() => setActiveTab("manageFeedback")} label="Manage Memories" />
          <hr className="my-6 border-blue-800" />
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded text-red-300 hover:bg-red-900/30 transition-colors">Logout</button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 capitalize">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h1>
          <div className="md:hidden"><button onClick={handleLogout} className="text-red-600 font-semibold">Logout</button></div>
        </div>

        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Tours" value={stats.totalTours} color="bg-blue-500" />
            <StatCard title="Total Hotels" value={stats.totalHotels} color="bg-green-500" />
            <StatCard title="Bookings" value={stats.totalBookings} color="bg-purple-500" />
            <StatCard title="Inquiries" value={stats.totalInquiries} color="bg-orange-500" />
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 border-b text-sm font-semibold text-gray-600">Customer</th>
                  <th className="px-6 py-3 border-b text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-3 border-b text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-3 border-b text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-3 border-b text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, idx) => (
                  <tr key={b.id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b text-sm">{b.customer_name}</td>
                    <td className="px-6 py-4 border-b text-sm">{b.customer_email}</td>
                    <td className="px-6 py-4 border-b uppercase text-[10px] font-bold tracking-wider">{b.type}</td>
                    <td className="px-6 py-4 border-b text-sm">{b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${b.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {b.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(activeTab === "manageTours" || activeTab === "manageHotels" || activeTab === "manageFeedback") && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 border-b text-sm font-semibold text-gray-600">Name/Customer</th>
                  <th className="px-6 py-3 border-b text-sm font-semibold text-gray-600">Info</th>
                  <th className="px-6 py-3 border-b text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b text-sm font-medium">{item.name || item.customer_name}</td>
                    <td className="px-6 py-4 border-b text-sm text-gray-500 max-w-xs truncate">{item.location || item.comment}</td>
                    <td className="px-6 py-4 border-b text-right space-x-2">
                      {activeTab !== "manageFeedback" && (
                        <button onClick={() => startEdit(item, activeTab === "manageTours" ? "addTour" : "addHotel")} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                      )}
                      <button onClick={() => handleDelete(activeTab === "manageTours" ? "tours" : activeTab === "manageHotels" ? "hotels" : "feedback", item.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(activeTab === "addTour" || activeTab === "addHotel" || activeTab === "addMemory" || activeTab === "editForm") && (
          <div className="max-w-2xl bg-white p-8 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{activeTab === "editForm" ? "Update Item" : `Create New ${activeTab === "addTour" ? "Tour" : activeTab === "addHotel" ? "Hotel" : "Memory"}`}</h2>
              {activeTab === "editForm" && (
                <button onClick={() => { setEditingItem(null); setActiveTab("overview"); }} className="text-gray-500 hover:text-gray-700">Cancel</button>
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

const SidebarButton = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-2 rounded transition-colors ${active ? "bg-blue-700 font-semibold" : "hover:bg-blue-800 text-blue-100"}`}>{label}</button>
);

const StatCard = ({ title, value, color }) => (
  <div className={`${color} p-6 rounded-xl text-white shadow-lg`}>
    <h3 className="text-lg font-medium opacity-80">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const AdminForm = ({ type, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    ...editData,
    plan: Array.isArray(editData?.plan) ? editData.plan : [],
    amenities: Array.isArray(editData?.amenities) ? editData.amenities : [],
    category: editData?.category || "Standard",
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
  const autocompleteInstance = useRef(null);

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
    return () => {
      clearTimeout(timer);
      if (autocompleteInstance.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance.current);
      }
    };
  }, [mapsLoaded, type, editData]);

  const initMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current || !searchInputRef.current || type !== "addHotel") return;

    try {
      const defaultPos = { 
        lat: parseFloat(formData.latitude) || 35.3012, 
        lng: parseFloat(formData.longitude) || 75.6331 
      };

      // Ensure we don't re-initialize on the same element if not needed
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

      autocompleteInstance.current = new window.google.maps.places.Autocomplete(searchInputRef.current);
      autocompleteInstance.current.bindTo("bounds", mapInstance.current);

      autocompleteInstance.current.addListener("place_changed", () => {
        const place = autocompleteInstance.current.getPlace();
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

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        plan: Array.isArray(editData.plan) ? editData.plan : [],
        amenities: Array.isArray(editData.amenities) ? editData.amenities : [],
        category: editData.category || "Standard",
        map_link: editData.map_link || "",
        location_link: editData.location_link || "",
        latitude: editData.latitude || null,
        longitude: editData.longitude || null,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const uploadedUrls = [];
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${type}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
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
      const { customer_name, comment, location, image_url, plan } = submissionData;
      finalData = { customer_name, comment, location, image_url, plan };
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
        <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
          <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Tag size={16} className="text-blue-600" /> Name</label><input name="customer_name" value={formData.customer_name || ""} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl" /></div>
          <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Info size={16} className="text-blue-600" /> Comment</label><textarea name="comment" value={formData.comment || ""} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl h-24" /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-2">Location</label><input name="location" value={formData.location || ""} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl" /></div>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <label className="text-sm font-bold text-gray-700 mb-4">Photos</label>
          <div className="border-2 border-dashed border-blue-200 p-8 text-center rounded-2xl"><input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="memory-up" /><label htmlFor="memory-up" className="cursor-pointer">Upload</label></div>
          {formData.image_url && <div className="grid grid-cols-4 gap-3 mt-6">{formData.image_url.split(",").map((url, idx) => (<div key={idx} className="relative aspect-square rounded-xl overflow-hidden group"><img src={url} className="w-full h-full object-cover" /><button type="button" onClick={() => removeImageUrl(url)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">X</button></div>))}</div>}
        </div>
        <button disabled={loading || uploading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black">{loading ? "Saving..." : "Publish"}</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
        <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Tag size={16} className="text-blue-600" /> Name</label><input name="name" value={formData.name || ""} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl" /></div>
        <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Info size={16} className="text-blue-600" /> Description</label><textarea name="description" value={formData.description || ""} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl h-32" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-bold text-gray-700 mb-2">Price</label><input type="number" name={type === "addTour" ? "price" : "price_per_night"} value={formData[type === "addTour" ? "price" : "price_per_night"] || ""} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl" /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-2">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl"><option value="Premium">Premium</option><option value="Standard">Standard</option><option value="Average">Average</option></select></div>
        </div>
        {type === "addHotel" ? (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-blue-600" /> Hotel Location (Map Search)</label>
            <div className="relative mb-3"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input ref={searchInputRef} type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl" defaultValue={formData.location || ""} /></div>
            <div ref={mapRef} className="w-full h-72 rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden" />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] text-gray-400 uppercase">Latitude</label><input readOnly value={formData.latitude || ""} className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg text-xs" /></div>
              <div><label className="text-[10px] text-gray-400 uppercase">Longitude</label><input readOnly value={formData.longitude || ""} className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg text-xs" /></div>
            </div>
          </div>
        ) : (
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-blue-600" /> Tour Location</label>
            <input name="location" value={formData.location || ""} onChange={handleChange} required placeholder="e.g. Hunza Valley" className="w-full p-3 border border-gray-200 rounded-xl" />
          </div>
        )}
      </div>

      {type === "addTour" && (
        <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
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
              className="w-full p-3 border border-gray-200 rounded-xl" 
            />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="text-blue-600" /> Tour Itinerary
            </label>
            <div className="space-y-3">
              {formData.plan && formData.plan.map((day, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded-lg text-xs mt-2 whitespace-nowrap">
                    Day {idx + 1}
                  </div>
                  <div className="flex-grow relative">
                    <textarea
                      value={day}
                      onChange={(e) => handlePlanChange(idx, e.target.value)}
                      placeholder={`Describe Day ${idx + 1}...`}
                      className="w-full p-3 border border-gray-200 rounded-xl h-24 text-sm"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => removeDay(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
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
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              <Plus size={16} /> Add Day { (formData.plan?.length || 0) + 1 }
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <label className="text-sm font-bold text-gray-700 mb-4">Photos</label>
        <div className="border-2 border-dashed border-blue-200 p-8 text-center rounded-2xl hover:bg-blue-50 transition-colors"><input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="item-up" /><label htmlFor="item-up" className="cursor-pointer">Select Photos</label></div>
        {formData.image_url && <div className="grid grid-cols-5 gap-3 mt-6">{formData.image_url.split(",").map((url, idx) => (<div key={idx} className="relative aspect-square rounded-xl overflow-hidden group"><img src={url} className="w-full h-full object-cover" /><button type="button" onClick={() => removeImageUrl(url)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">X</button></div>))}</div>}
      </div>
      <button disabled={loading || uploading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg">{loading ? "Saving..." : "Save Package"}</button>
    </form>
  );
};

export default AdminDashboard;
