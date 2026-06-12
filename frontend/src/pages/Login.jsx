import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, clearAuthError } from '../store/slices/authSlice';
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [isAuthenticated, navigate, from, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(login({ email, password }));
  };

  const handleQuickLogin = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    dispatch(login({ email: roleEmail, password: rolePassword }));
  };

  return (
    <div className="animated-gradient flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl dark:bg-slate-900/40">
        
        {/* Brand logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-500 shadow-xl shadow-brand-500/10 dark:bg-slate-950 dark:text-brand-400">
            <Activity size={32} />
          </div>
          <h1 className="mt-4 font-sans text-2xl font-extrabold tracking-tight text-white">
            Apex Dental Care
          </h1>
          <p className="mt-1 text-sm text-sky-100/70">
            Sign in to access the Clinic OS Dashboard
          </p>
        </div>

        {/* Form error alerts */}
        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sky-100/70">
              Email Address
            </label>
            <div className="relative mt-1.5 flex items-center">
              <Mail className="absolute left-3.5 text-sky-100/50" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-sky-200/40 outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/10"
                placeholder="you@apexdental.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sky-100/70">
              Password
            </label>
            <div className="relative mt-1.5 flex items-center">
              <Lock className="absolute left-3.5 text-sky-100/50" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-sky-200/40 outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-bold text-brand-600 shadow-xl shadow-brand-500/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 disabled:bg-white/50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Seeder Login Buttons (Excellent UX addition) */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <span className="block text-center text-xs font-semibold uppercase tracking-wider text-sky-100/50">
            Quick Sign In Demo Roles
          </span>
          <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin@apexdental.com', 'admin123')}
              className="rounded-lg border border-white/5 bg-white/5 py-2 text-white hover:bg-white/15"
            >
              🔑 Admin
            </button>
            <button
              onClick={() => handleQuickLogin('doctor.jane@apexdental.com', 'doctor123')}
              className="rounded-lg border border-white/5 bg-white/5 py-2 text-white hover:bg-white/15"
            >
              🦷 Dentist (Jane)
            </button>
            <button
              onClick={() => handleQuickLogin('reception@apexdental.com', 'reception123')}
              className="rounded-lg border border-white/5 bg-white/5 py-2 text-white hover:bg-white/15"
            >
              📅 Receptionist
            </button>
            <button
              onClick={() => handleQuickLogin('finance@apexdental.com', 'finance123')}
              className="rounded-lg border border-white/5 bg-white/5 py-2 text-white hover:bg-white/15"
            >
              💵 Accountant
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
