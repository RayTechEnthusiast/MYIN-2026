"use client";

export function RadarChart({ values }: { values: { label: string; value: number }[] }) {
  const size = 280;
  const center = size / 2;
  const radius = 96;
  const point = (index: number, value = 100) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / values.length;
    const r = radius * (value / 100);
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r] as const;
  };
  const polygon = values.map((item, index) => point(index, item.value).join(",")).join(" ");
  const rings = [25, 50, 75, 100];

  return (
    <div className="radar-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-chart" aria-label="Student growth constellation">
        {rings.map((ring) => (
          <polygon key={ring} points={values.map((_, index) => point(index, ring).join(",")).join(" ")} className="radar-ring" />
        ))}
        {values.map((_, index) => {
          const [x, y] = point(index, 100);
          return <line key={index} x1={center} y1={center} x2={x} y2={y} className="radar-axis" />;
        })}
        <polygon points={polygon} className="radar-fill" />
        {values.map((item, index) => {
          const [x, y] = point(index, item.value);
          return <circle key={item.label} cx={x} cy={y} r="4" className="radar-dot" />;
        })}
      </svg>
      <div className="radar-legend">
        {values.map((item) => <span key={item.label}><strong>{item.value}</strong>{item.label}</span>)}
      </div>
    </div>
  );
}
