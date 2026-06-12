import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Sun, Moon, Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../utils/api';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Attendance state
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAttendance = async (type) => {
    setLoading(true);
    setMsg('');
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    try {
      await apiClient('/auth/attendance', {
        body: { time, type }
      });
      setIsCheckedIn(type === 'checkIn');
      setMsg(`${type === 'checkIn' ? 'Checked in' : 'Checked out'} successfully at ${time}`);
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      setMsg(err || 'Attendance logging failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300';
      case 'Dentist':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300';
      case 'Receptionist':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'Dental Assistant':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
      case 'Accountant':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <header className="fixed right-0 top-0 z-10 flex h-16 left-64 items-center justify-between border-b border-slate-200 bg-white/60 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
      {/* Greetings */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white">
          Welcome back, {user?.name || 'User'}
        </h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user?.role)}`}>
          {user?.role}
        </span>
      </div>

      {/* Action panel */}
      <div className="flex items-center gap-4">
        {/* Attendance Logger status notification */}
        {msg && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg">
            <CheckCircle2 size={13} />
            {msg}
          </span>
        )}

        {/* Quick Check-in/out Buttons */}
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4 dark:border-slate-800">
          {!isCheckedIn ? (
            <button
              onClick={() => handleAttendance('checkIn')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
            >
              <LogIn size={13} />
              <span>Staff Check-in</span>
            </button>
          ) : (
            <button
              onClick={() => handleAttendance('checkOut')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              <LogOut size={13} />
              <span>Staff Check-out</span>
            </button>
          )}
        </div>

        {/* Dark Mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
