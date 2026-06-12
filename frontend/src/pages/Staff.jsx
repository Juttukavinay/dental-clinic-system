import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiClient } from '../utils/api';
import { Users, ClipboardList, Calendar, Check, X, ShieldAlert } from 'lucide-react';

const Staff = () => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster');

  // Leave Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState('');

  // Register Employee Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState('Dentist');
  const [empPhone, setEmpPhone] = useState('');
  const [empSpec, setEmpSpec] = useState('');
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [regError, setRegError] = useState('');

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const staffList = await apiClient('/auth/staff');
      setStaff(staffList.staff);

      const attendanceList = await apiClient('/auth/attendance');
      setAttendance(attendanceList.records);

      const leavesList = await apiClient('/auth/leaves');
      setLeaves(leavesList.leaves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLeaveSuccess('');
    try {
      await apiClient('/auth/leaves', {
        body: { startDate, endDate, reason: leaveReason },
      });
      setStartDate('');
      setEndDate('');
      setLeaveReason('');
      setLeaveSuccess('Leave request applied successfully.');
      loadStaffData();
    } catch (err) {
      alert(err || 'Failed to submit leave request');
    }
  };

  const handleRegisterEmployee = async (e) => {
    e.preventDefault();
    setRegError('');
    try {
      await apiClient('/auth/register', {
        body: {
          name: empName,
          email: empEmail,
          password: empPassword,
          role: empRole,
          contactNumber: empPhone,
          specialization: empRole === 'Dentist' ? empSpec : undefined,
          workingHours: { start: shiftStart, end: shiftEnd },
        },
      });
      setShowRegModal(false);
      resetRegForm();
      loadStaffData();
    } catch (err) {
      setRegError(err || 'Failed to register employee');
    }
  };

  const resetRegForm = () => {
    setEmpName('');
    setEmpEmail('');
    setEmpPassword('');
    setEmpRole('Dentist');
    setEmpPhone('');
    setEmpSpec('');
    setShiftStart('09:00');
    setShiftEnd('17:00');
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      await apiClient(`/auth/leaves/${id}`, {
        method: 'PUT',
        body: { status },
      });
      loadStaffData();
    } catch (err) {
      alert(err || 'Failed to update leave');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Staff Roster & Attendance</h1>
          <p className="text-sm text-slate-500">View employees list, shift hours, and approve leave requests</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
          >
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'roster' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500 hover:text-slate-755 dark:text-slate-400'
          }`}
        >
          <Users size={16} />
          <span>Employees Roster</span>
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'attendance' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500 hover:text-slate-755 dark:text-slate-400'
          }`}
        >
          <ClipboardList size={16} />
          <span>Attendance logs</span>
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'leaves' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500 hover:text-slate-755 dark:text-slate-400'
          }`}
        >
          <Calendar size={16} />
          <span>Leave Requests</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : activeTab === 'roster' ? (
        /* Roster grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((emp) => (
            <div key={emp._id} className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-44">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white">{emp.name}</h3>
                  <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                    {emp.role}
                  </span>
                </div>
                {emp.specialization && (
                  <p className="text-xs text-brand-500 font-semibold mt-0.5">{emp.specialization}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">Email: {emp.email}</p>
                <p className="text-xs text-slate-400">Phone: {emp.contactNumber || 'N/A'}</p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[10px] text-slate-450 uppercase font-semibold">
                Shift: {emp.workingHours?.start} - {emp.workingHours?.end}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'attendance' ? (
        /* Attendance log table */
        <div className="glass-panel overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold text-xs border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {attendance.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-850 dark:text-white">{log.employee.name}</td>
                    <td className="px-6 py-4">{log.employee.role}</td>
                    <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono">{log.checkIn || '--:--'}</td>
                    <td className="px-6 py-4 font-mono">{log.checkOut || '--:--'}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        log.status === 'Present' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                        log.status === 'Late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                        log.status === 'On-Leave' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' :
                        'bg-red-105 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Leave Requests tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Section: Leave Application Form */}
          <div className="glass-panel rounded-2xl p-6 h-fit">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Request Leave</h3>
            
            {leaveSuccess && (
              <div className="mb-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-lg">
                {leaveSuccess}
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Reason for Leave *</label>
                <textarea
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Clinical emergency, family event..."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 h-20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-500 py-2.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Submit Application
              </button>
            </form>
          </div>

          {/* Section: Leave list view */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
              Leave Requests Ledger
            </h3>
            
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave._id} className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl flex justify-between items-start gap-4 text-sm">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{leave.employee.name} ({leave.employee.role})</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Duration: {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Reason: {leave.reason}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                      leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      leave.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {leave.status}
                    </span>

                    {/* Admin actions */}
                    {leave.status === 'Pending' && user.role === 'Admin' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateLeaveStatus(leave._id, 'Approved')}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded dark:hover:bg-emerald-950/20"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => updateLeaveStatus(leave._id, 'Rejected')}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded dark:hover:bg-rose-950/20"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modal: Register Employee */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Register Roster Employee</h3>
            
            {regError && (
              <div className="mb-4 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Employee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oscar Martinez"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Role *</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Dentist">Dentist</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Dental Assistant">Dental Assistant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Specialization (Dentist only)</label>
                  <input
                    type="text"
                    disabled={empRole !== 'Dentist'}
                    placeholder="e.g. Endodontist"
                    value={empSpec}
                    onChange={(e) => setEmpSpec(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="oscar@apexdental.com"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Password (min 6 char) *</label>
                  <input
                    type="password"
                    required
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    placeholder="555-0104"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Shift Start</label>
                  <input
                    type="text"
                    required
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowRegModal(false); resetRegForm(); }}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Staff;
