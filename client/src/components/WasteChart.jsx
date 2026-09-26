import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function WasteChart({ data, height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100"
        style={{ height }}
      >
        <p className="text-gray-400 font-medium">No waste data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
          <p className="font-semibold text-gray-800">{data.category}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-bold text-gray-900">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#9CA3AF'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
