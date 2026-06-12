import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiClient } from '../utils/api';
import { Beaker, Plus, Calendar, Clock, CheckCircle, Truck, AlertTriangle } from 'lucide-react';

const LabCases = () => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [labcases, setLabcases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [labName, setLabName] = useState('');
  const [workType, setWorkType] = useState('Crown');
  const [expectedDate, setExpectedDate] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadLabData = async () => {
    try {
      setLoading(true);
      const url = filterStatus ? `/labcases?status=${filterStatus}` : '/labcases';
      const data = await apiClient(url);
      setLabcases(data.labcases);

      const patientsData = await apiClient('/patients?limit=100');
      setPatients(patientsData.patients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabData();
  }, [filterStatus]);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiClient('/labcases', {
        body: {
          patient: selectedPatient,
          labName,
          workType,
          expectedDeliveryDate: expectedDate,
          cost: Number(cost),
          notes,
        },
      });
      setShowModal(false);
      resetForm();
      loadLabData();
    } catch (err) {
      setErrorMsg(err || 'Failed to record lab dispatch.');
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setLabName('');
    setWorkType('Crown');
    setExpectedDate('');
    setCost('');
    setNotes('');
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient(`/labcases/${id}`, {
        method: 'PUT',
        body: { status },
      });
      loadLabData();
    } catch (err) {
      alert(err || 'Failed to update status');
    }
  };

  // Helper: Calculate days remaining until delivery
  const getDaysRemaining = (dateStr) => {
    const diffTime = new Date(dateStr) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Lab Cases Tracking</h1>
          <p className="text-sm text-slate-500">Monitor prosthetic crowns, aligners, bridges, and ensure on-time delivery</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Dentist' || user?.role === 'Dental Assistant') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            <span>New Lab Dispatch</span>
          </button>
        )}
      </div>

      {/* Filter and Status tabs */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2.5">
          {[
            { value: '', label: 'All Cases' },
            { value: 'Sent', label: 'Sent to Lab' },
            { value: 'In-Progress', label: 'In-Progress' },
            { value: 'Delivered', label: 'Delivered Clinic' },
            { value: 'Fitted', label: 'Fitted Patient' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filterStatus === tab.value
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lab cases list */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labcases.length > 0 ? (
            labcases.map((lc) => {
              const daysRemaining = getDaysRemaining(lc.expectedDeliveryDate);
              const isUrgent = daysRemaining <= 3 && ['Sent', 'In-Progress'].includes(lc.status);
              
              return (
                <div 
                  key={lc._id} 
                  className={`glass-panel rounded-2xl p-5 border shadow-sm relative overflow-hidden flex flex-col justify-between h-52 transition-all hover:-translate-y-0.5 ${
                    isUrgent ? 'border-rose-500/20 bg-rose-500/5 animate-pulse' :
                    lc.status === 'Fitted' ? 'border-emerald-500/20 bg-emerald-500/5' :
                    'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-650 dark:text-slate-350">
                        {lc.workType}
                      </span>
                      {isUrgent ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          <AlertTriangle size={12} /> Overdue in {daysRemaining} days!
                        </span>
                      ) : lc.status !== 'Delivered' && lc.status !== 'Fitted' ? (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock size={12} /> Expected: {new Date(lc.expectedDeliveryDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle size={12} /> Delivered
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-850 dark:text-white mt-2 truncate">{lc.patient.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Lab: {lc.labName}</p>
                    <p className="text-xs text-slate-400">Dentist: Dr. {lc.dentist.name}</p>
                    {lc.notes && <p className="text-xs text-slate-500 italic mt-2 truncate">Notes: {lc.notes}</p>}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 flex justify-between items-center text-xs">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      lc.status === 'Sent' ? 'bg-indigo-100 text-indigo-700' :
                      lc.status === 'In-Progress' ? 'bg-amber-100 text-amber-700' :
                      lc.status === 'Delivered' ? 'bg-teal-100 text-teal-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {lc.status}
                    </span>

                    <div className="flex gap-2">
                      {lc.status === 'Sent' && (
                        <button 
                          onClick={() => updateStatus(lc._id, 'In-Progress')}
                          className="text-brand-500 font-bold hover:underline"
                        >
                          Start Fabrication
                        </button>
                      )}
                      {(lc.status === 'Sent' || lc.status === 'In-Progress') && (
                        <button 
                          onClick={() => updateStatus(lc._id, 'Delivered')}
                          className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                        >
                          Mark Received
                        </button>
                      )}
                      {lc.status === 'Delivered' && (
                        <button 
                          onClick={() => updateStatus(lc._id, 'Fitted')}
                          className="text-emerald-600 dark:text-emerald-450 font-bold hover:underline"
                        >
                          Mark Fitted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-sm text-slate-400">
              No lab fabrications logged.
            </div>
          )}
        </div>
      )}

      {/* Modal: New Lab Dispatch */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Log Lab Dispatch</h3>
            
            {errorMsg && (
              <div className="mb-4 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCase} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Lab Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Dental Labs"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Work Type *</label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Crown">Crown</option>
                    <option value="Bridge">Bridge</option>
                    <option value="Aligner">Aligner</option>
                    <option value="Denture">Denture</option>
                    <option value="Implant">Implant</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Expected Delivery *</label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Dispatch Cost *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Fabrication Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Shade A2, Upper first molar"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Log Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LabCases;
