import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiClient } from '../utils/api';
import { 
  FileText, 
  Plus, 
  Download, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  CreditCard,
  User
} from 'lucide-react';

const Billing = () => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grossSummary, setGrossSummary] = useState(null);

  // Generate Invoice Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([{ description: 'Dental Checkup & Treatment', cost: 100, gstPercent: 18 }]);
  const [initialPayment, setInitialPayment] = useState(0);
  const [payMethod, setPayMethod] = useState('UPI');

  // Pay Due Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [additionalPayment, setAdditionalPayment] = useState('');
  const [duePayMethod, setDuePayMethod] = useState('Cash');

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices
      const invData = await apiClient('/billing');
      setInvoices(invData.invoices);

      // Fetch patient list
      const patientsData = await apiClient('/patients?limit=100');
      setPatients(patientsData.patients);

      // Fetch dashboard metrics
      const dashboardData = await apiClient('/billing/dashboard');
      setGrossSummary(dashboardData.summary);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleAddField = () => {
    setInvoiceItems([...invoiceItems, { description: '', cost: 0, gstPercent: 18 }]);
  };

  const handleRemoveField = (idx) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...invoiceItems];
    updated[idx][field] = field === 'cost' || field === 'gstPercent' ? Number(value) : value;
    setInvoiceItems(updated);
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      await apiClient('/billing', {
        body: {
          patient: selectedPatient,
          items: invoiceItems,
          paidAmount: Number(initialPayment),
          paymentMethod: payMethod,
        },
      });
      setShowGenModal(false);
      setSelectedPatient('');
      setInvoiceItems([{ description: 'Dental Checkup & Treatment', cost: 100, gstPercent: 18 }]);
      setInitialPayment(0);
      loadBillingData();
    } catch (err) {
      alert(err || 'Failed to generate invoice.');
    }
  };

  const handlePayBalance = async (e) => {
    e.preventDefault();
    try {
      await apiClient(`/billing/${activeInvoice._id}/pay`, {
        method: 'PUT',
        body: {
          amountPaid: Number(additionalPayment),
          paymentMethod: duePayMethod,
        },
      });
      setShowPayModal(false);
      setAdditionalPayment('');
      loadBillingData();
    } catch (err) {
      alert(err || 'Failed to submit payment.');
    }
  };

  const handleDownloadPDF = async (id, invNum) => {
    try {
      const blob = await apiClient(`/billing/${id}/pdf`);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Invoice_${invNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download PDF receipt:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Billing & Invoices</h1>
          <p className="text-sm text-slate-500">Record cash transactions, manage GST calculations, and print receipts</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Accountant' || user?.role === 'Receptionist') && (
          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            <span>New Invoice</span>
          </button>
        )}
      </div>

      {/* Aggregate Financials */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Total Billings (Gross)</span>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">
                ${grossSummary?.totalRevenue ? grossSummary.totalRevenue.toFixed(2) : '0.00'}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350">
              <FileText size={18} />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Total Collected</span>
              <h3 className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ${grossSummary?.totalCollected ? grossSummary.totalCollected.toFixed(2) : '0.00'}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Outstanding Dues</span>
              <h3 className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                ${grossSummary?.totalPending ? grossSummary.totalPending.toFixed(2) : '0.00'}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450">
              <AlertTriangle size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="glass-panel overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold text-xs border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Billing Cost (Inc. GST)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-850 dark:text-white">{inv.patient.name}</td>
                      <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 dark:text-white">${inv.totalAmount.toFixed(2)}</span>
                        {inv.dueAmount > 0 && (
                          <span className="block text-[10px] text-rose-500 font-semibold">Due: ${inv.dueAmount.toFixed(2)} ({inv.paymentMethod})</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          inv.status === 'Partially-Paid' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                          'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-3.5">
                        <button
                          onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                          className="flex items-center gap-1 font-bold text-brand-500 hover:text-brand-600 hover:underline"
                        >
                          <Download size={14} />
                          <span>PDF</span>
                        </button>
                        {inv.status !== 'Paid' && (user.role === 'Admin' || user.role === 'Accountant' || user.role === 'Receptionist') && (
                          <button
                            onClick={() => { setActiveInvoice(inv); setShowPayModal(true); }}
                            className="flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <DollarSign size={14} />
                            <span>Collect</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No invoices recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Generate Invoice */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[85vh]">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Generate Patient GST Invoice</h3>
            
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Patient *</label>
                <select
                  required
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat._id} value={pat._id}>{pat.name} ({pat.patientId})</option>
                  ))}
                </select>
              </div>

              {/* Itemized list fields */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Billing Items (Procedures / Drugs)</label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-xs font-bold text-brand-500 hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                
                <div className="space-y-2.5">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Cost"
                        value={item.cost || ''}
                        onChange={(e) => handleItemChange(idx, 'cost', e.target.value)}
                        className="w-20 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span className="text-xs text-slate-400">%</span>
                      <input
                        type="number"
                        required
                        placeholder="GST"
                        value={item.gstPercent}
                        onChange={(e) => handleItemChange(idx, 'gstPercent', e.target.value)}
                        className="w-12 rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="text-rose-500 hover:text-rose-600 font-bold text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment configs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Paid Advance ($)</label>
                  <input
                    type="number"
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="UPI">UPI / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card Swipe</option>
                    <option value="Insurance">Insurance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Create & Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Due Balance */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Collect Payment balance</h3>
            <p className="text-xs text-slate-400 mb-4">Patient: {activeInvoice?.patient?.name} | Balance Due: ${activeInvoice?.dueAmount?.toFixed(2)}</p>

            <form onSubmit={handlePayBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Collection Amount ($) *</label>
                <input
                  type="number"
                  required
                  max={activeInvoice?.dueAmount}
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Payment Method</label>
                <select
                  value={duePayMethod}
                  onChange={(e) => setDuePayMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / GPay</option>
                  <option value="Card">Card Swipe</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Billing;
