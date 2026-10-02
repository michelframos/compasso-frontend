import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  variant?: 'danger' | 'success' | 'warning' | 'default';
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  onClick,
}) => {
  const isDanger = variant === 'danger';

  return (
    <Card
      className={`overflow-hidden border-none shadow-sm bg-white hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:ring-1 hover:ring-indigo-100' : ''} ${className ?? ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{title}</p>
            <h3 className={`text-2xl font-black ${isDanger ? 'text-rose-600' : 'text-zinc-900'}`}>{value}</h3>

            {trend && trend.value > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {trend.isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {trend.value}%
                </div>
                <span className="text-xs text-zinc-400">vs mês anterior</span>
              </div>
            )}
          </div>

          <div className={`p-3 rounded-2xl ${isDanger ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
