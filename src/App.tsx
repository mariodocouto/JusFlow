import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Scale, 
  Grid, 
  Zap, 
  HelpCircle,
  Gavel,
  MessageCircle
} from 'lucide-react';
import { cn } from './lib/utils';
import { Dashboard } from './components/Dashboard';
import { LeadKanban } from './components/LeadKanban';
import { Lead } from './types';
import { LeadDetails } from './components/LeadDetails';
import { WhatsAppConfig } from './components/WhatsAppConfig';
import { Conversations } from './components/Conversations';
import { AnimatePresence, motion } from 'motion/react';

type View = 'dashboard' | 'kanban' | 'messages' | 'templates' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('messages');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Resumo' },
    { id: 'kanban', icon: Grid, label: 'Pipeline' },
    { id: 'messages', icon: MessageCircle, label: 'Conversas' },
    { id: 'templates', icon: Zap, label: 'Modelos' },
    { id: 'settings', icon: Settings, label: 'Conexão' },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col p-4 z-40">
        <div className="flex items-center space-x-3 px-3 py-6 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Gavel size={24} />
          </div>
          <span className="hidden lg:block text-xl font-black text-gray-900 tracking-tight">JusFlow <span className="text-indigo-600">CRM</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                currentView === item.id 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {currentView === item.id && (
                 <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
              )}
              <item.icon size={22} className={cn(currentView === item.id ? "text-indigo-600" : "group-hover:scale-110 transition-transform")} />
              <span className="hidden lg:block font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-8 border-t border-gray-100">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all font-bold text-sm">
            <HelpCircle size={22} />
            <span className="hidden lg:block">Suporte</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-500 transition-all font-bold text-sm">
            <LogOut size={22} />
            <span className="hidden lg:block">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto"
            >
              <Dashboard />
            </motion.div>
          )}

          {currentView === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-hidden"
            >
              <Conversations />
            </motion.div>
          )}

          {currentView === 'kanban' && (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-full overflow-hidden"
            >
              <LeadKanban onSelectLead={setSelectedLead} />
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-full overflow-y-auto"
            >
              <WhatsAppConfig />
            </motion.div>
          )}

          {currentView !== 'dashboard' && currentView !== 'kanban' && currentView !== 'messages' && currentView !== 'settings' && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
                <Settings size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Em Desenvolvimento</h2>
              <p className="text-gray-500 max-w-sm mt-2">Esta funcionalidade está sendo preparada para automatizar ainda mais seu escritório.</p>
              <button 
                onClick={() => setCurrentView('kanban')}
                className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100"
              >
                Voltar para o Pipeline
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lead Selection Sidebar */}
        <AnimatePresence>
          {selectedLead && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLead(null)}
                className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
              />
              <LeadDetails lead={selectedLead} onClose={() => setSelectedLead(null)} />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
