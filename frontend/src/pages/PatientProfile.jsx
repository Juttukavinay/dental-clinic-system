const BASE_URL = 'http://localhost:5000';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiClient } from '../utils/api';
import { 
  FileText, 
  Stethoscope, 
  Pill, 
  Image as ImageIcon, 
  Plus, 
  Download, 
  AlertCircle,
  Clock,
  ChevronRight,
  Upload,
  Beaker
} from 'lucide-react';

const PatientProfile = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  // States
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labCases, setLabCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  // Lab case form state
  const [showLabModal, setShowLabModal] = useState(false);
  const [labName, setLabName] = useState('');
  const [workType, setWorkType] = useState('Crown');
  const [expectedDate, setExpectedDate] = useState('');
  const [labCost, setLabCost] = useState('');
  const [labNotes, setLabNotes] = useState('');

  // Treatment form state
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [procedure, setProcedure] = useState('Filling');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  // Prescription form state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('Once daily');
  const [medDuration, setMedDuration] = useState('5 days');
  const [medInstructions, setMedInstructions] = useState('Take after meals');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  // Upload file state
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('xray');
  const [fileTitle, setFileTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const patientData = await apiClient(`/patients/${id}`);
      setPatient(patientData.patient);

      const treatmentsData = await apiClient(`/treatments?patient=${id}`);
      setTreatments(treatmentsData.treatments);

      const rxData = await apiClient(`/prescriptions?patient=${id}`);
      setPrescriptions(rxData.prescriptions);

      const labData = await apiClient(`/labcases?patient=${id}`);
      setLabCases(labData.labcases || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const handleAddTreatment = async (e) => {
    e.preventDefault();
    try {
      const treatmentPlan = [{ procedure, cost: Number(cost), status: 'Completed' }];
      await apiClient('/treatments', {
        body: {
          patient: id,
          diagnosis,
          treatmentPlan,
          notes,
        },
      });
      setShowTreatmentModal(false);
      setDiagnosis('');
      setCost('');
      setNotes('');
      fetchProfileData();
    } catch (err) {
      alert(err || 'Failed to record treatment');
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      const medicines = [
        {
          name: medName,
          dosage: medDosage,
          frequency: medFrequency,
          duration: medDuration,
          instructions: medInstructions,
        },
      ];
      await apiClient('/prescriptions', {
        body: {
          patient: id,
          medicines,
          notes: prescriptionNotes,
        },
      });
      setShowPrescriptionModal(false);
      setMedName('');
      setMedDosage('');
      setPrescriptionNotes('');
      fetchProfileData();
    } catch (err) {
      alert(err || 'Failed to issue prescription');
    }
  };

  const handleAddLabCase = async (e) => {
    e.preventDefault();
    try {
      await apiClient('/labcases', {
        body: {
          patient: id,
          labName,
          workType,
          expectedDeliveryDate: expectedDate,
          cost: Number(labCost),
          notes: labNotes,
        },
      });
      setShowLabModal(false);
      setLabName('');
      setExpectedDate('');
      setLabCost('');
      setLabNotes('');
      fetchProfileData();
    } catch (err) {
      alert(err || 'Failed to dispatch to lab');
    }
  };

  const updateLabStatus = async (labId, status) => {
    try {
      await apiClient(`/labcases/${labId}`, {
        method: 'PUT',
        body: { status },
      });
      fetchProfileData();
    } catch (err) {
      alert(err || 'Failed to update lab status');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);
      formData.append('title', fileTitle);

      await apiClient(`/patients/${id}/upload`, {
        method: 'POST',
        isForm: true,
        body: formData,
      });

      setFile(null);
      setFileTitle('');
      fetchProfileData();
    } catch (err) {
      alert(err || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPDF = async (url, filename) => {
    try {
      const blob = await apiClient(url);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const age = Math.abs(new Date(Date.now() - new Date(patient.dateOfBirth).getTime()).getUTCFullYear() - 1970);

  return (
    <div className="space-y-6">
      {/* Patient EHR header banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white font-sans font-bold text-2xl shadow-xl shadow-brand-500/10">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">{patient.name}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="font-mono font-bold">ID: {patient.patientId}</span>
              <span>•</span>
              <span>{patient.gender} | {age} yrs</span>
              <span>•</span>
              <span>Contact: {patient.contactNumber}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Address: {patient.address || 'No address registered'}</p>
          </div>
        </div>

        {/* Health Allergy Indicator (RED flag UX rule) */}
        {patient.allergies && patient.allergies.length > 0 ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 max-w-xs md:max-w-md">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <div>
              <span className="block uppercase tracking-wider text-[10px] text-slate-400">Allergy Warnings</span>
              <p className="mt-0.5">{patient.allergies.join(', ')}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-xs text-emerald-600 dark:text-emerald-400">
            <AlertCircle size={18} className="shrink-0 text-emerald-500" />
            <div>
              <span className="block uppercase tracking-wider text-[10px] text-slate-400 font-semibold">Allergy Warnings</span>
              <p className="mt-0.5">No drug allergies reported</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile sub tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { id: 'history', label: 'Dental & Medical History', icon: FileText },
          { id: 'treatments', label: 'Treatments & Diagnosis', icon: Stethoscope },
          { id: 'prescriptions', label: 'Prescriptions Rx', icon: Pill },
          { id: 'files', label: 'X-Rays & Scans', icon: ImageIcon },
          { id: 'labcases', label: 'Lab Cases', icon: Beaker },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs panels */}
      <div className="mt-4">
        {/* Panel 1: Medical/Dental History */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider text-slate-500 mb-4">
                Recorded Medical Conditions
              </h3>
              <ul className="space-y-2.5">
                {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                  patient.medicalHistory.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-350">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No medical conditions on file.</p>
                )}
              </ul>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider text-slate-500 mb-4">
                Prior Dental Observations
              </h3>
              <ul className="space-y-2.5">
                {patient.dentalHistory && patient.dentalHistory.length > 0 ? (
                  patient.dentalHistory.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-350">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No prior dental work recorded.</p>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Panel 2: Treatments Log */}
        {activeTab === 'treatments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider text-slate-500">
                Procedure History
              </h3>
              {(user?.role === 'Admin' || user?.role === 'Dentist') && (
                <button
                  onClick={() => setShowTreatmentModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  <Plus size={14} />
                  <span>Record Treatment</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {treatments.length > 0 ? (
                treatments.map((tr) => (
                  <div key={tr._id} className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-xs text-slate-400">{new Date(tr.date).toLocaleDateString()}</span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">Diagnosis: {tr.diagnosis}</h4>
                      </div>
                      <span className="text-xs text-slate-450 dark:text-slate-400 italic">Dentist: Dr. {tr.dentist.name}</span>
                    </div>

                    <div className="mt-3.5 space-y-2.5">
                      {tr.treatmentPlan.map((plan, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 px-3.5 py-2.5 rounded-xl text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white">{plan.procedure}</span>
                            <span className="ml-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 font-bold">${plan.cost}</span>
                          </div>
                          <span className="font-semibold text-slate-500">{plan.status}</span>
                        </div>
                      ))}
                    </div>
                    {tr.notes && <p className="text-xs text-slate-400 italic mt-3">Notes: {tr.notes}</p>}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-slate-400">No treatments recorded for this patient.</div>
              )}
            </div>
          </div>
        )}

        {/* Panel 3: Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider text-slate-500">
                Prescriptions List
              </h3>
              {(user?.role === 'Admin' || user?.role === 'Dentist') && (
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  <Plus size={14} />
                  <span>Write Prescription</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {prescriptions.length > 0 ? (
                prescriptions.map((rx) => (
                  <div key={rx._id} className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <span className="text-xs text-slate-400">{new Date(rx.date).toLocaleDateString()}</span>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Medicines Prescribed</h4>
                      </div>
                      <div className="space-y-2">
                        {rx.medicines.map((med, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-bold text-slate-800 dark:text-white">{med.name}</span>
                            <span className="text-xs text-slate-400 ml-2">({med.dosage} - {med.frequency} for {med.duration})</span>
                            <p className="text-xs text-slate-450 italic ml-2 mt-0.5">{med.instructions}</p>
                          </div>
                        ))}
                      </div>
                      {rx.notes && <p className="text-xs text-slate-400 italic">Notes: {rx.notes}</p>}
                    </div>

                    <button
                      onClick={() => handleDownloadPDF(`/prescriptions/${rx._id}/pdf`, `Rx_${patient.patientId}.pdf`)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 transition-all shrink-0"
                    >
                      <Download size={14} />
                      <span>Download Prescription PDF</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-slate-400">No prescriptions written on file.</div>
              )}
            </div>
          </div>
        )}

        {/* Panel 4: X-Rays & Reports */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Upload Medical Document (X-Ray / Lab Report)</h4>
              <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Document File</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files[0])}
                    className="mt-1.5 w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 dark:file:bg-slate-800 dark:file:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Left Molars Panoramic Scan"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Category</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="xray">X-Ray Scan</option>
                    <option value="report">Lab Report</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 shrink-0"
                >
                  <Upload size={14} />
                  <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                </button>
              </form>
            </div>

            {/* Document listings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Combine and render files */}
              {[
                ...patient.xrays.map((f) => ({ ...f, category: 'X-Ray' })),
                ...patient.reports.map((f) => ({ ...f, category: 'Report' })),
              ].length > 0 ? (
                [
                  ...patient.xrays.map((f) => ({ ...f, category: 'X-Ray' })),
                  ...patient.reports.map((f) => ({ ...f, category: 'Report' })),
                ].map((file, i) => {
                  const fileUrl = file.url.startsWith('http') ? file.url : `${BASE_URL}${file.url}`;
                  return (
                    <div key={i} className="glass-panel overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="p-4 space-y-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          file.category === 'X-Ray' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {file.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{file.title}</h4>
                        <p className="text-[10px] text-slate-400">Added: {new Date(file.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-850 px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-brand-500 hover:text-brand-600"
                        >
                          Open Document
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-sm text-slate-400">No medical files or scans uploaded.</div>
              )}
            </div>
          </div>
        )}

        {/* Panel 5: Lab Cases */}
        {activeTab === 'labcases' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider text-slate-500">
                External Lab Cases
              </h3>
              {(user?.role === 'Admin' || user?.role === 'Dentist' || user?.role === 'Dental Assistant') && (
                <button
                  onClick={() => setShowLabModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Log Lab Dispatch</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {labCases.length > 0 ? (
                labCases.map((lc) => {
                  const diffTime = new Date(lc.expectedDeliveryDate) - new Date();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isUrgent = diffDays <= 3 && ['Sent', 'In-Progress'].includes(lc.status);

                  return (
                    <div 
                      key={lc._id} 
                      className={`glass-panel rounded-2xl p-5 border shadow-sm flex flex-col justify-between h-48 transition-all ${
                        isUrgent ? 'border-rose-500/20 bg-rose-500/5' :
                        lc.status === 'Fitted' ? 'border-emerald-500/20 bg-emerald-500/5' :
                        'border-slate-100 dark:border-slate-850'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="rounded-full bg-slate-150 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-650 dark:text-slate-300">
                            {lc.workType}
                          </span>
                          {isUrgent ? (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              Overdue in {diffDays} days!
                            </span>
                          ) : lc.status !== 'Delivered' && lc.status !== 'Fitted' ? (
                            <span className="text-[10px] text-slate-405 font-semibold">
                              Expected: {new Date(lc.expectedDeliveryDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-605 dark:text-emerald-400 font-semibold">
                              Delivered
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-805 dark:text-white mt-3.5">Lab: {lc.labName}</h4>
                        <p className="text-xs text-slate-400">Dentist: Dr. {lc.dentist?.name || user?.name}</p>
                        {user?.role === 'Admin' && (
                          <p className="text-xs font-bold text-slate-650 dark:text-slate-350">Cost: ₹{lc.cost}</p>
                        )}
                        {lc.notes && <p className="text-xs text-slate-500 italic mt-2 truncate">Notes: {lc.notes}</p>}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 flex justify-between items-center text-xs">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          lc.status === 'Sent' ? 'bg-indigo-100 text-indigo-750' :
                          lc.status === 'In-Progress' ? 'bg-amber-100 text-amber-750' :
                          lc.status === 'Delivered' ? 'bg-teal-100 text-teal-750' :
                          'bg-emerald-100 text-emerald-750'
                        }`}>
                          {lc.status}
                        </span>

                        <div className="flex gap-2.5 font-bold">
                          {lc.status === 'Sent' && (
                            <button 
                              onClick={() => updateLabStatus(lc._id, 'In-Progress')}
                              className="text-brand-500 hover:underline cursor-pointer"
                            >
                              Start
                            </button>
                          )}
                          {(lc.status === 'Sent' || lc.status === 'In-Progress') && (
                            <button 
                              onClick={() => updateLabStatus(lc._id, 'Delivered')}
                              className="text-teal-600 dark:text-teal-405 hover:underline cursor-pointer"
                            >
                              Mark Received
                            </button>
                          )}
                          {lc.status === 'Delivered' && (
                            <button 
                              onClick={() => updateLabStatus(lc._id, 'Fitted')}
                              className="text-emerald-600 dark:text-emerald-450 hover:underline cursor-pointer"
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
                <div className="col-span-full py-12 text-center text-sm text-slate-400">
                  No laboratory cases recorded for this patient.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Treatment */}
      {showTreatmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Record Treatment Plan</h3>
            <form onSubmit={handleAddTreatment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Diagnosis / Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tooth sensitivity, Cavity in first molar"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Procedure *</label>
                  <select
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Root Canal">Root Canal</option>
                    <option value="Filling">Filling</option>
                    <option value="Scaling">Scaling</option>
                    <option value="Crown">Crown</option>
                    <option value="Implant">Implant</option>
                    <option value="Extraction">Extraction</option>
                    <option value="Braces">Braces</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Price Cost ($) *</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 h-20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTreatmentModal(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Record Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Write Prescription */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Write Drug Prescription</h3>
            <form onSubmit={handleAddPrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin 500mg, Ibuprofen 400mg"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Dosage *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 capsule, 2 drops"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Frequency *</label>
                  <select
                    value={medFrequency}
                    onChange={(e) => setMedFrequency(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Once daily">Once daily (OD)</option>
                    <option value="Twice daily">Twice daily (BD)</option>
                    <option value="Three times daily">Three times daily (TDS)</option>
                    <option value="Four times daily">Four times daily (QDS)</option>
                    <option value="As needed">As needed (PRN)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 days, 1 week"
                    value={medDuration}
                    onChange={(e) => setMedDuration(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Instructions</label>
                  <input
                    type="text"
                    value={medInstructions}
                    onChange={(e) => setMedInstructions(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Additional Notes</label>
                <textarea
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 h-20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Issue Rx Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Lab Dispatch */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Log Lab Dispatch</h3>
            <p className="text-xs text-slate-400 mb-4">Patient: <span className="font-bold">{patient.name}</span></p>

            <form onSubmit={handleAddLabCase} className="space-y-4">
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Dispatch Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={labCost}
                    onChange={(e) => setLabCost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Fabrication Notes</label>
                <textarea
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  placeholder="Shade A2, zirconia crown for molar tooth 19"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLabModal(false); setLabName(''); setExpectedDate(''); setLabCost(''); setLabNotes(''); }}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
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

export default PatientProfile;
