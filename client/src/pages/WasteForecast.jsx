import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Calendar, CalendarDays, BookOpen, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const wasteChartColors = {
  'Plastic': '#3B82F6', // blue
  'Paper/Cardboard': '#F59E0B', // amber
  'Glass': '#8B5CF6', // purple
  'Metal': '#6B7280', // gray
  'Organic': '#10B981', // green
  'Battery/Special Waste': '#EF4444', // red
  'E-waste': '#F97316', // orange
  'Other': '#9CA3AF' // gray-400
};

export default function WasteForecast() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get from API first, fallback to local storage
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.products || data.products.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Forecast Available</h2>
        <p className="text-gray-600 mb-6">We need a scanned receipt to generate a forecast.</p>
        <button onClick={() => navigate('/scan')} className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600">
          Scan a Receipt
        </button>
      </div>
    );
  }

  const products = data?.products || [];
  const predictedWaste = data?.predictedWaste || [];

  // Prepare chart data from predictedWaste array
  const pieData = predictedWaste.map(({ category, count }) => ({ name: category, value: count }));
  const barData = predictedWaste.map(({ category, count }) => ({ name: category, value: count }));

  // Prepare timeline data
  const timeline = {
    short: products.filter(p => p.wasteCategory === 'Organic' || (p.name || '').toLowerCase().includes('milk') || (p.name || '').toLowerCase().includes('fresh')),
    medium: products.filter(p => p.wasteCategory === 'Plastic' || p.wasteCategory === 'Metal' || p.wasteCategory === 'Glass').filter(p => !((p.name || '').toLowerCase().includes('milk') || (p.name || '').toLowerCase().includes('fresh'))),
    long: products.filter(p => p.wasteCategory === 'Paper/Cardboard' || p.wasteCategory === 'Battery/Special Waste' || p.wasteCategory === 'E-waste' || p.wasteCategory === 'Other')
  };

  // Mock Eco Score calculation (just for display)
  const calculateEcoScore = () => {
    const total = products.length;
    if (total === 0) return 0;
    const recyclables = products.filter(p => ['Paper/Cardboard', 'Glass', 'Metal', 'Plastic'].includes(p.wasteCategory)).length;
    const score = Math.round((recyclables / total) * 100);
    return Math.max(20, score);
  };
  
  const ecoScore = calculateEcoScore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">This Week's Predicted Waste</h1>
        <p className="text-gray-500 mt-1">Based on your recent purchases</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Composition Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Waste Composition</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={wasteChartColors[entry.name] || wasteChartColors['Other']} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} items`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: wasteChartColors[entry.name] || wasteChartColors['Other'] }}></span>
                <span className="text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Items by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Personal Waste Plan</h2>
        
        <div className="space-y-8 relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200 hidden sm:block"></div>

          {/* Short term */}
          <div className="relative flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 border-4 border-white shadow-sm">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Next 1-3 Days</h3>
              <p className="text-sm text-gray-500 mb-4">Perishables and immediate consumption items</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {timeline.short.length > 0 ? timeline.short.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xl">🥗</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-400 italic p-2">No items predicted for this timeframe.</p>}
              </div>
            </div>
          </div>

          {/* Medium term */}
          <div className="relative flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 border-4 border-white shadow-sm">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Next Few Days</h3>
              <p className="text-sm text-gray-500 mb-4">Beverages, snacks, and general plastics</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {timeline.medium.length > 0 ? timeline.medium.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xl">🥤</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-400 italic p-2">No items predicted for this timeframe.</p>}
              </div>
            </div>
          </div>

          {/* Long term */}
          <div className="relative flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 border-4 border-white shadow-sm">
              <CalendarDays className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Later</h3>
              <p className="text-sm text-gray-500 mb-4">Cardboard boxes, special items</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {timeline.long.length > 0 ? timeline.long.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xl">📦</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-400 italic p-2">No items predicted for this timeframe.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Eco Score */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trip Eco Score</h3>
            <p className="text-gray-500 text-sm max-w-[200px]">Based on the ratio of recyclable to non-recyclable packaging.</p>
          </div>
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * ecoScore) / 100} className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-black text-gray-900">{ecoScore}</span>
              <span className="text-xs font-bold text-gray-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Next Step */}
        <div className="bg-emerald-500 p-8 rounded-2xl shadow-sm text-white flex flex-col justify-center">
          <h3 className="text-xl font-bold mb-2">Ready to dispose?</h3>
          <p className="text-emerald-100 mb-6">Learn exactly how to sort and recycle each of these items correctly.</p>
          <button 
            onClick={() => navigate('/disposal')}
            className="flex items-center justify-center gap-2 bg-white text-emerald-600 py-3 px-6 rounded-xl font-bold hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            <BookOpen className="w-5 h-5" />
            View Disposal Guide
          </button>
        </div>
      </div>
    </div>
  );
}
