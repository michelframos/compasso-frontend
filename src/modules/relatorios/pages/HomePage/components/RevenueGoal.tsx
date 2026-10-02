import React from 'react';
import { Button } from '@/shared/components/ui/button';

export const RevenueGoal: React.FC = () => {
  return (
    <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <h3 className="text-lg font-bold mb-3 relative z-10">Meta de Faturamento</h3>
      <p className="text-indigo-100 text-xs mb-6 relative z-10 text-balance">Você atingiu 85% da sua meta anual de faturamento.</p>
      
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-xl font-black">
          <span>R$ 45.920</span>
          <span className="text-indigo-300 text-sm mt-1">/ 50k</span>
        </div>
        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white w-[85%] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
        </div>
      </div>

      <Button className="w-full mt-8 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl h-10 text-sm font-bold transition-all">
        Ajustar Metas
      </Button>
    </div>
  );
};
