import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead, STAGES } from '../types';
import { BarChart3, Users, Target, CheckCircle2, TrendingUp, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leads'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
      setLeads(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = React.useMemo(() => [
    { label: 'Total de Leads', value: leads.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Casos Viáveis', value: leads.filter(l => l.status === 'viable').length, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Fechamentos', value: leads.filter(l => l.status === 'closed').length, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Conversão', value: leads.length ? `${Math.round((leads.filter(l => l.status === 'closed').length / leads.length) * 100)}%` : '0%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ], [leads]);

  const leadsPerStage = React.useMemo(() => STAGES.map(stage => ({
    label: stage.label,
    count: leads.filter(l => l.status === stage.id).length,
    color: stage.color
  })), [leads]);

  const recentLeads = React.useMemo(() => [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5), [leads]);

  return (
    <div className="p-8 space-y-8 bg-[#f8f9fa] min-h-screen">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Dashboard Executivo</h1>
        <p className="text-gray-500 mt-1">Visão geral do seu escritório jurídico</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4"
          >
            <div className={cn("p-4 rounded-2xl", stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <BarChart3 size={20} className="mr-2 text-indigo-500" />
              Leads por Etapa do Funil
            </h3>
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold">Atualizado agora</span>
          </div>
          
          <div className="space-y-4">
            {leadsPerStage.map((stage, idx) => {
              const percentage = leads.length ? (stage.count / leads.length) * 100 : 0;
              return (
                <div key={stage.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span className="text-gray-600">{stage.label}</span>
                    <span className="text-gray-900">{stage.count}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={cn("h-full rounded-full transition-all duration-1000", stage.color.split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500'))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Clock size={20} className="mr-2 text-indigo-500" />
            Atividade Recente
          </h3>
          <div className="space-y-6">
            {recentLeads.map((lead, idx) => (
              <div key={lead.id} className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-bold shrink-0">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{lead.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                    {STAGES.find(s => s.id === lead.status)?.label}
                  </p>
                </div>
                <div className="text-[10px] text-gray-300 font-medium">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
