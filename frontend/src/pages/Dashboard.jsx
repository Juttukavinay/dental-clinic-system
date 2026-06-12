import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  UserPlus, 
  AlertTriangle, 
  CheckSquare, 
  Activity, 
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch appointment stats (all roles have access)
        const apptData = await apiClient('/appointments/stats');
        setStats(apptData.stats);

        // 2. Fetch financials (Admin, Accountant only)
        if (user?.role === 'Admin' || user?.role === 'Accountant') {
          const billingData = await apiClient('/billing/dashboard');
          setFinancials(billingData.summary);
        }

        // 3. Fetch low stock items (Admin, Dental Assistant only)
        if (user?.role === 'Admin' || user?.role === 'Dental Assistant') {
          const inventoryData = await apiClient('/inventory?lowStock=true');
          setLowStock(inventoryData);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  // ==========================================
  // VIEW RENDERERS BY ROLE
  // ==========================================

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Total Patients</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">4</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950/30">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            <span className="font-semibold text-emerald-500 flex items-center mr-1">
              <TrendingUp size={12} className="mr-0.5" /> +100%
            </span>
            since last month
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Total Revenue</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">
                ${financials?.totalRevenue ? financials.totalRevenue.toFixed(2) : '0.00'}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30">
              <DollarSign size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            <span className="font-semibold text-emerald-500 mr-1">18% GST</span>
            included in totals
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Appointments Today</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">
                {stats?.todayCount || 0}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/30">
              <Calendar size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            <span className="font-semibold text-brand-500 mr-1">{stats?.checkedIn || 0} checked-in</span>
            in lobby queue
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Inventory Alerts</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">
                {lowStock?.alertsCount || 0}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/30">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            {lowStock?.alertsCount > 0 ? (
              <span className="font-semibold text-rose-500">Items running low on stock!</span>
            ) : (
              <span className="font-semibold text-emerald-500">All supplies stocked</span>
            )}
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Queue */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Today's Appointment Schedule</h3>
              <p className="text-xs text-slate-400">Manage patient check-ins and session states</p>
            </div>
            <Link to="/appointments" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View Calendar <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {stats?.list && stats.list.length > 0 ? (
              stats.list.map((appt) => (
                <div key={appt._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {appt.patient.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{appt.patient.name}</h4>
                      <p className="text-xs text-slate-400">with Dr. {appt.dentist.name} | {appt.reasonForVisit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      appt.status === 'Checked-In' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                      appt.status === 'Checked-Out' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">No appointments scheduled for today.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 dark:border-slate-800">
            Critical Inventory Alerts
          </h3>
          <div className="mt-4 space-y-4">
            {lowStock?.inventory && lowStock.inventory.length > 0 ? (
              lowStock.inventory.map((item) => (
                <div key={item._id} className="rounded-xl border border-red-500/10 bg-red-500/5 p-3 flex items-start gap-2.5">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{item.itemName}</h4>
                    <p className="text-xs text-rose-500 font-semibold mt-0.5">
                      Stock: {item.quantity} {item.unit}s (Min: {item.minQuantityAlert})
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Vendor: {item.supplierName || 'General supplier'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">All supplies are properly stocked.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDentistDashboard = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Appointment calendar listing */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 dark:border-slate-800">
          Your Daily Clinical Schedule ({stats?.todayCount || 0} Patients)
        </h3>
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {stats?.list && stats.list.length > 0 ? (
            stats.list.map((appt) => (
              <div key={appt._id} className="flex items-center justify-between py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400 font-bold">
                    {appt.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{appt.patient.name}</h4>
                    <p className="text-xs text-slate-400">Reason: {appt.reasonForVisit}</p>
                    {appt.notes && <p className="text-xs text-slate-400 italic">Notes: {appt.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    appt.status === 'Checked-In' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                    appt.status === 'Checked-Out' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                  }`}>
                    {appt.status}
                  </span>
                  {appt.status === 'Checked-In' && (
                    <Link to={`/patients`} className="rounded-lg bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700">
                      Treat Patient
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">You have no scheduled check-ups today.</div>
          )}
        </div>
      </div>

      {/* Profile quick stats */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 dark:border-slate-800">
          Clinician Overview
        </h3>
        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4">
            <span className="text-xs text-slate-400 uppercase font-medium">Assigned Speciality</span>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{user?.specialization || 'General Practitioner'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4">
            <span className="text-xs text-slate-400 uppercase font-medium">Work Shift</span>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
              Shift hours: 09:00 AM - 05:00 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReceptionistDashboard = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Lobby Queue */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Active Patient Queue</h3>
            <p className="text-xs text-slate-400">Record check-ins and check-outs as patients arrive</p>
          </div>
          <Link to="/appointments" className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600">
            Book Appointment
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {stats?.list && stats.list.length > 0 ? (
            stats.list.map((appt) => (
              <div key={appt._id} className="flex items-center justify-between py-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{appt.patient.name}</h4>
                  <p className="text-xs text-slate-400">Dentist: Dr. {appt.dentist.name} | Time: {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold mr-2 ${
                    appt.status === 'Checked-In' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                    appt.status === 'Checked-Out' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                  }`}>
                    {appt.status}
                  </span>
                  {appt.status === 'Scheduled' && (
                    <button
                      onClick={async () => {
                        await apiClient(`/appointments/${appt._id}/status`, { method: 'PUT', body: { status: 'Checked-In' } });
                        window.location.reload();
                      }}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                    >
                      Check-In
                    </button>
                  )}
                  {appt.status === 'Checked-In' && (
                    <button
                      onClick={async () => {
                        await apiClient(`/appointments/${appt._id}/status`, { method: 'PUT', body: { status: 'Checked-Out' } });
                        window.location.reload();
                      }}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Check-Out
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">No scheduled appointments for today.</div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 dark:border-slate-800">
          Receptionist Shortcuts
        </h3>
        <Link to="/patients" className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-2.5">
            <UserPlus className="text-brand-500" size={18} />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add New Patient</span>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </Link>
      </div>
    </div>
  );

  const renderAccountantDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Gross Billings</span>
          <h3 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">
            ${financials?.totalRevenue ? financials.totalRevenue.toFixed(2) : '0.00'}
          </h3>
        </div>
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Total Collected</span>
          <h3 className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ${financials?.totalCollected ? financials.totalCollected.toFixed(2) : '0.00'}
          </h3>
        </div>
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Outstanding Dues</span>
          <h3 className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            ${financials?.totalPending ? financials.totalPending.toFixed(2) : '0.00'}
          </h3>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Billing Actions</h3>
          <Link to="/billing" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
            Invoice Ledger <ArrowRight size={14} />
          </Link>
        </div>
        <div className="py-8 text-center text-sm text-slate-400">
          Configure patients' due payment items or download GST receipt invoices under the billing tab.
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome to Apex Dental Care. Select pages from the sidebar to view clinic operations.</p>
      </div>

      {user?.role === 'Admin' && renderAdminDashboard()}
      {user?.role === 'Dentist' && renderDentistDashboard()}
      {user?.role === 'Receptionist' && renderReceptionistDashboard()}
      {user?.role === 'Accountant' && renderAccountantDashboard()}
      {user?.role === 'Dental Assistant' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Dental Assistant Panel</h3>
            <p className="text-sm text-slate-400 mb-6">Review current stock alerts to ensure sufficient inventory is available for treatments.</p>
            {renderAdminDashboard()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
