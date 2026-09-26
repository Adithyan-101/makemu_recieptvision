import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Recycle, Trash2, BatteryWarning, Monitor, MapPin, AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Sparkles, BookOpen, Check } from 'lucide-react';
import { getStateSummary, STATE_CONFIG, WASTE_STATES, getWasteState, setWasteState, getFlowSteps, getProductKey, needsCleaning } from '../utils/wasteState';

const categoryConfig = {
  'Plastic': { icon: Recycle, color: 'emerald', emoji: '♻️' },
  'Paper/Cardboard': { icon: Recycle, color: 'emerald', emoji: '📦' },
  'Glass': { icon: Recycle, color: 'emerald', emoji: '🫙' },
  'Metal': { icon: Recycle, color: 'emerald', emoji: '🥫' },
  'Organic': { icon: Recycle, color: 'emerald', emoji: '🥗' },
  'Battery/Special Waste': { icon: BatteryWarning, color: 'red', emoji: '🔋' },
  'E-waste': { icon: Monitor, color: 'orange', emoji: '💡' },
  'Other': { icon: Trash2, color: 'gray', emoji: '🗑️' }
};

export default function DisposalGuide() {
  const navigate = useNavigate();
  const [wasteCategories, setWasteCategories] = useState([]);
  const [rules, setRules] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [scanId, setScanId] = useState('local');
  const [stateRefresh, setStateRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rulesRes = await axios.get('/api/waste-rules').catch(() => ({ data: [] }));
        let allRules = rulesRes.data;
        
        if (!allRules || allRules.length === 0) {
          allRules = [
            { category: 'Plastic', isRecyclable: true, method: 'Blue Bin (Recycling)', instructions: ['Rinse container thoroughly', 'Remove caps and lids', 'Check bottom for recycling number'], warning: 'Do not bag recyclables in plastic bags.' },
            { category: 'Paper/Cardboard', isRecyclable: true, method: 'Blue Bin (Recycling)', instructions: ['Flatten all cardboard boxes', 'Ensure paper is clean and dry', 'Remove tape and shipping labels'], warning: 'Greasy pizza boxes are not recyclable.' },
            { category: 'Glass', isRecyclable: true, method: 'Glass Bin / Drop-off', instructions: ['Rinse completely', 'Remove metal/plastic lids', 'Sort by color if required'], warning: 'Broken glass, mirrors, and lightbulbs cannot go in regular glass recycling.' },
            { category: 'Metal', isRecyclable: true, method: 'Blue Bin (Recycling)', instructions: ['Rinse food residue', 'Tuck tin can lids inside the can', 'Crush aluminum cans to save space'], warning: null },
            { category: 'Organic', isRecyclable: true, method: 'Green Bin (Compost)', instructions: ['Scrape food waste directly into green bin', 'Use only certified compostable bags', 'Include soiled paper towels and coffee grounds'], warning: 'No plastics, even if labelled "biodegradable".' },
            { category: 'Battery/Special Waste', isRecyclable: false, method: 'Specialized Drop-off Only', instructions: ['Tape terminals of lithium and button batteries', 'Store in a cool, dry place until disposal', 'Take to a designated battery drop-off location'], warning: 'FIRE HAZARD: Never put batteries in regular garbage or recycling bins.' },
            { category: 'E-waste', isRecyclable: false, method: 'Electronic Recycling Center', instructions: ['Wipe all personal data from devices', 'Remove batteries if easily accessible', 'Bring cords and chargers along with the device'], warning: 'Contains toxic heavy metals. Illegal to dispose of in regular trash in many jurisdictions.' },
            { category: 'Other', isRecyclable: false, method: 'Black Bin (Garbage)', instructions: ['Place in regular trash bag', 'Tie securely'], warning: null }
          ];
        }
        
        setRules(allRules);

        const localData = localStorage.getItem('lastAnalysis');
        if (localData) {
          const parsed = JSON.parse(localData);
          const prods = (parsed.products || []).map((p, idx) => ({ ...p, index: idx }));
          setProducts(prods);
          setScanId(parsed._id || 'local');
          
          const predictedWaste = Array.isArray(parsed.predictedWaste)
            ? parsed.predictedWaste
            : (parsed.predictedWaste?.categories || []);
            
          if (predictedWaste.length > 0) {
            setWasteCategories(predictedWaste.map(w => w.category));
          } else {
            setWasteCategories(allRules.map(r => r.category));
          }
        } else {
          setWasteCategories(allRules.map(r => r.category));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (category) => {
    setExpanded(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Get state counts per category
  const getCategoryStateCounts = useCallback((category) => {
    const categoryProducts = products.filter(p => p.wasteCategory === category);
    const counts = { generated: 0, disposed: 0, total: categoryProducts.length };
    
    categoryProducts.forEach(p => {
      const key = getProductKey(p.name, scanId, p.index);
      const state = getWasteState(key);
      if (counts[state] !== undefined) counts[state]++;
    });
    
    return counts;
  }, [products, stateRefresh]);

  // Batch mark all generated items as disposed
  const markAllDisposed = useCallback((category) => {
    const categoryProducts = products.filter(p => p.wasteCategory === category);
    categoryProducts.forEach(p => {
      const key = getProductKey(p.name, scanId, p.index);
      const state = getWasteState(key);
      if (state === WASTE_STATES.GENERATED) {
        setWasteState(key, WASTE_STATES.DISPOSED);
      }
    });
    setStateRefresh(prev => prev + 1);
  }, [products]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold">Loading disposal guide...</p>
      </div>
    );
  }

  const displayRules = rules.filter(r => 
    wasteCategories.length === 0 || wasteCategories.includes(r.category)
  );

  // Overall new count
  const totalNew = products.filter(p => {
    const key = getProductKey(p.name, scanId);
    return getWasteState(key) === WASTE_STATES.GENERATED;
  }).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Disposal Guide</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">How to Dispose</h1>
        <p className="text-gray-400 mt-1 font-medium">Proper disposal methods for your predicted waste. (Disposed items won't show in active counts)</p>
      </div>

      {/* Pending Banner */}
      {totalNew > 0 && (
        <div className="animate-fade-in-up bg-emerald-50 border border-emerald-200 p-5 rounded-2xl mb-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-black text-emerald-800">
              {totalNew} item{totalNew !== 1 ? 's' : ''} to dispose!
            </p>
            <p className="text-sm text-emerald-600 font-medium mt-0.5">
              Review instructions below and mark items as disposed when done.
            </p>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <MapPin className="w-4 h-4" />
            Find Facility
          </button>
        </div>
      )}

      {wasteCategories.length > 0 && wasteCategories.length < rules.length && (
        <div className="animate-fade-in bg-emerald-50 text-emerald-800 p-4 rounded-2xl mb-8 flex gap-3 border border-emerald-100">
          <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">This guide is customized based on your recent receipt scan.</p>
        </div>
      )}

      <div className="space-y-4 stagger-children">
        {displayRules.map((rule, idx) => {
          const isSpecial = rule.category === 'Battery/Special Waste' || rule.category === 'E-waste';
          const isExpanded = expanded[rule.category] !== false;
          const config = categoryConfig[rule.category] || categoryConfig['Other'];
          const Icon = config.icon;
          const stateCounts = getCategoryStateCounts(rule.category);
          const hasItems = stateCounts.total > 0;
          const canClean = needsCleaning(rule.category);

          const borderColor = isSpecial 
            ? (rule.category === 'E-waste' ? 'border-orange-200 hover:border-orange-300' : 'border-red-200 hover:border-red-300')
            : 'border-gray-100 hover:border-emerald-200';

          return (
            <div 
              key={idx} 
              className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 ${borderColor} overflow-hidden`}
            >
              <button 
                onClick={() => toggleExpand(rule.category)}
                className={`w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors ${
                  isExpanded ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-2xl ${isSpecial ? 'bg-red-50' : 'bg-emerald-50'} shadow-sm`}>
                    <span className="text-2xl">{config.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-gray-900">{rule.category}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {(rule.recyclable || rule.isRecyclable) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          ♻️ Recyclable
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                          {isSpecial ? '⚠️ Special Disposal' : '🗑️ Non-recyclable'}
                        </span>
                      )}
                      <span className="text-sm text-gray-400 flex items-center gap-1 font-medium">
                        <ArrowRight className="w-3 h-3" /> {rule.disposalMethod || rule.method}
                      </span>
                    </div>

                    {/* State counts per category */}
                    {hasItems && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {stateCounts.generated > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            🗑️ {stateCounts.generated} new
                          </span>
                        )}
                        {stateCounts.disposed > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-200">
                            🎉 {stateCounts.disposed} done
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-gray-100 text-gray-600' : 'text-gray-300'}`}>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-gray-50/30 animate-fade-in">
                  {rule.warning && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-amber-800">{rule.warning}</p>
                    </div>
                  )}

                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Instructions</h3>
                  <ol className="space-y-3 mb-6">
                    {rule.instructions.map((inst, i) => {
                      // Grey out cleaning instructions if all items are disposed
                      const allCleaned = hasItems && stateCounts.generated === 0;
                      const dimmed = allCleaned;
                      
                      return (
                        <li key={i} className={`flex items-start gap-3 ${dimmed ? 'opacity-40' : ''}`}>
                          <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 ${
                            dimmed ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {dimmed ? <Check className="w-3 h-3" /> : i + 1}
                          </span>
                          <span className="text-gray-700 text-sm font-medium leading-relaxed">
                            {inst}
                            {dimmed && <span className="text-emerald-600 ml-1 text-xs font-bold"> — Done!</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Batch action buttons */}
                  {hasItems && (
                    <div className="flex flex-wrap gap-3 mb-6 pt-4 border-t border-gray-200">
                      {stateCounts.generated > 0 && (
                        <button
                          onClick={() => markAllDisposed(rule.category)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                        >
                          🎉 Mark All Disposed ({stateCounts.generated})
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/map?category=${encodeURIComponent(rule.category)}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Find Nearby Facilities
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
