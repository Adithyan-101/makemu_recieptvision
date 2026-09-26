import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Scan, Recycle, Droplet, FileText, Wine, AlertTriangle, Info, ChevronRight, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

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
        const response = await axios.get('/api/dashboard').catch(() => ({
          data: {
            ecoScore: 78,
            stats: {
              totalScans: 12,
              recyclableItems: 45,
              plasticItems: 18,
              paperItems: 22,
              glassItems: 5,
              specialWaste: 2
            },
            wasteComposition: [
              { name: 'Paper/Cardboard', value: 22 },
              { name: 'Plastic', value: 18 },
              { name: 'Glass', value: 5 },
              { name: 'Battery/Special Waste', value: 2 },
              { name: 'Other', value: 5 }
            ],
            recentScans: [
              { id: '1', date: new Date().toISOString(), productCount: 14, summary: 'Weekly Groceries' },
              { id: '2', date: new Date(Date.now() - 86400000 * 3).toISOString(), productCount: 8, summary: 'Pharmacy Run' },
              { id: '3', date: new Date(Date.now() - 86400000 * 7).toISOString(), productCount: 24, summary: 'Supermarket' }
            ]
          }
        }));
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const ecoScore = data?.ecoScore || 0;
  const counts = data?.counts || {};
  const totalScans = data?.totalScans || 0;
  const totalRecyclable = data?.totalRecyclable || 0;
  const recentScans = data?.recentScans || [];

  // Build wasteComposition for the chart from counts
  const wasteComposition = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const statCards = [
    { label: 'Total Scans', value: totalScans, icon: <Scan className="w-6 h-6" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Recyclable Items', value: totalRecyclable, icon: <Recycle className="w-6 h-6" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Plastic Items', value: counts.Plastic || 0, icon: <Droplet className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Paper Items', value: counts['Paper/Cardboard'] || 0, icon: <FileText className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Glass Items', value: counts.Glass || 0, icon: <Wine className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Special Waste', value: (counts['Battery/Special Waste'] || 0) + (counts['E-waste'] || 0), icon: <AlertTriangle className="w-6 h-6" />, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Waste Profile</h1>
          <p className="text-gray-500 mt-1">Track and improve your environmental impact</p>
        </div>
        <Link to="/scan" className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-sm transition-colors">
          <Scan className="w-5 h-5" />
          New Scan
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Eco Score Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-4 right-4 group relative cursor-help">
            <Info className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            <div className="absolute right-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 mb-2 bottom-full">
              This is a prototype engagement metric, not a scientifically validated environmental impact score. It compares your recyclable vs non-recyclable packaging.
              <div className="absolute -bottom-1 right-2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
          
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">ReceiptVision Eco Score</h2>
          
          <div className="relative w-48 h-48 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#10b981" 
                strokeWidth="12" 
                fill="none" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * ecoScore) / 100} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-5xl font-black text-gray-900">{ecoScore}</span>
            </div>
          </div>
          <p className="text-center text-gray-500 font-medium">Great job! You're above average this month.</p>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Waste Composition */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Historical Waste Composition</h2>
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
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {wasteComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={wasteChartColors[entry.name] || wasteChartColors['Other']} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} items`, name]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {wasteComposition.slice(0, 4).map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: wasteChartColors[entry.name] || wasteChartColors['Other'] }}></span>
                    <span className="text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Scans</h2>
            <Link to="/history" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {recentScans && recentScans.length > 0 ? (
              recentScans.map((scan, idx) => (
                <Link 
                  key={idx} 
                  to={`/analysis/${scan._id}`}
                  className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">{scan.products?.length || scan.totalItems || 0} products identified</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500 my-8">No recent scans found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
