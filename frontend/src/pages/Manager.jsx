import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { 
  Calendar, 
  Beaker, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  UserCheck, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';

const Manager = () => {
  const [stats, setStats] = useState(null);
  const [labAlerts, setLabAlerts] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Pay State
  const [quickPayInvoice, setQuickPayInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [paying, setPaying] = useState(false);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch appointment schedule & stats
      try {
        const apptData = await apiClient('/appointments/stats');
        setStats(apptData.stats);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }

      // 2. Fetch lab case alerts
      try {
        const labData = await apiClient('/labcases/alerts');
        setLabAlerts(labData.alerts || []);
      } catch (err) {
        console.error('Error fetching lab alerts:', err);
      }

      // 3. Fetch unpaid invoices
      try {
        const billingData = await apiClient('/billing');
        const unpaid = (billingData.invoices || []).filter(
          (inv) => inv.status === 'Unpaid' || inv.status === 'Partially-Paid'
        );
        setUnpaidInvoices(unpaid);
      } catch (err) {
        console.error('Error fetching unpaid invoices:', err);
      }
    } catch (error) {
      console.error('Error loading manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Clinic Control Center</h1>
        <p className="text-sm text-slate-500">Monitor appointment logs, overdue lab fabrication times, and record patient payment collections.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Today's Visits</span>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">{stats?.todayCount || 0} Scheduled</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950/30">
            <Calendar size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Lab Dispatches</span>
            <h3 className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400">{labAlerts.length} Urgent Alerts</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/30">
            <Beaker size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Dues Pending</span>
            <h3 className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-455">{unpaidInvoices.length} Invoices</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/30">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Today's Queue & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Tracker */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Active Appointment Schedule</h3>
                <p className="text-xs text-slate-400">Confirm check-ins and dentist session states</p>
              </div>
              <Link to="/appointments" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
                Open Appointments <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.list && stats.list.length > 0 ? (
                stats.list.map((appt) => (
                  <div key={appt._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-350">
                        {appt.patient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{appt.patient.name}</h4>
                        <p className="text-xs text-slate-400">Dentist: Dr. {appt.dentist.name} | Reason: {appt.reasonForVisit}</p>
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
                <div className="py-8 text-center text-sm text-slate-400">No scheduled clinical sessions today.</div>
              )}
            </div>
          </div>

          {/* Dues Payment Collection */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Outstanding Dues & Collections</h3>
                <p className="text-xs text-slate-400">Process payment registrations for outstanding balances</p>
              </div>
              <Link to="/billing" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
                Billing Ledger <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {unpaidInvoices.length > 0 ? (
                unpaidInvoices.slice(0, 10).map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-805 dark:text-white">{inv.patient?.name}</h4>
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
                <div className="py-8 text-center text-sm text-slate-400">All invoices fully paid.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Lab Case Delivery Alarms */}
        <div className="glass-panel rounded-2xl p-6 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Lab Delivery Status Alarms</h3>
            <Link to="/labcases" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
              All Dispatches <ArrowRight size={14} />
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
                        {lc.workType} - {lc.patient?.name}
                      </h4>
                      <p className="text-xs text-rose-500 font-semibold mt-0.5">
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
              <div className="py-8 text-center text-sm text-slate-400">All lab cases delivered on time.</div>
            )}
          </div>
        </div>
      </div>

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
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                  disabled={paying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 flex items-center gap-1.5"
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

export default Manager;
