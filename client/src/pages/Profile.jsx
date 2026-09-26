import { User, Mail, Shield, Settings, HelpCircle, LogOut } from 'lucide-react';

export default function Profile() {
  const user = {
    name: 'Demo User',
    email: 'demo@receiptvision.app',
    joinedDate: 'October 2023',
    ecoScore: 78
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      
      <div className="space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              DEMO MODE
            </span>
          </div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-inner flex-shrink-0">
            <span className="text-3xl font-bold">{user.name.charAt(0)}</span>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="mt-2 space-y-2">
              <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm">
                <CalendarIcon className="w-4 h-4" /> Joined {user.joinedDate}
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors">
                Edit Profile
              </button>
              <button className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eco Score Mini */}
          <div className="bg-emerald-500 rounded-3xl p-8 shadow-sm text-white flex flex-col justify-center items-center text-center">
            <h3 className="font-medium text-emerald-100 mb-1">Current Eco Score</h3>
            <div className="text-6xl font-black mb-2">{user.ecoScore}</div>
            <p className="text-sm text-emerald-100 max-w-[200px]">Keep scanning and recycling properly to improve your score!</p>
          </div>

          {/* About Eco Score */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">About Eco Score</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              The ReceiptVision Eco Score is a prototype engagement metric designed to encourage sustainable purchasing habits. It is calculated based on the ratio of highly recyclable materials (like paper and metal) to hard-to-recycle materials in your scanned receipts.
            </p>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              *Not a scientifically validated metric
            </p>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">Preferences</span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-300" />
            </button>
            
            <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">Help & Support</span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-300" />
            </button>

            <button className="w-full flex items-center justify-between p-6 hover:bg-red-50 transition-colors text-red-600 group">
              <div className="flex items-center gap-4">
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                <span className="font-medium">Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center pt-8 pb-4">
          <p className="text-sm text-gray-400 font-medium">ReceiptVision App v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

// Helper icons
function CalendarIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
