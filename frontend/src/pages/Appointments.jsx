import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiClient } from '../utils/api';
import { Calendar, Clock, Plus, CheckCircle, XCircle, UserCheck } from 'lucide-react';

const Appointments = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [appointments, setAppointments] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDentist, setFilterDentist] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Booking Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');
  const [bookingDateTime, setBookingDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments
      let apptUrl = '/appointments';
      if (filterDentist || filterDate) {
        apptUrl += `?dentist=${filterDentist}&startDate=${filterDate}`;
      }
      const apptsData = await apiClient(apptUrl);
      setAppointments(apptsData.appointments);

      // Fetch dentists for booking dropdown
      const staffData = await apiClient('/auth/staff');
      const docList = staffData.staff.filter((s) => s.role === 'Dentist');
      setDentists(docList);

      // Fetch patients for booking dropdown
      const patientData = await apiClient('/patients?limit=100');
      setPatients(patientData.patients);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterDentist, filterDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiClient('/appointments', {
        body: {
          patient: selectedPatient,
          dentist: selectedDentist,
          dateTime: bookingDateTime,
          reasonForVisit: reason,
          notes,
        },
      });
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setErrorMsg(err || 'Failed to book appointment.');
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setSelectedDentist('');
    setBookingDateTime('');
    setReason('');
    setNotes('');
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient(`/appointments/${id}/status`, {
        method: 'PUT',
        body: { status },
      });
      loadData();
      
      // If checked out, redirect receptionist or admin to billing page to generate the invoice
      if (status === 'Checked-Out' && (user.role === 'Admin' || user.role === 'Receptionist')) {
        navigate('/billing');
      }
    } catch (err) {
      alert(err || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Appointments & Schedules</h1>
          <p className="text-sm text-slate-500">Track current check-ins, upcoming bookings, and staff working hours</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Receptionist') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            <span>Book Appointment</span>
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filter by Dentist</label>
          <select
            value={filterDentist}
            onChange={(e) => setFilterDentist(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <option value="">All Dentists</option>
            {dentists.map((doc) => (
              <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.specialization})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Specific Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800/50"
          />
        </div>
      </div>

      {/* Appointment Queue Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.length > 0 ? (
            appointments.map((appt) => (
              <div 
                key={appt._id} 
                className={`glass-panel rounded-2xl p-5 border shadow-sm relative overflow-hidden flex flex-col justify-between h-48 transition-all hover:-translate-y-0.5 ${
                  appt.status === 'Checked-In' ? 'border-amber-500/20 bg-amber-500/5' :
                  appt.status === 'Checked-Out' ? 'border-emerald-500/20 bg-emerald-500/5' :
                  appt.status === 'Cancelled' ? 'border-rose-500/20 bg-rose-500/5 opacity-60' :
                  'border-slate-100 dark:border-slate-800'
                }`}
              >
                {/* Heading Card */}
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-slate-400">ID: {appt.patient.patientId}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white mt-1">{appt.patient.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Dentist: Dr. {appt.dentist.name}</p>
                  <p className="text-xs text-slate-500 mt-2 font-medium truncate">Reason: {appt.reasonForVisit}</p>
                </div>

                {/* Queue buttons based on role */}
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-xs">
                  <span className={`rounded-full px-2.5 py-0.5 font-bold uppercase ${
                    appt.status === 'Checked-In' ? 'bg-amber-100 text-amber-700' :
                    appt.status === 'Checked-Out' ? 'bg-emerald-100 text-emerald-700' :
                    appt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                    'bg-sky-100 text-sky-700'
                  }`}>
                    {appt.status}
                  </span>

                  {/* Operational States */}
                  {appt.status === 'Scheduled' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateStatus(appt._id, 'Checked-In')} 
                        className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold hover:underline"
                      >
                        <UserCheck size={13} /> Check-In
                      </button>
                      <button 
                        onClick={() => updateStatus(appt._id, 'Cancelled')} 
                        className="flex items-center gap-0.5 text-rose-500 font-bold hover:underline"
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    </div>
                  )}

                  {appt.status === 'Checked-In' && (
                    <button 
                      onClick={() => updateStatus(appt._id, 'Checked-Out')} 
                      className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      <CheckCircle size={13} /> Check-Out & Bill
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-sm text-slate-400">
              No appointments booked for this time.
            </div>
          )}
        </div>
      )}

      {/* Booking Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Book Appointment Slot</h3>
            
            {errorMsg && (
              <div className="mb-4 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Associate Patient *</label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Associate Dentist *</label>
                <select
                  required
                  value={selectedDentist}
                  onChange={(e) => setSelectedDentist(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">-- Select Dentist --</option>
                  {dentists.map((doc) => (
                    <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.specialization})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Schedule Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingDateTime}
                  onChange={(e) => setBookingDateTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Reason for Visit *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regular scaling checkup"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Aesthetic / General Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;
