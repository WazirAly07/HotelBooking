import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. DATABASE AUTH: Use Supabase authentication
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) throw authError;

      if (data.user) {
        // Check if the user exists in the admins table
        const { data: adminRecord, error: adminError } = await supabase
          .from("admins")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (adminRecord && !adminError) {
          navigate("/admin/dashboard");
          return;
        } else {
          // If not an admin, sign them out immediately
          await supabase.auth.signOut();
          setError("Access denied. You are not authorized as an admin.");
        }
      }
    } catch (err) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-blue-900 tracking-tight">BTC Admin</h2>
          <p className="text-gray-500 text-sm font-medium italic">Baltistan Tourism Club Management Panel</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Admin Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-blue-900 hover:bg-blue-800 text-white font-black rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none uppercase tracking-widest text-sm"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>
        
        <div className="pt-4 text-center">
           <p className="text-xs text-gray-400 font-medium italic">Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
