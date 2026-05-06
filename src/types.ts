export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  tags: string[];
  qualification?: Qualification;
  lastInteraction?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 
  | 'new' 
  | 'started' 
  | 'qualifying' 
  | 'viable' 
  | 'proposed' 
  | 'negotiating' 
  | 'closed' 
  | 'lost';

export interface Qualification {
  answers: Record<string, string>;
  score?: number;
  classification?: 'hot' | 'warm' | 'cold';
  analysis?: string;
  isViable?: boolean;
}

export interface Interaction {
  id: string;
  leadId: string;
  type: 'incoming' | 'outgoing' | 'system' | 'note';
  content: string;
  timestamp: string;
  author?: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
}

export const STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Novo Lead', color: 'bg-blue-100 text-blue-800' },
  { id: 'started', label: 'Atendimento', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'qualifying', label: 'Qualificação', color: 'bg-purple-100 text-purple-800' },
  { id: 'viable', label: 'Caso Viável', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'proposed', label: 'Proposta', color: 'bg-amber-100 text-amber-800' },
  { id: 'negotiating', label: 'Negociação', color: 'bg-orange-100 text-orange-800' },
  { id: 'closed', label: 'Fechado', color: 'bg-green-100 text-green-800' },
  { id: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800' },
];

export const QUALIFICATION_QUESTIONS = [
  { id: 'tipo_problema', question: 'Qual o principal motivo da sua saída ou problema na empresa?', options: ['Demissão sem justa causa', 'Pedido de demissão', 'Rescisão indireta', 'Acidente de trabalho', 'Outros'] },
  { id: 'tempo_trabalho', question: 'Quanto tempo você trabalhou lá?', type: 'text' },
  { id: 'recebeu_verbas', question: 'Você recebeu todas as verbas rescisórias?', options: ['Sim', 'Não', 'Parcialmente'] },
  { id: 'horas_extras', question: 'Fazia muitas horas extras sem receber?', options: ['Sim', 'Não'] },
  { id: 'sem_registro', question: 'Trabalhava sem carteira assinada?', options: ['Sim', 'Não'] },
];
