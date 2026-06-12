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
  TrendingUp,
  Beaker,
  CreditCard,
  Check
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [labAlerts, setLabAlerts] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Pay State
  const [quickPayInvoice, setQuickPayInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [paying, setPaying] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch appointment stats (all roles have access)
      try {
        const apptData = await apiClient('/appointments/stats');
        setStats(apptData.stats);
      } catch (err) {
        console.error('Error fetching appointment stats:', err);
      }

      // 2. Fetch financials (Admin, Accountant only)
      if (user?.role === 'Admin' || user?.role === 'Accountant') {
        try {
          const billingData = await apiClient('/billing/dashboard');
          setFinancials(billingData.summary);
        } catch (err) {
          console.error('Error fetching financials:', err);
        }
      }

      // 3. Fetch low stock items (Admin, Dental Assistant only)
      if (user?.role === 'Admin' || user?.role === 'Dental Assistant') {
        try {
          const inventoryData = await apiClient('/inventory?lowStock=true');
          setLowStock(inventoryData);
        } catch (err) {
          console.error('Error fetching low stock:', err);
        }
      }

      // 4. Fetch lab alerts (Admin, Dentist, Dental Assistant)
      if (user?.role === 'Admin' || user?.role === 'Dentist' || user?.role === 'Dental Assistant') {
        try {
          const labData = await apiClient('/labcases/alerts');
          setLabAlerts(labData.alerts || []);
        } catch (err) {
          console.error('Error fetching lab alerts:', err);
        }
      }

      // 5. Fetch unpaid invoices (Admin, Accountant, Receptionist)
      if (user?.role === 'Admin' || user?.role === 'Accountant' || user?.role === 'Receptionist') {
        try {
          const billingData = await apiClient('/billing');
          const unpaid = (billingData.invoices || []).filter(
            (inv) => inv.status === 'Unpaid' || inv.status === 'Partially-Paid'
          );
          setUnpaidInvoices(unpaid);
        } catch (err) {
          console.error('Error fetching unpaid invoices:', err);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleQuickPaySubmit = async (e) => {
    e.preventDefault();
    if (!quickPayInvoice || !payAmount) return;

    try {
      setPaying(true);
      await apiClient(`/billing/${quickPayInvoice._id}/pay`, {
        method: 'PUT',
        body: {
          amountPaid: Number(payAmount),
          paymentMethod: payMethod,
        },
      });

      // Refresh data
      const billingData = await apiClient('/billing');
      const unpaid = (billingData.invoices || []).filter(
        (inv) => inv.status === 'Unpaid' || inv.status === 'Partially-Paid'
      );
      setUnpaidInvoices(unpaid);

      // Refresh financials if Admin or Accountant
      if (user?.role === 'Admin' || user?.role === 'Accountant') {
        const billingDash = await apiClient('/billing/dashboard');
        setFinancials(billingDash.summary);
      }

      setQuickPayInvoice(null);
      setPayAmount('');
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    } finally {
      setPaying(false);
    }
  };

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
                ₹{financials?.totalRevenue ? financials.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
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
        {/* Today's Queue & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Queue */}
          <div className="glass-panel rounded-2xl p-6">
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

          {/* Dues Payment Collection */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Outstanding Payment Collections</h3>
                <p className="text-xs text-slate-400">Record payments for invoices with pending due amounts</p>
              </div>
              <Link to="/billing" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
                View Invoice Ledger <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {unpaidInvoices.length > 0 ? (
                unpaidInvoices.slice(0, 5).map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{inv.patient?.name}</h4>
                      <p className="text-xs text-slate-400">
                        Invoice: <span className="font-mono">{inv.invoiceNumber}</span> | Total: ₹{inv.totalAmount}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-lg">
                        Due: ₹{inv.dueAmount}
                      </span>
                      <button
                        onClick={() => {
                          setQuickPayInvoice(inv);
                          setPayAmount(inv.dueAmount);
                        }}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        Collect
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">No outstanding invoices pending collection.</div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Column */}
        <div className="space-y-6">
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

          {/* Pending Lab Delivery Alerts */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Urgent Lab Case Alerts</h3>
              <Link to="/labcases" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
                View Lab Logs <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {labAlerts.length > 0 ? (
                labAlerts.map((lc) => {
                  const diffTime = new Date(lc.expectedDeliveryDate) - new Date();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return (
                    <div key={lc._id} className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 flex items-start gap-2.5 animate-pulse">
                      <Beaker className="text-rose-500 shrink-0 mt-0.5" size={16} />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                          {lc.workType} for {lc.patient?.name}
                        </h4>
                        <p className="text-xs text-rose-505 font-semibold mt-0.5">
                          Status: {lc.status} | {diffDays <= 0 ? 'OVERDUE!' : `Expected in ${diffDays} day${diffDays > 1 ? 's' : ''}`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Lab: {lc.labName} | Dentist: Dr. {lc.dentist?.name}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">No urgent pending lab fabrications.</div>
              )}
            </div>
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

      {/* Profile quick stats and Lab Alerts */}
      <div className="space-y-6">
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

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Your Lab Case Alerts</h3>
            <Link to="/labcases" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View Logs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {labAlerts.length > 0 ? (
              labAlerts.map((lc) => {
                const diffTime = new Date(lc.expectedDeliveryDate) - new Date();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return (
                  <div key={lc._id} className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 flex items-start gap-2.5 animate-pulse">
                    <Beaker className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {lc.workType} for {lc.patient?.name}
                      </h4>
                      <p className="text-xs text-rose-500 font-semibold mt-0.5">
                        Status: {lc.status} | {diffDays <= 0 ? 'OVERDUE!' : `Expected in ${diffDays} day${diffDays > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Lab: {lc.labName}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">No urgent pending lab cases.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReceptionistDashboard = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Column: Queue & Payment Collections */}
      <div className="lg:col-span-2 space-y-6">
        {/* Lobby Queue */}
        <div className="glass-panel rounded-2xl p-6">
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
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 cursor-pointer"
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
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
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

        {/* Dues Payment Collection */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Outstanding Payment Collections</h3>
              <p className="text-xs text-slate-400">Record payments for invoices with pending due amounts</p>
            </div>
            <Link to="/billing" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View Invoice Ledger <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {unpaidInvoices.length > 0 ? (
              unpaidInvoices.slice(0, 5).map((inv) => (
                <div key={inv._id} className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{inv.patient?.name}</h4>
                    <p className="text-xs text-slate-400">
                      Invoice: <span className="font-mono">{inv.invoiceNumber}</span> | Total: ₹{inv.totalAmount}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-lg">
                      Due: ₹{inv.dueAmount}
                    </span>
                    <button
                      onClick={() => {
                        setQuickPayInvoice(inv);
                        setPayAmount(inv.dueAmount);
                      }}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">No outstanding invoices pending collection.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Shortcuts & Lab Case Alerts */}
      <div className="space-y-6">
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

        {/* Pending Lab Delivery Alerts */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Lab Delivery Alerts</h3>
            <Link to="/labcases" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View Logs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {labAlerts.length > 0 ? (
              labAlerts.map((lc) => {
                const diffTime = new Date(lc.expectedDeliveryDate) - new Date();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return (
                  <div key={lc._id} className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 flex items-start gap-2.5 animate-pulse">
                    <Beaker className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {lc.workType} for {lc.patient?.name}
                      </h4>
                      <p className="text-xs text-rose-500 font-semibold mt-0.5">
                        Status: {lc.status} | {diffDays <= 0 ? 'OVERDUE!' : `Expected in ${diffDays} day${diffDays > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Lab: {lc.labName}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">No urgent pending lab cases.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountantDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Gross Billings</span>
          <h3 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">
            ₹{financials?.totalRevenue ? financials.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </h3>
        </div>
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Total Collected</span>
          <h3 className="mt-1 text-2xl font-extrabold text-emerald-650 dark:text-emerald-400">
            ₹{financials?.totalCollected ? financials.totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </h3>
        </div>
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Outstanding Dues</span>
          <h3 className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            ₹{financials?.totalPending ? financials.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </h3>
        </div>
      </div>

      {/* Dues Payment Collection */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Outstanding Payment Collections</h3>
            <p className="text-xs text-slate-400">Record payments for invoices with pending due amounts</p>
          </div>
          <Link to="/billing" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
            View Invoice Ledger <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {unpaidInvoices.length > 0 ? (
            unpaidInvoices.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between py-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{inv.patient?.name}</h4>
                  <p className="text-xs text-slate-400">
                    Invoice: <span className="font-mono">{inv.invoiceNumber}</span> | Total: ₹{inv.totalAmount}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-lg">
                    Due: ₹{inv.dueAmount}
                  </span>
                  <button
                    onClick={() => {
                      setQuickPayInvoice(inv);
                      setPayAmount(inv.dueAmount);
                    }}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Collect
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-slate-450">No outstanding invoices pending collection.</div>
          )}
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

      {/* Quick Pay Modal */}
      {quickPayInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Record Payment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Patient: <span className="font-bold">{quickPayInvoice.patient?.name}</span> | Invoice: <span className="font-mono">{quickPayInvoice.invoiceNumber}</span>
            </p>

            <form onSubmit={handleQuickPaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Amount to Record (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={quickPayInvoice.dueAmount}
                  placeholder={`Max ₹${quickPayInvoice.dueAmount}`}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Payment Method *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPayInvoice(null)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  disabled={paying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-605 bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 flex items-center gap-1.5"
                  disabled={paying}
                >
                  {paying ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
