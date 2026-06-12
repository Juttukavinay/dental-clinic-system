import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiClient } from '../utils/api';
import { BarChart3, TrendingUp, Users, ShieldAlert, Award } from 'lucide-react';

const Reports = () => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [financials, setFinancials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [demographics, setDemographics] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // 1. Revenue Report
      if (user.role === 'Admin' || user.role === 'Accountant') {
        const revData = await apiClient('/reports/revenue');
        setFinancials(revData.monthlyRevenue || []);
        setPayments(revData.paymentMethods || []);
      }

      // 2. Patient Report
      if (user.role === 'Admin' || user.role === 'Receptionist') {
        const patData = await apiClient('/reports/patients');
        setDemographics(patData.demographics || null);
      }

      // 3. Treatment Report
      if (user.role === 'Admin' || user.role === 'Dentist') {
        const trData = await apiClient('/reports/treatments');
        setProcedures(trData.procedureStats || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  // Find max value in an array for scaling bars
  const getMax = (arr, key) => {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map(item => item[key] || 1));
  };

  const maxProcedureCount = getMax(procedures, 'count');
  const maxMonthlyRevenue = getMax(financials, 'revenue');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Clinic Analytics & Reports</h1>
        <p className="text-sm text-slate-500">Aggregated database insights regarding revenue, patients, and clinical performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Billing Revenue Monthly (Admin, Accountant only) */}
        {(user.role === 'Admin' || user.role === 'Accountant') && (
          <div className="glass-panel rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-emerald-500" />
              <span>Monthly Gross Billings</span>
            </h3>
            
            <div className="space-y-4">
              {financials.length > 0 ? (
                financials.map((month) => {
                  const percent = (month.revenue / maxMonthlyRevenue) * 100;
                  return (
                    <div key={month._id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-400">{month._id}</span>
                        <span className="text-slate-850 dark:text-white">${month.revenue.toFixed(2)}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Paid: ${month.collected.toFixed(2)}</span>
                        <span>Outstanding: ${month.outstanding.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No revenue records found.</p>
              )}
            </div>
          </div>
        )}

        {/* Card 2: Treatment & Procedures Distribution (Admin, Dentist only) */}
        {(user.role === 'Admin' || user.role === 'Dentist') && (
          <div className="glass-panel rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award size={16} className="text-brand-500" />
              <span>Common Dental Procedures</span>
            </h3>

            <div className="space-y-4">
              {procedures.length > 0 ? (
                procedures.map((proc) => {
                  const percent = (proc.count / maxProcedureCount) * 100;
                  return (
                    <div key={proc._id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-400">{proc._id}</span>
                        <span className="text-slate-850 dark:text-white">{proc.count} cases (${proc.revenue} billed)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-500 to-sky-450 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No procedure records found.</p>
              )}
            </div>
          </div>
        )}

        {/* Card 3: Patient Age Demographics (Admin, Receptionist only) */}
        {(user.role === 'Admin' || user.role === 'Receptionist') && demographics && (
          <div className="glass-panel rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Users size={16} className="text-blue-500" />
              <span>Patient Age Buckets</span>
            </h3>

            <div className="space-y-3 text-xs">
              {demographics.ageBuckets && demographics.ageBuckets.length > 0 ? (
                demographics.ageBuckets.map((bucket, i) => {
                  let bucketName = '';
                  switch (bucket._id) {
                    case 0: bucketName = 'Children (0-12 yrs)'; break;
                    case 13: bucketName = 'Teens (13-19 yrs)'; break;
                    case 20: bucketName = 'Young Adults (20-34 yrs)'; break;
                    case 35: bucketName = 'Adults (35-54 yrs)'; break;
                    default: bucketName = 'Seniors (55+ yrs)'; break;
                  }
                  return (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="font-medium text-slate-600 dark:text-slate-450">{bucketName}</span>
                      <span className="font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{bucket.count} patients</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No demographic records found.</p>
              )}
            </div>
          </div>
        )}

        {/* Card 4: Patient Gender Distribution (Admin, Receptionist only) */}
        {(user.role === 'Admin' || user.role === 'Receptionist') && demographics && (
          <div className="glass-panel rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Users size={16} className="text-purple-500" />
              <span>Patient Gender Demographics</span>
            </h3>

            <div className="space-y-4">
              {demographics.genderDistribution && demographics.genderDistribution.length > 0 ? (
                demographics.genderDistribution.map((genderObj, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-600 dark:text-slate-455">{genderObj._id}</span>
                      <span className="text-slate-800 dark:text-white">{genderObj.count} patients</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                        style={{ width: `${(genderObj.count / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No gender records found.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
