import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, HelpCircle, LogOut, Calendar, ChevronRight, Scan, Leaf, Trash2, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { getStateSummary, STATE_CONFIG, STATE_ORDER, WASTE_STATES } from '../utils/wasteState';

export default function Profile() {
  const [dashboardData, setDashboardData] = useState(null);
  const [stateSummary, setStateSummary] = useState(getStateSummary());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/dashboard');
        setDashboardData(res.data);
        setStateSummary(getStateSummary(res.data.totalItems));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchDashboard();
  }, []);

  const ecoScore = dashboardData?.ecoScore || 0;
  const totalScans = dashboardData?.totalScans || 0;
  const firstScanDate = dashboardData?.recentScans?.length > 0
    ? new Date(dashboardData.recentScans[dashboardData.recentScans.length - 1]?.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Just started';

  const handleResetStates = () => {
    localStorage.removeItem('wasteStates');
    setStateSummary(getStateSummary());
    setShowResetConfirm(false);
  };

  // Eco score label
  const getScoreLabel = (score) => {
    if (score >= 80) return { text: 'Excellent!', color: 'text-emerald-100' };
    if (score >= 60) return { text: 'Great job!', color: 'text-emerald-100' };
    if (score >= 40) return { text: 'Good start', color: 'text-emerald-100' };
    if (score > 0) return { text: 'Getting there', color: 'text-emerald-100' };
    return { text: 'Scan to begin', color: 'text-emerald-200' };
  };
  const scoreLabel = getScoreLabel(ecoScore);

  const totalTracked = stateSummary.total;
  const totalDisposed = stateSummary[WASTE_STATES.DISPOSED] || 0;
  const progressPercent = totalTracked > 0 ? Math.round((totalDisposed / totalTracked) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in mb-8">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Account</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">Profile</h1>
      </div>
      
      <div className="space-y-6">
        {/* User Info Card */}
        <div className="animate-fade-in-up bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <span className="text-3xl font-black">D</span>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-black text-gray-900">Demo User</h2>
            <div className="mt-3 space-y-2">
              <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 font-medium">
                <Mail className="w-4 h-4" /> demo@receiptvision.app
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-sm font-medium">
                <Calendar className="w-4 h-4" /> Since {firstScanDate}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-sm font-medium">
                <Scan className="w-4 h-4" /> {totalScans} receipt{totalScans !== 1 ? 's' : ''} scanned
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eco Score */}
          <div className="animate-fade-in-up bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-lg text-white flex flex-col justify-center items-center text-center" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-bold text-emerald-100 mb-1">Current Eco Score</h3>
            <div className="text-6xl font-black mb-2">{ecoScore}</div>
            <p className={`text-sm font-bold ${scoreLabel.color}`}>{scoreLabel.text}</p>
            <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors backdrop-blur-sm border border-white/10">
              View Dashboard
            </Link>
          </div>

          {/* Waste Processing Progress */}
          <div className="animate-fade-in-up bg-white rounded-3xl p-8 shadow-sm border border-gray-100" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-gray-900">Waste Progress</h3>
            </div>

            {totalTracked > 0 ? (
              <>
                {/* Overall progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-500">Items disposed</span>
                    <span className="font-black text-emerald-600">{totalDisposed}/{totalTracked}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-1">{progressPercent}% complete</p>
                </div>

                {/* State breakdown */}
                <div className="grid grid-cols-2 gap-2">
                  {STATE_ORDER.map(state => {
                    const config = STATE_CONFIG[state];
                    return (
                      <div key={state} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${config.bg} ${config.border}`}>
                        <span className="text-lg">{config.emoji}</span>
                        <div>
                          <p className={`text-sm font-black ${config.text}`}>{stateSummary[state] || 0}</p>
                          <p className="text-[10px] font-bold text-gray-500">{config.shortLabel}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm font-medium">No items tracked yet.</p>
                <p className="text-gray-300 text-xs mt-1">Scan a receipt to start tracking waste.</p>
              </div>
            )}
          </div>
        </div>

        {/* About Eco Score */}
        <div className="animate-fade-in-up bg-white rounded-3xl p-8 shadow-sm border border-gray-100" style={{ animationDelay: '0.35s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-black text-gray-900">About Eco Score</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            The ReceiptVision Eco Score is a prototype engagement metric designed to encourage sustainable purchasing habits. It compares recyclable materials to hard-to-recycle materials in your scanned receipts.
          </p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            *Not a scientifically validated metric
          </p>
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" style={{ animationDelay: '0.4s' }}>
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Quick Actions</h3>
          </div>
          <div className="divide-y divide-gray-50">
            <Link to="/scan" className="w-full flex items-center justify-between p-5 hover:bg-emerald-50/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Scan className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-900">Scan New Receipt</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </Link>

            <Link to="/history" className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-gray-100 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-900">View Scan History</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
            
            <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-gray-100 transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-900">Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            {/* Reset Waste States */}
            {totalTracked > 0 && (
              <div className="p-5">
                {showResetConfirm ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-red-800">Reset all waste tracking?</p>
                      <p className="text-xs text-red-600 mt-0.5">This clears all Pile Up / Cleaned / Ready states.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleResetStates}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center justify-between hover:bg-amber-50 -m-5 p-5 transition-colors group rounded-b-3xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-amber-50 rounded-xl text-amber-500 group-hover:bg-amber-100 transition-colors">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 block">Reset Waste Tracking</span>
                        <span className="text-xs text-gray-400">Clear all Pile Up / Cleaned / Ready states</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </button>
                )}
              </div>
            )}

            <button className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors text-red-600 group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-50 rounded-xl text-red-400 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="font-semibold">Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center pt-6 pb-4 flex items-center justify-center gap-2">
          <Leaf className="w-4 h-4 text-gray-300" />
          <p className="text-sm text-gray-400 font-bold">ReceiptVision v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
