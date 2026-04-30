// src/components/CtaCard.tsx
import React from 'react';

interface CtaCardProps {
    icon: string;
    title: string;
    description: string;
}

const CtaCard: React.FC<CtaCardProps> = ({ icon, title, description }) => {
  return (
    <div 
        className="
            bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border-t-2 border-red-500/50 
            hover:bg-white/20 transition duration-300 transform hover:scale-[1.02] 
            flex flex-col items-start h-full
        "
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
};

export default CtaCard;
