import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  LayoutDashboard, 
  Users, 
  CalendarRange, 
  FileSpreadsheet, 
  Package, 
  UserCheck, 
  BarChart3, 
  LogOut,
  Activity,
  Beaker,
  Sliders
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  // Define full list of routes and the roles allowed to access them
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Dentist', 'Receptionist', 'Dental Assistant', 'Accountant', 'Manager'],
    },
    {
      name: 'Patients',
      path: '/patients',
      icon: Users,
      roles: ['Admin', 'Dentist', 'Receptionist', 'Dental Assistant', 'Manager'],
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: CalendarRange,
      roles: ['Admin', 'Dentist', 'Receptionist', 'Manager'],
    },
    {
      name: 'Billing & Invoices',
      path: '/billing',
      icon: FileSpreadsheet,
      roles: ['Admin', 'Accountant', 'Receptionist', 'Manager'],
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: Package,
      roles: ['Admin', 'Dental Assistant', 'Manager'],
    },
    {
      name: 'Lab Cases',
      path: '/labcases',
      icon: Beaker,
      roles: ['Admin', 'Dentist', 'Dental Assistant', 'Manager'],
    },
    {
      name: 'Staff & Attendance',
      path: '/staff',
      icon: UserCheck,
      roles: ['Admin', 'Receptionist', 'Dentist', 'Accountant', 'Dental Assistant', 'Manager'], // staff check-in/leaves is open, admin approves
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['Admin', 'Dentist', 'Accountant', 'Receptionist', 'Manager'],
    },
    {
      name: 'Manager Desk',
      path: '/manager',
      icon: Sliders,
      roles: ['Admin', 'Manager'],
    },
  ];

  const filteredItems = navigationItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Activity size={22} className="animate-pulse" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-slate-800 dark:text-white leading-tight">Apex Dental</h1>
          <span className="text-xs text-brand-500 font-medium tracking-wide">CLINIC OS</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="mt-8 flex-1 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-sky-400 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
