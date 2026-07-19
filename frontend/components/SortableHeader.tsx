import { SortKey, SortDirection } from '@/lib/portfolioUtils';

export function SortableHeader({
  label, sortKey, activeSortKey, direction, onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey | null;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeSortKey === sortKey;
  return (
    <th
      className="px-5 py-2 font-medium cursor-pointer select-none hover:text-gray-900"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive && <span className="text-gray-400">{direction === 'asc' ? '▲' : '▼'}</span>}
      </span>
    </th>
  );
}