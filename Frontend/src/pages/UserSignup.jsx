import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Mountain, Mail, Lock, User, ArrowRight } from "lucide-react";

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
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        console.error("Signup Error Object:", authError);
        throw new Error(`Supabase says: ${authError.message}`);
      }
      setSuccess(true);
      // Reset form fields
      setEmail("");
      setPassword("");
      setFullName("");
      
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Failed to create account");
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
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Join Us</h2>
            <p className="text-gray-500 font-medium">Create an account to save your journey</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-green-50 text-green-700 p-8 rounded-2xl text-center space-y-4 border border-green-100">
              <div className="text-4xl">📧</div>
              <h3 className="text-xl font-black">Verify Your Email</h3>
              <p className="font-medium">A confirmation link has been sent to your email address. Please click it to activate your account.</p>
              <button 
                onClick={() => navigate("/login")}
                className="mt-4 text-blue-600 font-bold hover:underline"
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
                    placeholder="Enter full name"
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
                    placeholder="Enter email address"
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
                    type="password"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="Enter password (min. 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-10 text-center">
              <p className="text-gray-600 font-medium">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                  Sign in instead
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
