interface StatsCardProps {
  title: string;
  value: number;
  unit: string;
  description?: string;
}

export function StatsCard({ title, value, unit, description }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold">
        {value}
        <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>
      </p>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}
