import React from 'react';
import { Lead, STAGES } from '../types';
import { User, Phone, Tag, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const getClassificationColor = (c?: string) => {
    switch (c) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-orange-400';
      case 'cold': return 'bg-blue-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <motion.div
      layoutId={lead.id}
      onClick={() => onClick(lead)}
      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-3 group relative overflow-hidden"
      whileHover={{ y: -2 }}
    >
      {lead.qualification?.classification && (
        <div className={cn("absolute top-0 right-0 w-8 h-1", getClassificationColor(lead.qualification.classification))} />
      )}
      
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={16} className="text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Phone size={10} className="mr-1" />
              {lead.phone}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {lead.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] uppercase font-medium">
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
        <div className="flex items-center text-[10px] text-gray-400">
          <Calendar size={10} className="mr-1" />
          {new Date(lead.updatedAt).toLocaleDateString('pt-BR')}
        </div>
        
        {lead.qualification?.score !== undefined && (
          <div className="text-[10px] font-bold text-indigo-500">
            {lead.qualification.score}% Viável
          </div>
        )}
      </div>
    </motion.div>
  );
};
