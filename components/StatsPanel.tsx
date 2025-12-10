
import React, { useMemo } from 'react';

interface StatsPanelProps {
  stats: {
    integrity: number;
    career: number;
    rigor: number;
    collaboration: number;
    wellbeing: number;
  };
  turn: number;
  totalTurns: number;
  role: string;
  mentorMessage?: string;
}

const RadarChart: React.FC<{ 
  data: { label: string; value: number; color: string }[] 
}> = ({ data }) => {
  const size = 240;
  const center = size / 2;
  const radius = size * 0.35;
  const levels = 4;
  
  // Calculate points for the polygon
  const angleStep = (Math.PI * 2) / data.length;
  
  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2; // Start at -90deg (top)
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const polygonPoints = data.map((d, i) => {
    const coords = getCoordinates(d.value, i);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  // Create grid lines
  const gridLines = [];
  for (let i = 1; i <= levels; i++) {
    const levelRadius = (radius / levels) * i;
    const points = data.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
    }).join(' ');
    gridLines.push(points);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid Polygons */}
          {gridLines.map((points, i) => (
            <polygon 
              key={i} 
              points={points} 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth="1" 
            />
          ))}
          
          {/* Axis Lines */}
          {data.map((_, i) => {
            const coords = getCoordinates(100, i);
            return (
              <line 
                key={i} 
                x1={center} 
                y1={center} 
                x2={coords.x} 
                y2={coords.y} 
                stroke="#e2e8f0" 
                strokeWidth="1" 
              />
            );
          })}

          {/* Data Polygon */}
          <polygon 
            points={polygonPoints} 
            fill="rgba(79, 70, 229, 0.2)" 
            stroke="#4f46e5" 
            strokeWidth="2"
            className="transition-all duration-1000 ease-out"
          />

          {/* Points and Labels */}
          {data.map((d, i) => {
            const coords = getCoordinates(115, i); // Labels slightly outside
            const dotCoords = getCoordinates(d.value, i);
            
            return (
              <g key={i}>
                <circle 
                  cx={dotCoords.x} 
                  cy={dotCoords.y} 
                  r="4" 
                  fill={d.color} 
                  className="transition-all duration-1000 ease-out"
                />
                <text 
                  x={coords.x} 
                  y={coords.y} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="text-[10px] font-bold fill-slate-500 uppercase tracking-wider"
                >
                  {d.label}
                </text>
                <text 
                   x={coords.x} 
                   y={coords.y + 12} 
                   textAnchor="middle" 
                   dominantBaseline="middle"
                   className="text-[10px] font-mono fill-slate-400"
                >
                  {Math.round(d.value)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, turn, totalTurns, role, mentorMessage }) => {
  const chartData = [
    { label: 'Integrity', value: stats.integrity, color: '#10b981' }, // Emerald
    { label: 'Career', value: stats.career, color: '#3b82f6' }, // Blue
    { label: 'Rigor', value: stats.rigor, color: '#8b5cf6' }, // Violet
    { label: 'Collab', value: stats.collaboration, color: '#f59e0b' }, // Amber
    { label: 'Wellbeing', value: stats.wellbeing, color: '#ec4899' }, // Pink
  ];

  // Determine Tip Style based on stats logic, but use provided text
  const tipStyleType = useMemo(() => {
    const values = Object.values(stats) as number[];
    const minVal = Math.min(...values);

    if (minVal < 35) return 'warning'; // Red/Critical
    if (minVal < 50) return 'caution'; // Orange/Risk
    return 'info'; // Blue/Advice
  }, [stats]);

  // Styles based on tip type
  const styles = {
    info: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      text: 'text-indigo-800',
      title: 'text-indigo-900',
      titleText: 'Mentor Tip',
      icon: (
        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    caution: {
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      text: 'text-orange-800',
      title: 'text-orange-900',
      titleText: 'Risk Analysis',
      icon: (
        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-800',
      title: 'text-red-900',
      titleText: 'Critical Warning',
      icon: (
        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const currentStyle = styles[tipStyleType];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit sticky top-24 animate-fade-in">
      <div className="mb-2 pb-4 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Researcher Profile</h3>
        <p className="text-lg font-bold text-indigo-900 capitalize">{role}</p>
        <p className="text-sm text-slate-500">Turn {turn} / {totalTurns}</p>
      </div>

      <div className="-ml-2">
        <RadarChart data={chartData} />
      </div>

      <div className={`mt-4 p-4 rounded-lg border ${currentStyle.bg} ${currentStyle.border} transition-colors duration-500`}>
        <h4 className={`flex items-center gap-2 text-xs font-bold uppercase mb-2 ${currentStyle.title}`}>
           {currentStyle.icon}
           {/* If message is provided, we can either use generic title or try to rely on LLM. 
               We will use generic titles based on severity for UI consistency. */}
           {currentStyle.titleText}
        </h4>
        <p className={`text-xs leading-relaxed ${currentStyle.text}`}>
           {mentorMessage || "Analyzing your research profile..."}
        </p>
      </div>
    </div>
  );
};

export default StatsPanel;
