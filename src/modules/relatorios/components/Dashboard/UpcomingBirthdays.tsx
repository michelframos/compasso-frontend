import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Cake, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BirthdayItem } from './hooks/useDashboardData';

interface UpcomingBirthdaysProps {
  birthdays: BirthdayItem[];
  highlightToday?: boolean;
}

export const UpcomingBirthdays: React.FC<UpcomingBirthdaysProps> = ({ birthdays, highlightToday = true }) => {
  const navigate = useNavigate();
  const today = new Date().getDate();

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Cake className="w-5 h-5 text-pink-500" />
          Aniversariantes do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className={birthdays.length === 0 ? '' : 'max-h-[250px] overflow-y-auto custom-scrollbar'}>
          <div className="p-4 space-y-3">
            {birthdays.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">Nenhum aniversariante este mês.</p>
            ) : (
              birthdays.map((item) => {
                const isToday = highlightToday && item.day === today;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/alunos/${item.id}`)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                      isToday
                        ? 'border-pink-200 bg-pink-50/80'
                        : 'border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">
                          {isToday ? 'Hoje' : item.type}
                        </p>
                      </div>
                    </div>
                    <div className={`text-center min-w-[40px] px-2 py-1 rounded-lg ${isToday ? 'bg-pink-100' : 'bg-pink-50'}`}>
                      <span className="text-xs font-black text-pink-600">Dia {item.day}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
