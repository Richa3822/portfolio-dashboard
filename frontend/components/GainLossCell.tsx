export function GainLossCell({ value }: { value: number | null }) {
    if (value === null) {
      return <span className="text-gray-400">N/A</span>;
    }
  
    const isGain = value >= 0;
    return (
      <span className={isGain ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
        {isGain ? '+' : ''}
        {value.toFixed(2)}
      </span>
    );
  }