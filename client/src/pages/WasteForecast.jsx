import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Calendar, CalendarDays, BookOpen, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
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

const wasteEmojis = {
  'Plastic': '♻️', 'Paper/Cardboard': '📦', 'Glass': '🫙', 'Metal': '🥫',
  'Organic': '🥗', 'Battery/Special Waste': '🔋', 'E-waste': '💡', 'Other': '🗑️'
};

export default function WasteForecast() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const res = await axios.get('/api/dashboard');
          if (res.data?.lastAnalysis) {
             setData(res.data.lastAnalysis);
             setLoading(false);
             return;
          }
        } catch (e) {
          // Ignore API error for forecast if we have local data
        }
        
        const localData = localStorage.getItem('lastAnalysis');
        if (localData) {
          setData(JSON.parse(localData));
        }
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold">Loading forecast...</p>
      </div>
    );
  }

  if (!data || !data.products || data.products.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Forecast Available</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">We need a scanned receipt to generate a waste forecast.</p>
        <button onClick={() => navigate('/scan')} className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-lg transition-all">
          Scan a Receipt
        </button>
      </div>
    );
  }

  const products = data?.products || [];
  const predictedWaste = data?.predictedWaste || [];
  const pieData = predictedWaste.map(({ category, count }) => ({ name: category, value: count }));
  const barData = predictedWaste.map(({ category, count }) => ({ name: category, value: count }));

  const timeline = {
    short: products.filter(p => p.wasteCategory === 'Organic' || (p.name || '').toLowerCase().includes('milk') || (p.name || '').toLowerCase().includes('fresh')),
    medium: products.filter(p => p.wasteCategory === 'Plastic' || p.wasteCategory === 'Metal' || p.wasteCategory === 'Glass').filter(p => !((p.name || '').toLowerCase().includes('milk') || (p.name || '').toLowerCase().includes('fresh'))),
    long: products.filter(p => p.wasteCategory === 'Paper/Cardboard' || p.wasteCategory === 'Battery/Special Waste' || p.wasteCategory === 'E-waste' || p.wasteCategory === 'Other')
  };

  const calculateEcoScore = () => {
    const total = products.length;
    if (total === 0) return 0;
    const recyclables = products.filter(p => ['Paper/Cardboard', 'Glass', 'Metal', 'Plastic'].includes(p.wasteCategory)).length;
    return Math.max(20, Math.round((recyclables / total) * 100));
  };
  
  const ecoScore = calculateEcoScore();

  const timelineSteps = [
    { key: 'short', title: 'Next 1-3 Days', subtitle: 'Perishables and immediate consumption items', icon: Clock, color: 'emerald', emoji: '🥗', items: timeline.short },
    { key: 'medium', title: 'Next Few Days', subtitle: 'Beverages, snacks, and general plastics', icon: Calendar, color: 'blue', emoji: '🥤', items: timeline.medium },
    { key: 'long', title: 'Later', subtitle: 'Cardboard boxes, special items', icon: CalendarDays, color: 'amber', emoji: '📦', items: timeline.long }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Waste Forecast</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">This Week's Predicted Waste</h1>
        <p className="text-gray-400 mt-1 font-medium">Based on your recent purchases</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="animate-fade-in-up bg-white p-6 rounded-3xl shadow-sm border border-gray-100" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Waste Composition</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={wasteChartColors[entry.name] || wasteChartColors['Other']} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} items`, name]}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm font-semibold">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: wasteChartColors[entry.name] || wasteChartColors['Other'] }} />
                <span className="text-gray-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in-up bg-white p-6 rounded-3xl shadow-sm border border-gray-100" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Items by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fontSize: 11, fontWeight: 600}} />
                <YAxis allowDecimals={false} tick={{fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={wasteChartColors[entry.name] || wasteChartColors['Other']} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="animate-fade-in-up bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Personal Waste Plan</h2>
        </div>
        
        <div className="space-y-8 relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-200 via-blue-200 to-amber-200 hidden sm:block" />

          {timelineSteps.map((step, stepIdx) => {
            const Icon = step.icon;
            const bgColors = { emerald: 'bg-emerald-100', blue: 'bg-blue-100', amber: 'bg-amber-100' };
            const textColors = { emerald: 'text-emerald-600', blue: 'text-blue-600', amber: 'text-amber-600' };
            return (
              <div key={step.key} className="relative flex flex-col sm:flex-row gap-6">
                <div className={`flex-shrink-0 z-10 flex items-center justify-center w-12 h-12 rounded-2xl ${bgColors[step.color]} border-4 border-white shadow-md`}>
                  <Icon className={`w-5 h-5 ${textColors[step.color]}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 font-medium">{step.subtitle}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {step.items.length > 0 ? step.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <span className="text-xl">{wasteEmojis[item.wasteCategory] || step.emoji}</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{item.packaging || item.category}</p>
                        </div>
                      </div>
                    )) : <p className="text-sm text-gray-300 italic p-2 font-medium">No items predicted for this timeframe.</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Eco Score */}
        <div className="animate-fade-in-up bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between" style={{ animationDelay: '0.4s' }}>
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Trip Eco Score</h3>
            <p className="text-gray-400 text-sm max-w-[200px] leading-relaxed font-medium">Based on recyclable vs non-recyclable packaging.</p>
          </div>
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="40" stroke="url(#forecastGradient)" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * ecoScore) / 100} strokeLinecap="round" className="eco-score-circle" />
              <defs>
                <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-black text-gray-900">{ecoScore}</span>
              <span className="text-xs font-bold text-gray-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-lg text-white flex flex-col justify-center" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-xl font-black mb-2">Ready to dispose?</h3>
          <p className="text-emerald-100 mb-6 leading-relaxed">Learn exactly how to sort and recycle each item correctly.</p>
          <button 
            onClick={() => navigate('/disposal')}
            className="flex items-center justify-center gap-2 bg-white text-emerald-600 py-3.5 px-6 rounded-2xl font-bold hover:bg-gray-50 transition-colors w-full sm:w-auto shadow-md"
          >
            <BookOpen className="w-5 h-5" />
            View Disposal Guide
          </button>
        </div>
      </div>
    </div>
  );
}
