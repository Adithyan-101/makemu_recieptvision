import { Scan, Cpu, Map, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

export default function ProcessSteps() {
  const steps = [
    {
      icon: <Scan className="w-8 h-8 text-blue-600" />,
      bg: 'bg-blue-100',
      title: 'SCAN',
      desc: 'Upload a photo of your receipt.'
    },
    {
      icon: <Cpu className="w-8 h-8 text-purple-600" />,
      bg: 'bg-purple-100',
      title: 'PREDICT',
      desc: 'AI extracts items and determines waste category.'
    },
    {
      icon: <Map className="w-8 h-8 text-emerald-600" />,
      bg: 'bg-emerald-100',
      title: 'PLAN',
      desc: 'Find nearby recycling and disposal facilities.'
    },
    {
      icon: <Trash2 className="w-8 h-8 text-orange-600" />,
      bg: 'bg-orange-100',
      title: 'DISPOSE',
      desc: 'Follow the plan and track your eco score.'
    }
  ];

  return (
    <div className="w-full py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 max-w-5xl mx-auto px-4">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col md:flex-row items-center w-full md:w-auto">
            
            {/* Step Card */}
            <div className="flex flex-col items-center text-center max-w-[200px] transition-opacity duration-500 opacity-100">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${step.bg} shadow-sm`}>
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-900 tracking-wide mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="my-6 md:my-0 md:mx-4 flex-shrink-0 text-gray-300">
                <ChevronDown className="w-8 h-8 md:hidden block" />
                <ChevronRight className="w-8 h-8 hidden md:block" />
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}
