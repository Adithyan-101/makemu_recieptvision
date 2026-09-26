import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, BarChart3, BookOpen, MapPin, AlertTriangle } from 'lucide-react';

const wasteColors = {
  'Plastic': 'bg-blue-100 text-blue-800 border-blue-200',
  'Paper/Cardboard': 'bg-amber-100 text-amber-800 border-amber-200',
  'Glass': 'bg-purple-100 text-purple-800 border-purple-200',
  'Metal': 'bg-gray-100 text-gray-800 border-gray-300',
  'Organic': 'bg-green-100 text-green-800 border-green-200',
  'Battery/Special Waste': 'bg-red-100 text-red-800 border-red-200',
  'E-waste': 'bg-orange-100 text-orange-800 border-orange-200',
  'Other': 'bg-gray-100 text-gray-600 border-gray-200'
};

export default function ReceiptAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        // Fallback to local storage if API fails but we have data
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading analysis...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/scan')} className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600">
          Try Scanning Again
        </button>
      </div>
    );
  }

  const products = data?.products || [];
  const predictedWaste = data?.predictedWaste || [];
  const scanDate = data?.createdAt || data?.date || new Date().toISOString();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Receipt Analysis</h1>
        <p className="text-gray-500 mt-1">Processed on {new Date(scanDate).toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
            <Package className="w-4 h-4" />
            {products.length} products identified
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {products.map((product, idx) => (
            <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>{product.packaging || 'Unknown packaging'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${wasteColors[product.wasteCategory] || wasteColors['Other']}`}>
                  {product.wasteCategory}
                </span>
                
                <div className={`px-2 py-1 rounded text-xs font-bold text-white ${
                  product.confidence > 0.8 ? 'bg-green-500' : 
                  product.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`} title={`Confidence: ${(product.confidence * 100).toFixed(0)}%`}>
                  {(product.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No products found on this receipt.
            </div>
          )}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Waste Summary</h2>
        <div className="flex flex-wrap gap-3">
          {predictedWaste.map(({ category, count }) => (
            <div key={category} className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium ${wasteColors[category] || wasteColors['Other']}`}>
              <span>{category}</span>
              <span className="bg-white/50 px-2 py-0.5 rounded-md text-sm">{count}</span>
            </div>
          ))}
          {predictedWaste.length === 0 && (
            <p className="text-gray-500">No waste categories identified.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/forecast')}
          className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-8 h-8" />
          </div>
          <span className="font-bold text-gray-900">View Waste Forecast</span>
          <span className="text-sm text-gray-500 mt-1 text-center">See timeline and impact</span>
        </button>

        <button
          onClick={() => navigate('/disposal')}
          className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-8 h-8" />
          </div>
          <span className="font-bold text-gray-900">Disposal Guide</span>
          <span className="text-sm text-gray-500 mt-1 text-center">How to recycle correctly</span>
        </button>

        <button
          onClick={() => navigate('/map')}
          className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-red-500 hover:shadow-md transition-all group"
        >
          <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <MapPin className="w-8 h-8" />
          </div>
          <span className="font-bold text-gray-900">Find Nearby Centres</span>
          <span className="text-sm text-gray-500 mt-1 text-center">Locate facilities on map</span>
        </button>
      </div>
    </div>
  );
}
