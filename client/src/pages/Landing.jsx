import { Link } from 'react-router-dom';
import { Scan, Brain, ClipboardList, MapPin, ArrowRight, Recycle, Lightbulb, Leaf, ChevronRight, Camera, Cpu, ListChecks, Sparkles, Shield, TrendingUp } from 'lucide-react';

export default function Landing() {
  const steps = [
    {
      title: 'SCAN',
      description: 'Upload or photograph your grocery receipt',
      icon: Scan,
      accent: Camera,
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      delay: '0.1s'
    },
    {
      title: 'PREDICT',
      description: 'AI identifies products and predicts packaging waste',
      icon: Brain,
      accent: Cpu,
      color: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      delay: '0.2s'
    },
    {
      title: 'PLAN',
      description: 'Get a personalized waste disposal plan',
      icon: ClipboardList,
      accent: ListChecks,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      delay: '0.3s'
    },
    {
      title: 'DISPOSE',
      description: 'Find nearby recycling centres on the map',
      icon: MapPin,
      accent: Recycle,
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      delay: '0.4s'
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Analysis',
      description: 'Uses Google Gemini to read and understand receipt contents automatically.',
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      icon: Shield,
      title: 'Accurate Classification',
      description: 'Matches products against a curated database with 90%+ confidence.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Impact',
      description: 'Monitor your eco score and see waste trends over time.',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-teal-200/25 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-100/80 text-emerald-800 text-sm font-bold tracking-wide uppercase backdrop-blur-sm border border-emerald-200/50">
              <Leaf className="w-4 h-4" />
              Smarter waste management
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>

          <h1 className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]" style={{ animationDelay: '0.2s' }}>
            Turn your receipt into a{' '}
            <span className="text-gradient">waste plan.</span>
          </h1>

          <p className="animate-fade-in-up mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed mb-10" style={{ animationDelay: '0.3s' }}>
            ReceiptVision predicts the waste your purchases will create and helps you dispose of it responsibly. 
            <span className="font-semibold text-gray-700"> Start before the waste even happens.</span>
          </p>

          <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/scan"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
            >
              Scan a Receipt
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-3">How it works</p>
            <h2 className="text-4xl font-black text-gray-900">Four simple steps</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">From purchase to responsible disposal — let AI handle the planning.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 lg:gap-4 relative">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-emerald-200 via-blue-200 via-amber-200 to-rose-200 z-0" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              const AccentIcon = step.accent;
              return (
                <div 
                  key={index} 
                  className="animate-fade-in-up relative z-10 flex flex-col items-center text-center flex-1 group"
                  style={{ animationDelay: step.delay }}
                >
                  <div className="relative mb-6">
                    <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100">
                      <AccentIcon className={`w-5 h-5 ${step.text}`} />
                    </div>
                    {/* Step number */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-black shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 tracking-wide">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[220px]">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="lg:hidden mt-6 text-gray-300">
                      <ChevronRight className="w-6 h-6 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="animate-fade-in-up card-premium p-8 rounded-3xl"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-5`}>
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovation Callout */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900 rounded-[2rem] p-10 md:p-14 shadow-2xl overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
              <div className="flex-shrink-0 p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                <Lightbulb className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">A new approach to waste</h3>
                <p className="text-lg text-gray-300 mb-8 italic leading-relaxed">
                  "Most waste solutions start after waste is created. ReceiptVision starts at the point of purchase."
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 text-gray-400">
                    <span className="font-bold text-sm w-24 flex-shrink-0">Traditional:</span>
                    <span className="flex items-center gap-2 text-sm">Waste <ArrowRight className="w-3.5 h-3.5" /> Identify <ArrowRight className="w-3.5 h-3.5" /> Dispose</span>
                  </div>
                  <div className="flex items-center gap-4 bg-emerald-500/15 p-4 rounded-xl border border-emerald-500/20 text-emerald-300">
                    <span className="font-bold text-sm w-24 flex-shrink-0">ReceiptVision:</span>
                    <span className="flex items-center gap-2 text-sm font-semibold">Purchase <ArrowRight className="w-3.5 h-3.5" /> Predict <ArrowRight className="w-3.5 h-3.5" /> Plan <ArrowRight className="w-3.5 h-3.5" /> Dispose</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50/80">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Ready to start?</h2>
          <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto">Scan your first receipt and discover how your purchases impact the environment.</p>
          <Link
            to="/scan"
            className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Scan className="mr-2 w-5 h-5" />
            Scan a Receipt
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">ReceiptVision</span>
        </div>
        <p className="text-gray-400 font-medium flex items-center justify-center gap-2">
          Built for a better planet <span className="text-xl">🌍</span>
        </p>
      </footer>
    </div>
  );
}
