import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, BarChart3, BookOpen, MapPin, AlertTriangle, CheckCircle2, Sparkles, ArrowRight, ListTodo } from 'lucide-react';
import { getStateSummary, STATE_CONFIG, WASTE_STATES } from '../utils/wasteState';

const wasteConfig = {
  'Plastic': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', emoji: '♻️' },
  'Paper/Cardboard': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', emoji: '📦' },
  'Glass': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', emoji: '🫙' },
  'Metal': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-500', emoji: '🥫' },
  'Organic': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', emoji: '🥗' },
  'Battery/Special Waste': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', emoji: '🔋' },
  'E-waste': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', emoji: '💡' },
  'Other': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400', emoji: '🗑️' }
};

export default function ReceiptAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stateRefresh, setStateRefresh] = useState(0);

  const handleStateChange = useCallback(() => {
    setStateRefresh(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id === 'demo' || id === 'new') {
          const localData = localStorage.getItem('lastAnalysis');
          if (localData) {
            setData(JSON.parse(localData));
            setLoading(false);
            return;
          }
        }
        
        const response = await axios.get(`/api/receipts/${id}`);
        setData(response.data);
        localStorage.setItem('lastAnalysis', JSON.stringify(response.data));
      } catch (err) {
        console.error(err);
        const localData = localStorage.getItem('lastAnalysis');
        if (localData) {
          setData(JSON.parse(localData));
        } else {
          setError('Could not load analysis data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold">Analyzing your receipt...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <button onClick={() => navigate('/scan')} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-md">
          Try Scanning Again
        </button>
      </div>
    );
  }

  const products = data?.products || [];
  const predictedWaste = Array.isArray(data?.predictedWaste) 
    ? data.predictedWaste 
    : (data?.predictedWaste?.categories || []);
  const scanDate = data?.createdAt || data?.date || new Date().toISOString();
  const scanId = data?._id || id || 'local';
  const totalItems = products.length;
  const recyclableCount = products.filter(p => ['Plastic', 'Paper/Cardboard', 'Glass', 'Metal'].includes(p.wasteCategory)).length;
  const stateSummary = getStateSummary();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Analysis Complete</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">Receipt Analysis</h1>
        <p className="text-gray-400 mt-1 font-medium">Processed on {new Date(scanDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Row */}
      <div className="animate-fade-in-up grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-3xl font-black text-gray-900">{totalItems}</p>
          <p className="text-sm text-gray-500 font-medium">Products Found</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{recyclableCount}</p>
          <p className="text-sm text-gray-500 font-medium">Recyclable Items</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
          <p className="text-3xl font-black text-amber-600">{stateSummary[WASTE_STATES.GENERATED] || 0}</p>
          <p className="text-sm text-gray-500 font-medium">🗑️ New Items</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{stateSummary[WASTE_STATES.DISPOSED] || 0}</p>
          <p className="text-sm text-gray-500 font-medium">🎉 Disposed</p>
        </div>
      </div>

      {/* Product List */}
      <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8" style={{ animationDelay: '0.2s' }}>
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Identified Products</h2>
            <p className="text-xs text-gray-500">{products.length} items with packaging analysis</p>
          </div>
        </div>

        <div className="divide-y divide-gray-50 stagger-children">
          {products.map((product, idx) => {
            const config = wasteConfig[product.wasteCategory] || wasteConfig['Other'];
            const confidencePercent = Math.round(product.confidence * 100);
            
            let dynamicDaysRemaining = product.daysRemaining;
            let dynamicExpiryDate = product.expiryDate;
            if (product.daysRemaining !== undefined && scanDate) {
              dynamicExpiryDate = new Date(new Date(scanDate).getTime() + product.daysRemaining * 24 * 60 * 60 * 1000);
              const diffTime = dynamicExpiryDate.getTime() - new Date().getTime();
              dynamicDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            return (
              <div key={idx} className="hover:bg-gray-50/50 transition-colors">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-2xl">{config.emoji}</span>
                  <div className="w-full">
                    <h3 className="text-base font-bold text-gray-900">{product.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5" />
                        <span>{product.packaging || 'Unknown packaging'}</span>
                      </div>
                      
                      {product.storageCondition && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold ml-2">
                           <span>{product.storageCondition.toLowerCase().includes('refrigerat') ? '❄️' : product.storageCondition.toLowerCase().includes('frozen') ? '🧊' : '🌡️'}</span>
                           {product.storageCondition}
                        </div>
                      )}
                    </div>
                    
                    {dynamicDaysRemaining !== undefined && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                         <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${dynamicDaysRemaining <= 0 ? 'bg-red-50 text-red-700 border-red-200' : dynamicDaysRemaining <= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                           {product.isEstimatedExpiry ? '~ ' : ''}
                           {dynamicDaysRemaining < 0 ? 'Expired' : dynamicDaysRemaining === 0 ? 'Expires today' : `${dynamicDaysRemaining} days left`}
                           {dynamicExpiryDate && ` (Expires: ${new Date(dynamicExpiryDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})})`}
                           {product.isEstimatedExpiry && ' (estimated)'}
                         </span>
                      </div>
                    )}

                    {product.wasteStreams && product.wasteStreams.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {product.wasteStreams.map((stream, sIdx) => {
                          const streamConfig = wasteConfig[stream.wasteCategory] || wasteConfig['Other'];
                          const timingLabels = {
                            'immediate': { label: 'Dispose now', icon: '🔵' },
                            'on_consumption': { label: 'When consumed', icon: '🟡' },
                            'on_expiry': { label: 'If expired/spoiled', icon: '🔴' }
                          };
                          const timing = timingLabels[stream.timing] || { label: stream.timing, icon: '⚪' };
                          return (
                            <div key={sIdx} className="flex items-center gap-2 text-xs">
                              <span>{timing.icon}</span>
                              <span className="font-bold text-gray-700">{timing.label}:</span>
                              <span className="text-gray-600">{stream.type}</span>
                              <span className={`px-2 py-0.5 rounded-full font-bold border ${streamConfig.bg} ${streamConfig.text} ${streamConfig.border}`}>
                                {stream.wasteCategory}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                </div>
                
                <div className="flex items-center gap-3 pl-10 sm:pl-0 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
                    {product.wasteCategory}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          confidencePercent > 80 ? 'bg-emerald-500' : 
                          confidencePercent > 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-500 w-9">{confidencePercent}%</span>
                  </div>
                </div>
                </div>

                <div className="px-5 sm:px-6 pb-5">
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-emerald-100">
                    <ListTodo className="w-4 h-4" />
                    Added to Pending Tasks
                  </div>
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No products found on this receipt.
            </div>
          )}
        </div>
      </div>

      {/* Waste Summary */}
      <div className="animate-fade-in-up mb-10" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl font-black text-gray-900 mb-4">Waste Summary</h2>
        <div className="flex flex-wrap gap-3">
          {predictedWaste.map(({ category, count }) => {
            const config = wasteConfig[category] || wasteConfig['Other'];
            return (
              <div key={category} className={`flex items-center gap-3 px-5 py-3 rounded-2xl border font-medium ${config.bg} ${config.text} ${config.border} shadow-sm`}>
                <span className="text-lg">{config.emoji}</span>
                <span className="font-semibold">{category}</span>
                <span className="bg-white/60 px-2.5 py-0.5 rounded-lg text-sm font-black">{count}</span>
              </div>
            );
          })}
          {predictedWaste.length === 0 && (
            <p className="text-gray-400 font-medium">No waste categories identified.</p>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-xl font-black text-gray-900 mb-4">What's Next?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/forecast')}
            className="group flex flex-col items-center p-7 bg-white border border-gray-100 rounded-3xl hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
          >
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-8 h-8" />
            </div>
            <span className="font-bold text-gray-900 mb-1">Waste Forecast</span>
            <span className="text-xs text-gray-400 text-center">See timeline and impact</span>
            <ArrowRight className="w-4 h-4 text-gray-300 mt-3 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/tasks')}
            className="group flex flex-col items-center p-7 bg-white border border-gray-100 rounded-3xl hover:border-blue-300 hover:shadow-lg transition-all duration-300"
          >
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <ListTodo className="w-8 h-8" />
            </div>
            <span className="font-bold text-gray-900 mb-1">Pending Tasks</span>
            <span className="text-xs text-gray-400 text-center">Manage your waste items</span>
            <ArrowRight className="w-4 h-4 text-gray-300 mt-3 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/map')}
            className="group flex flex-col items-center p-7 bg-white border border-gray-100 rounded-3xl hover:border-rose-300 hover:shadow-lg transition-all duration-300"
          >
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-8 h-8" />
            </div>
            <span className="font-bold text-gray-900 mb-1">Find Centres</span>
            <span className="text-xs text-gray-400 text-center">Locate facilities on map</span>
            <ArrowRight className="w-4 h-4 text-gray-300 mt-3 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}
