import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Mountain, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

const UserSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanEmail = email.trim();
      
      // 1. Attempt to sign up
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password.trim(),
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        // 2. Check if the error is because the user already exists
        if (authError.message.toLowerCase().includes("already registered") || authError.status === 422) {
            setError("This email is already registered. Please log in instead.");
            return;
        }
        throw authError;
      }

      // Supabase sometimes returns data.user as null if email confirmation is required 
      // but the user already exists (to prevent enumeration). 
      // With protection OFF, the error above catches it.
      
      setSuccess(true);
      setEmail("");
      setPassword("");
      setFullName("");
      
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-200">
              <Mountain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-gray-500 font-medium text-center">Start your journey across Baltistan today.</p>
          </div>

          {error && (
            <div className={`p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-3 border ${error.includes("already registered") ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="flex flex-col">
                {error}
                {error.includes("already registered") && (
                    <Link to="/login" className="text-blue-600 underline mt-1">Go to Login</Link>
                )}
              </div>
            </div>
          )}

          {success ? (
            <div className="bg-green-50 text-green-700 p-8 rounded-2xl text-center space-y-4 border border-green-100 animate-in fade-in zoom-in">
              <div className="text-4xl">📧</div>
              <h3 className="text-xl font-black">Verification Sent!</h3>
              <p className="font-medium text-sm">We've sent a link to your email. Please click it to activate your account.</p>
              <button 
                onClick={() => navigate("/login")}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-all"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    required
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    required
                    type="email"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    required
                    minLength={6}
                    type="password"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-95"
              >
                {loading ? "Registering..." : "Create Account"}
                {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-10 text-center border-t border-gray-100 pt-6">
              <p className="text-gray-600 font-medium">
                Already part of the club?{" "}
                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
