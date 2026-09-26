import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Scan, Recycle, Droplet, FileText, Wine, AlertTriangle, Info, ChevronRight, ArrowUpRight, TrendingUp, Leaf } from 'lucide-react';
import axios from 'axios';
import { getStateSummary, STATE_CONFIG, STATE_ORDER, WASTE_STATES } from '../utils/wasteState';

const wasteChartColors = {
  'Plastic': '#3B82F6',
  'Paper/Cardboard': '#F59E0B',
  'Glass': '#8B5CF6',
  'Metal': '#6B7280',
  'Organic': '#10B981',
  'Battery/Special Waste': '#EF4444',
  'E-waste': '#F97316',
  'Other': '#9CA3AF'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/dashboard');
        setData(response.data);
      } catch (err) {
        console.error(err);
        // Fallback data
        setData({
          ecoScore: 0,
          totalScans: 0,
          totalRecyclable: 0,
          counts: {},
          recentScans: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold">Loading your profile...</p>
      </div>
    );
  }

  const ecoScore = data?.ecoScore || 0;
  const counts = data?.counts || {};
  const totalScans = data?.totalScans || 0;
  const totalRecyclable = data?.totalRecyclable || 0;
  const recentScans = data?.recentScans || [];

  const wasteComposition = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const hasData = totalScans > 0 || wasteComposition.length > 0;

  const statCards = [
    { label: 'Total Scans', value: totalScans, icon: Scan, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500 to-violet-500' },
    { label: 'Recyclable', value: totalRecyclable, icon: Recycle, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Plastic', value: counts.Plastic || 0, icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Paper', value: counts['Paper/Cardboard'] || 0, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500 to-orange-500' },
    { label: 'Glass', value: counts.Glass || 0, icon: Wine, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Special', value: (counts['Battery/Special Waste'] || 0) + (counts['E-waste'] || 0), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', gradient: 'from-red-500 to-rose-500' },
  ];

  // Eco score label
  const getScoreLabel = (score) => {
    if (score >= 80) return { text: 'Excellent!', color: 'text-emerald-600' };
    if (score >= 60) return { text: 'Great job!', color: 'text-emerald-600' };
    if (score >= 40) return { text: 'Good start', color: 'text-amber-600' };
    if (score > 0) return { text: 'Getting there', color: 'text-orange-600' };
    return { text: 'Scan to begin', color: 'text-gray-400' };
  };
  const scoreLabel = getScoreLabel(ecoScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider mb-1">Dashboard</p>
          <h1 className="text-3xl font-black text-gray-900">Your Waste Profile</h1>
          <p className="text-gray-400 mt-1 font-medium">Track and improve your environmental impact</p>
        </div>
        <Link to="/scan" className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <Scan className="w-5 h-5" />
          New Scan
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="animate-fade-in-up bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Welcome to ReceiptVision!</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">Scan your first receipt to start tracking your waste profile and eco score.</p>
          <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">
            <Scan className="w-5 h-5" />
            Scan Your First Receipt
          </Link>
        </div>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Eco Score Card */}
            <div className="animate-fade-in-up bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
              {/* Tooltip */}
              <div className="absolute top-4 right-4 group/tooltip cursor-help">
                <Info className="w-5 h-5 text-gray-300 hover:text-gray-500 transition-colors" />
                <div className="absolute right-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 mb-2 bottom-full leading-relaxed">
                  Prototype engagement metric comparing your recyclable vs non-recyclable packaging.
                  <div className="absolute -bottom-1.5 right-3 w-3 h-3 bg-gray-900 rotate-45" />
                </div>
              </div>
              
              <h2 className="text-base font-bold text-gray-900 mb-6 text-center">Eco Score</h2>
              
              <div className="relative w-48 h-48 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="url(#scoreGradient)" 
                    strokeWidth="10" 
                    fill="none" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * ecoScore) / 100} 
                    strokeLinecap="round"
                    className="eco-score-circle"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-black text-gray-900">{ecoScore}</span>
                  <span className="text-xs font-bold text-gray-400 mt-1">/ 100</span>
                </div>
              </div>
              <p className={`text-center font-bold ${scoreLabel.color}`}>{scoreLabel.text}</p>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 stagger-children">
              {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="animate-fade-in card-premium p-5 rounded-2xl flex flex-col justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-400 font-semibold">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Waste State Progress */}
          {getStateSummary().total > 0 && (
            <div className="animate-fade-in-up bg-white rounded-3xl p-6 shadow-sm border border-gray-100" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Recycle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Waste Processing</h2>
                  <p className="text-xs text-gray-400 font-medium">Track your waste through Pile Up → Clean → Ready</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATE_ORDER.map(state => {
                  const config = STATE_CONFIG[state];
                  const summary = getStateSummary();
                  return (
                    <div key={state} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${config.bg} ${config.border}`}>
                      <span className="text-2xl">{config.emoji}</span>
                      <div>
                        <p className={`text-xl font-black ${config.text}`}>{summary[state]}</p>
                        <p className="text-[11px] font-bold text-gray-500">{config.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Waste Composition */}
            <div className="animate-fade-in-up bg-white p-6 rounded-3xl shadow-sm border border-gray-100" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Waste Composition</h2>
              </div>
              {wasteComposition && wasteComposition.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wasteComposition}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {wasteComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={wasteChartColors[entry.name] || wasteChartColors['Other']} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} items`, name]}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {wasteComposition.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs font-semibold">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: wasteChartColors[entry.name] || wasteChartColors['Other'] }} />
                        <span className="text-gray-500">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-gray-300 gap-2">
                  <TrendingUp className="w-10 h-10" />
                  <p className="font-semibold">No data yet</p>
                </div>
              )}
            </div>

            {/* Recent Scans */}
            <div className="animate-fade-in-up bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Scan className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Scans</h2>
                </div>
                <Link to="/history" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-3 stagger-children">
                {recentScans && recentScans.length > 0 ? (
                  recentScans.map((scan, idx) => (
                    <Link 
                      key={idx} 
                      to={`/analysis/${scan._id}`}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                          <Scan className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">
                            {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">{scan.products?.length || scan.totalItems || 0} products</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                    </Link>
                  ))
                ) : (
                  <div className="text-center text-gray-300 my-8 flex flex-col items-center gap-2">
                    <Scan className="w-10 h-10" />
                    <p className="font-semibold">No scans yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
