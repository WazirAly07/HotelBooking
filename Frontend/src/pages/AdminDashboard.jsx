import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Upload, X, Loader2, Image as ImageIcon, Tag, Info, DollarSign, Layout, MapPin, Search, Plus, Clock, Calendar, CheckCircle, Menu, Plane, FileText } from "lucide-react";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [tripPlans, setTripPlans] = useState([]);
  const [items, setItems] = useState([]); 
  const [editingItem, setEditingItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingPlan, setViewingPlan] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const [
        { count: toursCount },
        { count: hotelsCount },
        { count: bookingsCount },
        { count: inquiriesCount },
        { count: memoriesCount },
        { count: expertsCount },
        { count: plansCount }
      ] = await Promise.all([
        supabase.from("tours").select("*", { count: "exact", head: true }),
        supabase.from("hotels").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("inquiries").select("*", { count: "exact", head: true }),
        supabase.from("feedback").select("*", { count: "exact", head: true }),
        supabase.from("experts").select("*", { count: "exact", head: true }),
        supabase.from("trip_plans").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalTours: toursCount || 0,
        totalHotels: hotelsCount || 0,
        totalBookings: bookingsCount || 0,
        totalInquiries: inquiriesCount || 0,
        totalMemories: memoriesCount || 0,
        totalExperts: expertsCount || 0,
        totalPlans: plansCount || 0
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

  const fetchTripPlans = async () => {
    const { data, error } = await supabase.from("trip_plans").select("*").order("created_at", { ascending: false });
    if (!error) setTripPlans(data || []);
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

        await Promise.all([
          fetchStats(),
          fetchBookings(),
          fetchInquiries(),
          fetchTripPlans()
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
      if (activeTab === "manageExperts") fetchItems("experts");
      if (activeTab === "tripPlans") fetchTripPlans();
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
      if (table === "trip_plans") fetchTripPlans();
      else fetchItems(table);
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

  const SidebarButton = ({ active, onClick, label, icon: Icon }) => (
    <button 
      onClick={() => { onClick(); setIsSidebarOpen(false); }} 
      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${active ? "bg-blue-700 font-bold shadow-lg" : "hover:bg-blue-800 text-blue-100"}`}
    >
      {Icon && <Icon size={18} />}
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
      <div className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h2 className="text-xl font-black text-blue-300 tracking-tighter italic">ADMIN PANEL</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-blue-800 rounded-lg">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-72 bg-blue-900 text-white p-6 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} overflow-y-auto`}>
        <h2 className="text-2xl font-black mb-8 text-blue-300 hidden md:block tracking-tighter italic">ADMIN PANEL</h2>
        <nav className="space-y-1 text-sm">
          <SidebarButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" icon={Layout} />
          <SidebarButton active={activeTab === "tripPlans"} onClick={() => setActiveTab("tripPlans")} label="Trip Plans" icon={Plane} />
          <SidebarButton active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")} label="Bookings" icon={CheckCircle} />
          <SidebarButton active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")} label="Inquiries" icon={Info} />
          
          <div className="pt-6 pb-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] ml-4">Post Content</div>
          <SidebarButton active={activeTab === "addTour"} onClick={() => setActiveTab("addTour")} label="Add Tour" icon={Plus} />
          <SidebarButton active={activeTab === "addHotel"} onClick={() => setActiveTab("addHotel")} label="Add Hotel" icon={Plus} />
          <SidebarButton active={activeTab === "addMemory"} onClick={() => setActiveTab("addMemory")} label="Add Memory" icon={Plus} />
          <SidebarButton active={activeTab === "addExpert"} onClick={() => setActiveTab("addExpert")} label="Add Expert" icon={Plus} />
          
          <div className="pt-6 pb-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] ml-4">Management</div>
          <SidebarButton active={activeTab === "manageTours"} onClick={() => setActiveTab("manageTours")} label="Manage Tours" icon={Search} />
          <SidebarButton active={activeTab === "manageHotels"} onClick={() => setActiveTab("manageHotels")} label="Manage Hotels" icon={Search} />
          <SidebarButton active={activeTab === "manageFeedback"} onClick={() => setActiveTab("manageFeedback")} label="Manage Memories" icon={Search} />
          <SidebarButton active={activeTab === "manageExperts"} onClick={() => setActiveTab("manageExperts")} label="Manage Experts" icon={Search} />
          
          <hr className="my-8 border-blue-800" />
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-300 hover:bg-red-900/30 transition-colors font-bold flex items-center gap-2">
            <X size={18} /> Logout
          </button>
        </nav>
      </aside>

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />
      )}

      <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 capitalize tracking-tighter italic">
            {activeTab.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
        </div>

        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 md:gap-6">
            <StatCard title="Plans" value={stats.totalPlans} color="bg-orange-600" />
            <StatCard title="Tours" value={stats.totalTours} color="bg-blue-600" />
            <StatCard title="Hotels" value={stats.totalHotels} color="bg-emerald-600" />
            <StatCard title="Bookings" value={stats.totalBookings} color="bg-violet-600" />
            <StatCard title="Inquiries" value={stats.totalInquiries} color="bg-amber-600" />
            <StatCard title="Memories" value={stats.totalMemories} color="bg-rose-600" />
            <StatCard title="Experts" value={stats.totalExperts} color="bg-indigo-600" />
          </div>
        )}

        {activeTab === "tripPlans" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Destination</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Travelers</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tripPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-800">{plan.customer_name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{plan.phone_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-800">{plan.destination || "Not set"}</div>
                        <div className="text-[10px] text-gray-400">{plan.travel_date || "Any date"}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded uppercase">{plan.travelers_count} People</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setViewingPlan(plan)} className="bg-orange-50 text-orange-700 p-2 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                             <FileText size={14} /> View Details
                           </button>
                           <button onClick={() => handleDelete("trip_plans", plan.id)} className="bg-red-50 text-red-700 p-2 rounded-lg hover:bg-red-100 transition-colors">
                             <X size={14} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewingPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingPlan(null)}></div>
             <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-y-auto relative z-10 shadow-2xl p-8 md:p-12">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                   <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Trip Plan <span className="text-orange-600">Details</span></h2>
                   <button onClick={() => setViewingPlan(null)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Customer Name</p>
                      <p className="font-bold text-gray-900">{viewingPlan.customer_name}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Phone Number</p>
                      <p className="font-bold text-gray-900">{viewingPlan.phone_number}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email Address</p>
                      <p className="font-bold text-gray-900">{viewingPlan.customer_email || "Not provided"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Destination</p>
                      <p className="font-bold text-gray-900">{viewingPlan.destination || "Undecided"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Travel Date</p>
                      <p className="font-bold text-gray-900">{viewingPlan.travel_date || "Flexible"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No. of Travelers</p>
                      <p className="font-bold text-gray-900">{viewingPlan.travelers_count} People ({viewingPlan.group_type || 'N/A'})</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Duration</p>
                      <p className="font-bold text-gray-900">{viewingPlan.duration || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Travel Mode</p>
                      <p className="font-bold text-gray-900">{viewingPlan.travel_category || "N/A"}</p>
                   </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">All Requirements & Itinerary</p>
                   <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingPlan.requirements}</p>
                </div>
             </div>
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

        {(activeTab === "manageTours" || activeTab === "manageHotels" || activeTab === "manageFeedback" || activeTab === "manageExperts") && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {activeTab === "manageFeedback" ? "Photo" : activeTab === "manageExperts" ? "Expert" : "Content"}
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
                            <div className="text-[10px] uppercase text-blue-600 tracking-widest truncate">{item.location || item.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => startEdit(item, activeTab === "manageTours" ? "addTour" : activeTab === "manageHotels" ? "addHotel" : activeTab === "manageFeedback" ? "addMemory" : "addExpert")} 
                            className="bg-blue-50 text-blue-700 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit"
                          ><Plus size={16} className="rotate-45" /></button>
                          <button 
                            onClick={() => handleDelete(activeTab === "manageTours" ? "tours" : activeTab === "manageHotels" ? "hotels" : activeTab === "manageFeedback" ? "feedback" : "experts", item.id)} 
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

        {(activeTab === "addTour" || activeTab === "addHotel" || activeTab === "addMemory" || activeTab === "addExpert" || activeTab === "editForm") && (
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
    location: editData?.location || "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    let table = type === "addTour" ? "tours" : type === "addHotel" ? "hotels" : type === "addExpert" ? "experts" : "feedback";
    const submissionData = { ...formData };
    delete submissionData.formType;
    if (!editData?.id) delete submissionData.id;

    let finalData = {};
    if (type === "addTour") {
      const { name, description, price, location, image_url, duration, plan, category } = submissionData;
      finalData = { name, description, price, location, image_url, duration, plan, category };
    } else if (type === "addHotel") {
      const { name, description, price_per_night, location, image_url, amenities, category } = submissionData;
      let formattedAmenities = typeof amenities === "string" ? amenities.split(",").map(i => i.trim()).filter(i => i !== "") : amenities;
      finalData = { name, description, price_per_night, location, image_url, amenities: formattedAmenities, category };
    } else if (type === "addMemory") {
      const { customer_name, comment, location, image_url } = submissionData;
      finalData = { customer_name, comment, location, image_url, rating: 5 };
    } else if (type === "addExpert") {
      const { name, role, image_url, contact } = submissionData;
      finalData = { name, role, image_url, contact };
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
          {formData.image_url && <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">{formData.image_url.split(",").map((url, idx) => (<div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-lg"><img src={url} className="w-full h-full object-cover" alt="Memory"/><button type="button" onClick={() => removeImageUrl(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10} /></button></div>))}</div>}
        </div>
        <button disabled={loading || uploading} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-transform">{loading ? "Saving..." : "Publish"}</button>
      </form>
    );
  }

  if (type === "addExpert") {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4 border border-gray-100">
          <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Tag size={16} className="text-blue-600" /> Full Name</label><input name="name" value={formData.name || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl text-sm" /></div>
          <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Layout size={16} className="text-blue-600" /> Role</label><select name="role" value={formData.role || "Guide"} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl text-sm"><option value="CEO">CEO</option><option value="Manager">Manager</option><option value="Guide">Guide</option><option value="Support">Support</option></select></div>
          <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><DollarSign size={16} className="text-blue-600" /> Contact (Email/Link)</label><input name="contact" value={formData.contact || ""} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl text-sm" /></div>
        </div>
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100">
          <label className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><ImageIcon size={16} className="text-blue-600" /> Expert Photo</label>
          <div className="border-2 border-dashed border-blue-200 p-6 md:p-8 text-center rounded-2xl"><input type="file" onChange={handleImageUpload} className="hidden" id="expert-up" /><label htmlFor="expert-up" className="cursor-pointer font-bold text-blue-600">Upload Image</label></div>
          {formData.image_url && <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">{formData.image_url.split(",").map((url, idx) => (<div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-lg"><img src={url} className="w-full h-full object-cover" alt="Expert"/><button type="button" onClick={() => removeImageUrl(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10} /></button></div>))}</div>}
        </div>
        <button disabled={loading || uploading} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-transform">{loading ? "Saving..." : "Save Expert"}</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4 border border-gray-100">
        <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Tag size={16} className="text-blue-600" /> Name</label><input name="name" value={formData.name || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl text-sm" /></div>
        <div><label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Info size={16} className="text-blue-600" /> Description</label><textarea name="description" value={formData.description || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl h-32 text-sm" /></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-bold text-gray-700 mb-2">Price {type === "addTour" ? "" : "(Per Night)"}</label><input type="number" name={type === "addTour" ? "price" : "price_per_night"} value={formData[type === "addTour" ? "price" : "price_per_night"] || ""} onChange={handleChange} required className="w-full p-4 border border-gray-200 rounded-xl text-sm" /></div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2">{type === "addTour" ? "Travel Mode" : "Hotel Category"}</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl text-sm">
              {type === "addTour" ? (
                <>
                  <option value="By Road">By Road</option>
                  <option value="By Air">By Air</option>
                </>
              ) : (
                <>
                  <option value="Premium">Premium</option>
                  <option value="Average">Average</option>
                  <option value="Standard">Standard</option>
                  <option value="Budget">Budget</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><MapPin size={16} className="text-blue-600" /> Location (Manual Text)</label>
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              name="location"
              type="text" 
              placeholder="Type address manually..." 
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500" 
              value={formData.location || ""} 
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {type === "addTour" && (
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4 border border-gray-100">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Clock size={16} className="text-blue-600" /> Tour Duration
            </label>
            <input name="duration" value={formData.duration || ""} onChange={handleChange} required placeholder="e.g. 5 Days / 4 Nights" className="w-full p-4 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Calendar size={16} className="text-blue-600" /> Tour Itinerary</label>
            <div className="space-y-4">
              {formData.plan && formData.plan.map((day, idx) => (
                <div key={idx} className="flex gap-2 md:gap-3 items-start">
                  <div className="bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded-lg text-[10px] md:text-xs mt-2 whitespace-nowrap">D{idx + 1}</div>
                  <div className="flex-grow relative">
                    <textarea value={day} onChange={(e) => handlePlanChange(idx, e.target.value)} placeholder={`Describe Day ${idx + 1}...`} className="w-full p-4 border border-gray-200 rounded-xl h-24 text-sm" required />
                    <button type="button" onClick={() => removeDay(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addDay} className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-xs uppercase tracking-widest"><Plus size={16} /> Add Day { (formData.plan?.length || 0) + 1 }</button>
          </div>
        </div>
      )}

      {type === "addHotel" && (
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4 border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Layout size={16} className="text-blue-600" /> Hotel Amenities / Services</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.amenities && formData.amenities.map((amenity, idx) => (
              <div key={idx} className="relative">
                <input 
                  value={amenity} 
                  onChange={(e) => {
                    const newAmenities = [...formData.amenities];
                    newAmenities[idx] = e.target.value;
                    setFormData({ ...formData, amenities: newAmenities });
                  }} 
                  placeholder="e.g. Free WiFi" 
                  className="w-full p-4 border border-gray-200 rounded-xl text-sm pr-10" 
                  required 
                />
                <button type="button" onClick={() => {
                  setFormData({ ...formData, amenities: formData.amenities.filter((_, i) => i !== idx) });
                }} className="absolute top-1/2 -translate-y-1/2 right-2 bg-red-50 text-red-600 p-1.5 rounded-lg hover:bg-red-100"><X size={14} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setFormData({ ...formData, amenities: [...(formData.amenities || []), ""] })} className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-xs uppercase tracking-widest"><Plus size={16} /> Add Amenity</button>
        </div>
      )}

      <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100">
        <label className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><ImageIcon size={16} className="text-blue-600" /> Photos</label>
        <div className="border-2 border-dashed border-blue-200 p-6 md:p-8 text-center rounded-2xl hover:bg-blue-50 transition-colors"><input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="item-up" /><label htmlFor="item-up" className="cursor-pointer font-bold text-blue-600">Select Photos</label></div>
        {formData.image_url && <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-6">{formData.image_url.split(",").map((url, idx) => (<div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-lg"><img src={url} className="w-full h-full object-cover" alt="Selected"/><button type="button" onClick={() => removeImageUrl(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10} /></button></div>))}</div>}
      </div>
      <button disabled={loading || uploading} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg md:text-xl shadow-2xl shadow-blue-600/20 active:scale-[0.98] transition-transform">{loading ? "Saving..." : "Save Package"}</button>
    </form>
  );
};

export default AdminDashboard;
