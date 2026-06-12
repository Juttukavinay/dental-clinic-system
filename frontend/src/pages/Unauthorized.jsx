import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="flex h-[75vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-500/10 shadow-lg">
        <ShieldAlert size={36} />
      </div>
      <h1 className="mt-6 font-sans text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
        Permission Denied
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        Your assigned clinic staff role does not possess the credentials to access this section of the OS.
      </p>
      
      <Link
        to="/dashboard"
        className="mt-8 flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default Unauthorized;
