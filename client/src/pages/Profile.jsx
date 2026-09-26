import { Link } from 'react-router-dom';
import { User, Mail, Shield, Settings, HelpCircle, LogOut, Calendar, ChevronRight, Scan, Leaf } from 'lucide-react';

export default function Profile() {
  const user = {
    name: 'Demo User',
    email: 'demo@receiptvision.app',
    joinedDate: 'October 2023',
    ecoScore: 78
  };

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
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
              DEMO MODE
            </span>
          </div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <span className="text-3xl font-black">{user.name.charAt(0)}</span>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
            <div className="mt-3 space-y-2">
              <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 font-medium">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-sm font-medium">
                <Calendar className="w-4 h-4" /> Joined {user.joinedDate}
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
              <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-bold transition-colors">
                Edit Profile
              </button>
              <button className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-bold transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eco Score Mini */}
          <div className="animate-fade-in-up bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-lg text-white flex flex-col justify-center items-center text-center" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-bold text-emerald-100 mb-1">Current Eco Score</h3>
            <div className="text-6xl font-black mb-2">{user.ecoScore}</div>
            <p className="text-sm text-emerald-100 max-w-[200px] leading-relaxed">Keep scanning and recycling to improve!</p>
            <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors backdrop-blur-sm border border-white/10">
              View Dashboard
            </Link>
          </div>

          {/* About Eco Score */}
          <div className="animate-fade-in-up bg-white rounded-3xl p-8 shadow-sm border border-gray-100" style={{ animationDelay: '0.3s' }}>
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
                  <Settings className="w-5 h-5" />
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
