'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { SectorSummary } from '@/lib/portfolioUtils';

export function SectorChart({ data }: { data: SectorSummary[] }) {
  return (
    <div className="w-full h-80 mb-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sector" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : String(value ?? ''))} />
          <Legend />
          <Bar dataKey="investment" fill="#6366f1" name="Investment" />
          <Bar dataKey="presentValue" fill="#10b981" name="Present Value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}