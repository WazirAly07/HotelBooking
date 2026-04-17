import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Mountain, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, UserPlus, Search } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/");
    };
    checkUser();
  }, [navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUserNotFound(false);
    setSuccess(false);

    try {
      const targetEmail = email.trim();

      // 1. We attempt a sign-in with a dummy password to trigger the existence check
      // Note: This requires 'Email Enumeration Protection' to be OFF in Supabase settings
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: "checking-existence-123456789",
      });

      // 2. Logic to detect if user exists based on Supabase error response
      if (signInError) {
        const msg = signInError.message.toLowerCase();
        
        // CASE: User definitely does NOT exist
        if (msg.includes("user not found") || msg.includes("invalid email") || signInError.status === 404 || msg.includes("not confirmed")) {
          setError("This email is not registered with us.");
          setUserNotFound(true);
          setLoading(false);
          return;
        }
        
        // CASE: User EXISTS (because password was wrong, but email was valid)
        if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
           const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
             redirectTo: `${window.location.origin}/reset-password`,
           });
           
           if (resetError) throw resetError;
           setSuccess(true);
           setEmail("");
           setLoading(false);
           return;
        }

        // Handle other possible errors
        throw signInError;
      }

      // 3. Fallback: If no error at all (unlikely with dummy password), attempt reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSuccess(true);

    } catch (err) {
      console.error("Reset Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-4 rounded-3xl mb-6 shadow-xl shadow-blue-200 animate-pulse">
              <Mountain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight text-center">Verify Account</h2>
            <p className="text-gray-500 font-medium text-center mt-2 leading-relaxed">
              Only registered travelers can request a password reset link.
            </p>
          </div>

          {error && (
            <div className={`p-5 rounded-2xl text-sm font-bold mb-8 flex flex-col items-center gap-4 border animate-in fade-in zoom-in duration-300 ${userNotFound ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
              {userNotFound && (
                <Link
                  to="/signup"
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-all shadow-lg active:scale-95 text-xs font-black uppercase tracking-widest"
                >
                  <UserPlus className="h-4 w-4" /> Create Account
                </Link>
              )}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-emerald-50 text-emerald-800 p-8 rounded-[2rem] border border-emerald-100 flex flex-col items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="font-black text-xl">Account Verified!</p>
                <p className="text-sm opacity-90">A password recovery link has been sent to your email.</p>
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    required
                    type="email"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="Enter your account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Search className="h-6 w-6 animate-spin" /> : "Verify & Send Reset Link"}
              </button>

              <div className="text-center pt-4">
                <Link to="/login" className="text-gray-500 text-sm font-bold hover:text-blue-600">
                   Return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
