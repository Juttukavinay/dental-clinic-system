import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { Search, UserPlus, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const Patients = () => {
  const navigate = useNavigate();
  
  // Data loading state
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form registration state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [genderVal, setGenderVal] = useState('Male');
  const [address, setAddress] = useState('');
  const [medHistory, setMedHistory] = useState('');
  const [dentHistory, setDentHistory] = useState('');
  const [allergiesVal, setAllergiesVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await apiClient(`/patients?search=${search}&gender=${gender}&page=${page}&limit=10`);
      setPatients(data.patients);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, gender, page]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiClient('/patients', {
        body: {
          name,
          email: email || undefined,
          contactNumber,
          dateOfBirth,
          gender: genderVal,
          address,
          medicalHistory: medHistory ? medHistory.split(',').map((s) => s.trim()) : [],
          dentalHistory: dentHistory ? dentHistory.split(',').map((s) => s.trim()) : [],
          allergies: allergiesVal ? allergiesVal.split(',').map((s) => s.trim()) : [],
        },
      });
      setShowModal(false);
      resetForm();
      fetchPatients();
    } catch (err) {
      setErrorMsg(err || 'Registration failed');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setContactNumber('');
    setDateOfBirth('');
    setGenderVal('Male');
    setAddress('');
    setMedHistory('');
    setDentHistory('');
    setAllergiesVal('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Patients Registry</h1>
          <p className="text-sm text-slate-500">Manage dental clinic patient profiles and visit logs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
        >
          <UserPlus size={16} />
          <span>Register Patient</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 flex items-center">
          <Search size={18} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, patient ID, or contact number..."
            className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800/50"
          />
        </div>
        <select
          value={gender}
          onChange={(e) => { setGender(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800/50"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Patients Table */}
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
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Age</th>
                  <th className="px-6 py-4">Contact Number</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {patients.length > 0 ? (
                  patients.map((patient) => {
                    const age = Math.abs(new Date(Date.now() - new Date(patient.dateOfBirth).getTime()).getUTCFullYear() - 1970);
                    return (
                      <tr key={patient._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">{patient.patientId}</td>
                        <td className="px-6 py-4 font-semibold text-slate-850 dark:text-white">{patient.name}</td>
                        <td className="px-6 py-4">{patient.gender}</td>
                        <td className="px-6 py-4">{age} yrs</td>
                        <td className="px-6 py-4">{patient.contactNumber}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/patients/${patient._id}`)}
                            className="flex items-center gap-1.5 font-bold text-brand-500 hover:text-brand-600 hover:underline"
                          >
                            <FileText size={15} />
                            <span>View Profile</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No patients found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Register Patient Profile</h3>
            
            {errorMsg && (
              <div className="mb-4 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Contact Number *</label>
                <input
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Gender *</label>
                <select
                  value={genderVal}
                  onChange={(e) => setGenderVal(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Home Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Medical History (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Diabetes, Hypertension, Asthma"
                  value={medHistory}
                  onChange={(e) => setMedHistory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Dental History (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Wisdom tooth extraction, Root canal treatment on 19"
                  value={dentHistory}
                  onChange={(e) => setDentHistory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Allergies (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Penicillin, Latex"
                  value={allergiesVal}
                  onChange={(e) => setAllergiesVal(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="md:col-span-2 mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-355"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Patients;
