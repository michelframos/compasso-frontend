import React from 'react';

export const PrintFooter: React.FC = () => {
  return (
    <div className="hidden print:block fixed bottom-0 left-0 right-0 py-4 border-t border-zinc-100 bg-white">
      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <div>Compasso - Gestão Musical</div>
        <div>
          Documento Interno - Confidencial
        </div>
      </div>
    </div>
  );
};
