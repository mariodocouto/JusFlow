import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, STAGES, QUALIFICATION_QUESTIONS, Interaction } from '../types';
import { 
  X, MessageCircle, Info, TrendingUp, History, 
  Send, Bot, CheckCircle2, AlertCircle, Trash2, Tag as TagIcon,
  Phone, Move, Zap, ChevronRight
} from 'lucide-react';

const STAGE_MESSAGES: Record<string, string> = {
  new: "Olá! Recebemos sua mensagem sobre seu problema trabalhista. Podemos conversar agora para eu entender melhor seu caso?",
  started: "Olá, já estamos analisando as informações que você passou. Gostaria de agendar uma breve chamada?",
  qualifying: "Poderia responder estas perguntas rápidas para avaliarmos a viabilidade do seu processo?",
  viable: "Tenho boas notícias! Analisamos seu caso e existe uma grande chance de sucesso. Quando podemos assinar o contrato?",
  proposed: "Enviei a proposta de honorários para seu e-mail. Conseguiu dar uma olhada nela?",
  negotiating: "Ainda ficou com alguma dúvida sobre os valores? Estamos à disposição para facilitar.",
  closed: "Parabéns! Nosso contrato foi assinado. Em breve iniciaremos o protocolo da petição inicial.",
  lost: "Infelizmente, no momento não conseguimos seguir com seu caso. Mas ficamos à disposição no futuro."
};
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { formatWhatsAppLink, cn } from '../lib/utils';
import { analyzeLeadViability, summarizeConversation } from '../services/geminiService';

interface LeadDetailsProps {
  lead: Lead;
  onClose: () => void;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'qualification' | 'history'>('info');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'leads', lead.id, 'interactions'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Interaction[];
      setInteractions(data);
    });
    return () => unsubscribe();
  }, [lead.id]);

  const updateLead = async (updates: Partial<Lead>) => {
    try {
      await updateDoc(doc(db, 'leads', lead.id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addDoc(collection(db, 'leads', lead.id, 'interactions'), {
        leadId: lead.id,
        type: 'note',
        content: newNote,
        timestamp: new Date().toISOString(),
        author: 'Advogado'
      });
      setNewNote('');
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
    }
  };

  const handleQualify = async (questionId: string, answer: string) => {
    const prevAnswers = lead.qualification?.answers || {};
    const newAnswers = { ...prevAnswers, [questionId]: answer };
    await updateLead({
      qualification: {
        ...(lead.qualification || {}),
        answers: newAnswers
      }
    });
  };

  const runAiAnalysis = async () => {
    if (!lead.qualification?.answers) return;
    setIsAnalyzing(true);
    const result = await analyzeLeadViability(lead.qualification.answers);
    await updateLead({
      qualification: {
        ...lead.qualification,
        ...result
      }
    });
    setIsAnalyzing(false);
  };

  const generateSummary = async () => {
    setIsAnalyzing(true);
    const res = await summarizeConversation(interactions);
    setSummary(res);
    setIsAnalyzing(false);
  };

  const navigateToStatus = (status: LeadStatus) => {
    updateLead({ status });
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            {lead.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Phone size={14} className="mr-1" />
              {lead.phone}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-2 border-b border-gray-100 bg-gray-50/20">
        {[
          { id: 'info', icon: Info, label: 'Geral' },
          { id: 'qualification', icon: TrendingUp, label: 'Qualificação' },
          { id: 'history', icon: History, label: 'Histórico' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
              activeTab === tab.id 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <a
                  href={formatWhatsAppLink(lead.phone, `Olá ${lead.name}, aqui é do escritório de advocacia. Podemos conversar sobre seu caso?`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 font-bold"
                >
                  <MessageCircle size={20} />
                  <span>WhatsApp</span>
                </a>
                <button 
                  onClick={() => setActiveTab('qualification')}
                  className="flex items-center justify-center space-x-2 py-4 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-all font-bold"
                >
                  <TrendingUp size={20} />
                  <span>Qualificar</span>
                </button>
              </div>

              {/* Recommended Message */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                   <Zap size={12} className="mr-1" /> Mensagem Recomendada (Etapa)
                </h3>
                <div 
                  onClick={() => {
                    const msg = STAGE_MESSAGES[lead.status] || "Olá!";
                    window.open(formatWhatsAppLink(lead.phone, msg), '_blank');
                  }}
                  className="p-4 bg-white border border-dashed border-indigo-200 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-all group"
                >
                  <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-indigo-600">
                    "{STAGE_MESSAGES[lead.status] || 'Selecione uma etapa para ver recomendações.'}"
                  </p>
                  <div className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center">
                    Enviar via WhatsApp <ChevronRight size={10} className="ml-1" />
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                   <Move size={12} className="mr-1" /> Mover para Etapa
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {STAGES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => navigateToStatus(s.id)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-left border transition-all truncate",
                        lead.status === s.id 
                          ? "bg-white border-indigo-200 text-indigo-700 shadow-sm font-bold ring-2 ring-indigo-50"
                          : "bg-white border-gray-200 text-gray-600 hover:border-indigo-200"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                   <span>Resumo do Caso</span>
                   <button 
                     onClick={generateSummary}
                     disabled={isAnalyzing}
                     className="text-xs text-indigo-600 hover:underline flex items-center"
                    >
                     <Bot size={12} className="mr-1" /> {isAnalyzing ? 'Resumindo...' : 'Gerar com IA'}
                   </button>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-sm text-gray-700 leading-relaxed min-h-[80px]">
                  {summary || lead.qualification?.analysis || "Nenhuma análise disponível. Use a aba de qualificação para gerar."}
                </div>
              </div>

              {/* Tags */}
              <div>
                 <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <TagIcon size={16} className="mr-2" /> Tags
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {lead.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium uppercase tracking-tight">
                        {tag}
                      </span>
                    ))}
                    <button className="px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-xs hover:bg-gray-200 transition-colors">
                      + Adicionar
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'qualification' && (
            <motion.div 
              key="qual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Perguntas de Qualificação</h3>
                <button 
                  onClick={runAiAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center disabled:opacity-50"
                >
                  <Bot size={14} className="mr-2" />
                  {isAnalyzing ? 'Processando...' : 'Analisar Viabilidade'}
                </button>
              </div>

              <div className="space-y-4">
                {QUALIFICATION_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 flex-shrink-0 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200">{idx + 1}</span>
                      <p className="text-sm font-medium text-gray-800 leading-tight">{q.question}</p>
                    </div>
                    
                    {q.options ? (
                      <div className="grid grid-cols-2 gap-2 pl-9">
                        {q.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleQualify(q.id, opt)}
                            className={cn(
                              "px-3 py-2 rounded-xl text-xs text-left border transition-all",
                              lead.qualification?.answers?.[q.id] === opt
                                ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-9">
                        <textarea 
                          className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          placeholder="Digite a resposta..."
                          rows={2}
                          value={lead.qualification?.answers?.[q.id] || ''}
                          onChange={(e) => handleQualify(q.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {lead.qualification?.score !== undefined && (
                <div className={cn(
                  "p-5 rounded-2xl border flex items-center space-x-4",
                  lead.qualification.isViable ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                )}>
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-current flex items-center justify-center font-black text-xl">
                    {lead.qualification.score}%
                  </div>
                  <div>
                    <h4 className="font-bold flex items-center uppercase tracking-wide text-xs">
                      {lead.qualification.isViable ? <CheckCircle2 size={16} className="mr-1" /> : <AlertCircle size={16} className="mr-1" />}
                      Análise de Inteligência
                    </h4>
                    <p className="text-sm leading-tight mt-1">{lead.qualification.analysis}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
               key="history"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="flex flex-col h-full space-y-4"
             >
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea 
                  className="w-full text-sm p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 min-h-[100px]"
                  placeholder="Escrever uma nota interna ou registrar interação..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2">
                  <Send size={18} />
                  <span>Salvar Registro</span>
                </button>
              </form>

              <div className="space-y-6 pt-4 border-t border-gray-100">
                {interactions.map(interaction => (
                  <div key={interaction.id} className="relative pl-8 pb-6 group">
                     {/* Timeline element */}
                     <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-indigo-200" />
                     <div className="absolute left-0 top-3 bottom-0 w-[1px] bg-gray-100" />

                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                           {interaction.type === 'note' ? '📚 Nota Interna' : '💬 Mensagem'} 
                           {interaction.author && ` • ${interaction.author}`}
                        </span>
                        <span className="text-[10px] text-gray-400">
                           {new Date(interaction.timestamp).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </span>
                     </div>
                     <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {interaction.content}
                     </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
