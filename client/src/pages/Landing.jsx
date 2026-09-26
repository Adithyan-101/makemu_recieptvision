import { Link } from 'react-router-dom';
import { Scan, Brain, ClipboardList, MapPin, ArrowRight, Recycle, Lightbulb, Leaf, ChevronRight, Camera, Cpu, ListChecks } from 'lucide-react';

export default function Landing() {
  const steps = [
    {
      title: 'SCAN',
      description: 'Upload or photograph your grocery receipt',
      icon1: <Scan className="w-8 h-8 text-emerald-600" />,
      icon2: <Camera className="w-6 h-6 text-emerald-400 absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm" />
    },
    {
      title: 'PREDICT',
      description: 'AI identifies products and predicts packaging waste',
      icon1: <Brain className="w-8 h-8 text-blue-600" />,
      icon2: <Cpu className="w-6 h-6 text-blue-400 absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm" />
    },
    {
      title: 'PLAN',
      description: 'Get a personalized waste disposal plan',
      icon1: <ClipboardList className="w-8 h-8 text-amber-600" />,
      icon2: <ListChecks className="w-6 h-6 text-amber-400 absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm" />
    },
    {
      title: 'DISPOSE',
      description: 'Find nearby recycling centres on the map',
      icon1: <MapPin className="w-8 h-8 text-red-600" />,
      icon2: <Recycle className="w-6 h-6 text-red-400 absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-8 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold tracking-wide uppercase shadow-sm">
            <Leaf className="w-4 h-4 mr-2" />
            Smarter waste management
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Turn your receipt into a <span className="text-emerald-600">waste plan.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10">
            ReceiptVision predicts the waste your purchases are likely to create and helps you dispose of it responsibly. Start before the waste even happens.
          </p>
          <div className="flex justify-center">
            <Link
              to="/scan"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Scan a Receipt
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-4 text-lg text-gray-500">From purchase to responsible disposal in four simple steps.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 relative">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-100 z-0"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center text-center max-w-xs group">
                <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center mb-6 relative group-hover:shadow-lg transition-shadow duration-300">
                  {step.icon1}
                  {step.icon2}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="lg:hidden mt-8 text-gray-300">
                    <ChevronRight className="w-8 h-8 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Callout */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50 blur-2xl"></div>
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="flex-shrink-0 bg-emerald-100 p-4 rounded-full">
                <Lightbulb className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">A new approach to waste</h3>
                <p className="text-lg text-gray-700 mb-6 font-medium italic">
                  "Most waste solutions start after waste is created. ReceiptVision starts at the point of purchase."
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-500">
                    <span className="font-semibold w-24">Traditional:</span>
                    <span className="flex-1 flex items-center gap-2">Waste <ArrowRight className="w-4 h-4" /> Identify <ArrowRight className="w-4 h-4" /> Dispose</span>
                  </div>
                  <div className="flex items-center gap-4 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-800">
                    <span className="font-semibold w-24">ReceiptVision:</span>
                    <span className="flex-1 flex items-center gap-2 font-medium">Purchase <ArrowRight className="w-4 h-4" /> Predict <ArrowRight className="w-4 h-4" /> Plan <ArrowRight className="w-4 h-4" /> Dispose</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-gray-900 text-center">
        <p className="text-gray-400 font-medium flex items-center justify-center gap-2">
          Built for a better planet <span className="text-xl">🌍</span>
        </p>
      </footer>
    </div>
  );
}
