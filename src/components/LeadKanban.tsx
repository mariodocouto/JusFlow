import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  updateDoc, 
  doc, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead, LeadStatus, STAGES } from '../types';
import { LeadCard } from './LeadCard';
import { Plus, Search, Filter, Loader2, MessageSquarePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LeadKanbanProps {
  onSelectLead: (lead: Lead) => void;
}

export const LeadKanban: React.FC<LeadKanbanProps> = ({ onSelectLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '' });

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(leadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const moveLead = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao mover lead:", error);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;

    try {
      await addDoc(collection(db, 'leads'), {
        ...newLead,
        status: 'new',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setNewLead({ name: '', phone: '' });
      setShowAddLead(false);
    } catch (error) {
      console.error("Erro ao adicionar lead:", error);
    }
  };

  const filteredLeads = React.useMemo(() => {
    if (!searchTerm) return leads;
    const term = searchTerm.toLowerCase();
    return leads.filter(l => 
      l.name.toLowerCase().includes(term) || 
      l.phone.includes(term)
    );
  }, [leads, searchTerm]);

  const leadsByStage = React.useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    STAGES.forEach(s => grouped[s.id] = []);
    filteredLeads.forEach(l => {
      if (grouped[l.status]) grouped[l.status].push(l);
    });
    return grouped;
  }, [filteredLeads]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      {/* Header */}
      <header className="p-6 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Pipeline de Leads</h1>
          <p className="text-sm text-gray-500">Gerencie sua captação trabalhista</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddLead(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
          >
            <Plus size={18} className="mr-2" />
            Novo Lead
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto p-6 scrollbar-hide">
        <div className="flex space-x-6 h-full min-w-max">
          {STAGES.map(stage => {
            const stageLeads = leadsByStage[stage.id] || [];
            return (
              <div key={stage.id} className="w-[320px] flex flex-col space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider", stage.color)}>
                      {stage.label}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">{stageLeads.length}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 min-h-[500px]">
                  {stageLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onClick={onSelectLead} />
                  ))}
                  
                  {/* Drop target visual hint or empty state style can go here */}
                  {stageLeads.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400">
                       <p className="text-xs">Nenhum lead aqui</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Lead Modal Overlay */}
      <AnimatePresence>
        {showAddLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddLead(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Novo Potencial Cliente</h2>
              <form onSubmit={handleAddLead} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 transition-all"
                    placeholder="Ex: João da Silva"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 transition-all"
                    placeholder="Ex: 5511999999999"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddLead(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-bold"
                  >
                    Cadastrar Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
