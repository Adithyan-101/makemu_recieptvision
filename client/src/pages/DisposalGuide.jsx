import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Recycle, Trash2, BatteryWarning, Monitor, MapPin, AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

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
          if (parsed.predictedWaste && parsed.predictedWaste.length > 0) {
            setWasteCategories(parsed.predictedWaste.map(w => w.category));
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Disposal Guide</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">How to Dispose</h1>
        <p className="text-gray-400 mt-1 font-medium">Proper disposal methods for your predicted waste</p>
      </div>

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
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isSpecial ? 'bg-red-50' : 'bg-emerald-50'} shadow-sm`}>
                    <span className="text-2xl">{config.emoji}</span>
                  </div>
                  <div>
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
                    {rule.instructions.map((inst, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-black mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 text-sm font-medium leading-relaxed">{inst}</span>
                      </li>
                    ))}
                  </ol>

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
