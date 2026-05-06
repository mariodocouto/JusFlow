import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  from: string;
  name: string;
  text: string;
  timestamp: string;
  status: 'received' | 'sent';
}

export const Conversations: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  // Busca mensagens do servidor a cada 3 segundos
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/whatsapp/messages');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Falha ao buscar mensagens:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!selectedChat || !inputText.trim()) return;

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: selectedChat, 
          message: inputText 
        }),
      });

      if (res.ok) {
        // Mock mensagem enviada para feedback imediato
        const newMessage: Message = {
          id: Math.random().toString(),
          from: 'me',
          name: 'Eu',
          text: inputText,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        // Opcionalmente, salvar no server também para persistir no array em memória
        setInputText('');
      }
    } catch (err) {
      alert('Erro ao enviar mensagem');
    }
  };

  // Agrupar mensagens por contato para a lista lateral
  const chats = Array.from(new Set(messages.map(m => m.from))).map(from => {
    const lastMsg = messages.find(m => m.from === from);
    return {
      id: from,
      name: lastMsg?.name || 'Cliente',
      lastMessage: lastMsg?.text || '',
      time: lastMsg?.timestamp || ''
    };
  });

  const filteredMessages = messages.filter(m => m.from === selectedChat || (m.status === 'sent' && selectedChat));

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Lista de Conversas */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Conversas</h2>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1">Sincronizado via Webhook</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={24} />
              </div>
              <p className="text-sm text-gray-500">Nenhuma conversa ativa ainda.</p>
              <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-wider">Envie um "Oi" para seu número de teste</p>
            </div>
          ) : (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={cn(
                  "w-full p-6 text-left flex items-start space-x-4 border-b border-gray-50 transition-all",
                  selectedChat === chat.id ? "bg-indigo-50/50" : "hover:bg-gray-50"
                )}
              >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 font-black">
                  {chat.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                      {new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate leading-relaxed">{chat.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Janela de Chat */}
      <div className="flex-1 flex flex-col bg-gray-50/50 relative">
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
             <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <MessageCircle size={64} className="text-gray-200" />
             </div>
             <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Selecione uma conversa</h3>
             <p className="text-sm text-gray-400 max-w-xs mt-2">Clique em um contato ao lado para visualizar o histórico de mensagens.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">
                  {chats.find(c => c.id === selectedChat)?.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{chats.find(c => c.id === selectedChat)?.name}</h3>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] text-gray-400 uppercase font-black">Online agora</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse">
              <AnimatePresence initial={false}>
                {filteredMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex flex-col max-w-[70%]",
                      msg.status === 'sent' ? "self-end items-end" : "self-start items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-3xl text-sm leading-relaxed",
                      msg.status === 'sent' 
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100" 
                        : "bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm"
                    )}>
                      {msg.text}
                    </div>
                    <div className="mt-1.5 flex items-center space-x-1 text-[10px] text-gray-400 font-bold px-2 uppercase">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="flex items-center space-x-4 bg-gray-50 rounded-2xl p-2 border border-gray-100 focus-within:border-indigo-200 transition-all">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escreva sua resposta..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
